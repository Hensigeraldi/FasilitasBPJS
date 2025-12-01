import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: Move asset with quantity
export async function POST(request) {
  try {
    const body = await request.json();
    const { assetId, targetLantai, jumlahPindah } = body;

    // Validation
    if (!assetId || !targetLantai || !jumlahPindah) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const qty = parseInt(jumlahPindah);
    const targetFloor = parseInt(targetLantai);

    if (qty < 1) {
      return NextResponse.json(
        { success: false, error: 'Jumlah yang dipindahkan minimal 1' },
        { status: 400 }
      );
    }

    // Transaction: Move asset with quantity logic
    const result = await prisma.$transaction(async (tx) => {
      // Get source asset
      const sourceAsset = await tx.asset.findUnique({
        where: { id: parseInt(assetId) }
      });

      if (!sourceAsset) {
        throw new Error('Aset tidak ditemukan');
      }

      // Check if enough quantity
      if (sourceAsset.jumlah < qty) {
        throw new Error(`Jumlah tidak cukup. Tersedia: ${sourceAsset.jumlah} unit`);
      }

      // Check if moving to same floor
      if (sourceAsset.lokasi_lantai === targetFloor) {
        throw new Error('Lantai tujuan sama dengan lantai asal');
      }

      const lantaiAsal = sourceAsset.lokasi_lantai;

      // Check if asset with same kode_aset exists on target floor
      const targetAsset = await tx.asset.findFirst({
        where: {
          kode_aset: sourceAsset.kode_aset,
          lokasi_lantai: targetFloor
        }
      });

      if (targetAsset) {
        // If exists, add quantity to target
        await tx.asset.update({
          where: { id: targetAsset.id },
          data: {
            jumlah: targetAsset.jumlah + qty
          }
        });
      } else {
        // If not exists, create new asset on target floor
        // Dengan schema baru, kode_aset bisa sama di lantai berbeda
        await tx.asset.create({
          data: {
            nama: sourceAsset.nama,
            kode_aset: sourceAsset.kode_aset, // BISA SAMA kode aset
            lokasi_lantai: targetFloor,
            kondisi: sourceAsset.kondisi,
            status: sourceAsset.status,
            jumlah: qty
          }
        });
      }

      // Reduce or delete source asset
      if (sourceAsset.jumlah === qty) {
        // Delete if moving all
        await tx.asset.delete({
          where: { id: sourceAsset.id }
        });
      } else {
        // Reduce quantity
        await tx.asset.update({
          where: { id: sourceAsset.id },
          data: {
            jumlah: sourceAsset.jumlah - qty
          }
        });
      }

      // Create activity log
      await tx.activityLog.create({
        data: {
          asset_id: sourceAsset.id,
          action: 'MOVE',
          lantai_asal: lantaiAsal,
          lantai_tujuan: targetFloor,
          jumlah: qty,
          deskripsi: `Aset "${sourceAsset.nama}" (${sourceAsset.kode_aset}) dipindahkan dari Lantai ${lantaiAsal} ke Lantai ${targetFloor} sebanyak ${qty} unit`
        }
      });

      return {
        assetName: sourceAsset.nama,
        from: lantaiAsal,
        to: targetFloor,
        quantity: qty
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: `Berhasil memindahkan ${result.quantity} unit "${result.assetName}" dari Lantai ${result.from} ke Lantai ${result.to}`
    });
  } catch (error) {
    console.error('Error moving asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memindahkan aset' },
      { status: 500 }
    );
  }
}