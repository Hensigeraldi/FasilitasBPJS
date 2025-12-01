import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all assets or filter by lantai
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lantai = searchParams.get('lantai');

    const where = lantai ? { lokasi_lantai: parseInt(lantai) } : {};

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST: Create new asset
export async function POST(request) {
  try {
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

    // PERBAIKAN: Check if kode_aset already exists on SAME floor
    const existing = await prisma.asset.findFirst({
      where: {
        kode_aset: kode_aset,
        lokasi_lantai: parseInt(lokasi_lantai)
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Kode aset sudah digunakan di lantai ini' },
        { status: 400 }
      );
    }

    // Transaction: Create Asset + Log
    const result = await prisma.$transaction(async (tx) => {
      // Create asset
      const newAsset = await tx.asset.create({
        data: {
          nama,
          kode_aset,
          lokasi_lantai: parseInt(lokasi_lantai),
          kondisi,
          status,
          jumlah: qty
        }
      });

      // Create log
      await tx.activityLog.create({
        data: {
          asset_id: newAsset.id,
          action: 'CREATE',
          jumlah: qty,
          deskripsi: `Aset "${nama}" ditambahkan ke Lantai ${lokasi_lantai} sebanyak ${qty} unit`
        }
      });

      return newAsset;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create asset' },
      { status: 500 }
    );
  }
}