import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch single asset
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PUT: Update asset
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);
   
    const body = await request.json();
    const { nama, kode_aset, lokasi_lantai, kondisi, status, jumlah } = body;

    // Validation
    if (!nama || !kode_aset || !lokasi_lantai || !kondisi || !status) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate jumlah
    const qty = parseInt(jumlah) || 1;
    if (qty < 1) {
      return NextResponse.json(
        { success: false, error: 'Jumlah minimal 1' },
        { status: 400 }
      );
    }

    // Transaction: Update Asset + Create Log
    const result = await prisma.$transaction(async (tx) => {
      // Fetch old data
      const oldAsset = await tx.asset.findUnique({
        where: { id: assetId }
      });

      if (!oldAsset) {
        throw new Error('Asset not found');
      }

      // PERBAIKAN: Check if kode_aset changed and already used by another asset on SAME floor
      if (kode_aset !== oldAsset.kode_aset || parseInt(lokasi_lantai) !== oldAsset.lokasi_lantai) {
        const existing = await tx.asset.findFirst({
          where: {
            kode_aset: kode_aset,
            lokasi_lantai: parseInt(lokasi_lantai),
            id: { not: assetId } // exclude current asset
          }
        });
        
        if (existing) {
          throw new Error('Kode aset sudah digunakan di lantai ini');
        }
      }

      // Update asset
      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          nama,
          kode_aset,
          lokasi_lantai: parseInt(lokasi_lantai),
          kondisi,
          status,
          jumlah: qty
        }
      });

      // Determine log action and description
      const newLantai = parseInt(lokasi_lantai);
      let action = 'UPDATE';
      let deskripsi = `Aset "${nama}" diperbarui`;
      let lantai_asal = null;
      let lantai_tujuan = null;

      // Check if location changed (MOVE action)
      if (oldAsset.lokasi_lantai !== newLantai) {
        action = 'MOVE';
        lantai_asal = oldAsset.lokasi_lantai;
        lantai_tujuan = newLantai;
        deskripsi = `Aset "${nama}" dipindahkan dari Lantai ${lantai_asal} ke Lantai ${lantai_tujuan} (${qty} unit)`;
      }

      // Create log
      await tx.activityLog.create({
        data: {
          asset_id: assetId,
          action,
          lantai_asal,
          lantai_tujuan,
          jumlah: qty,
          deskripsi
        }
      });

      return updatedAsset;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE: Delete asset
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    // Transaction: Create Log + Delete Asset
    await prisma.$transaction(async (tx) => {
      // Fetch asset before delete
      const asset = await tx.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      // Create log
      await tx.activityLog.create({
        data: {
          asset_id: assetId,
          action: 'DELETE',
          jumlah: asset.jumlah,
          deskripsi: `Aset "${asset.nama}" (${asset.kode_aset}) dihapus dari Lantai ${asset.lokasi_lantai} sebanyak ${asset.jumlah} unit`
        }
      });

      // Delete asset (logs will be cascade deleted)
      await tx.asset.delete({
        where: { id: assetId }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}