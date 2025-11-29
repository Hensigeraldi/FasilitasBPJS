import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all assets with optional filter by lantai
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
          take: 5,
          orderBy: { timestamp: 'desc' }
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
    const { nama, kode_aset, kategori, lokasi_lantai, kondisi, status } = body;

    // Validation
    if (!nama || !kode_aset || !kategori || !lokasi_lantai || !kondisi || !status) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Transaction: Create Asset + Log
    const result = await prisma.$transaction(async (tx) => {
      // Check if kode_aset already exists
      const existing = await tx.asset.findUnique({
        where: { kode_aset }
      });

      if (existing) {
        throw new Error('Kode aset sudah digunakan');
      }

      // Create asset
      const asset = await tx.asset.create({
        data: {
          nama,
          kode_aset,
          kategori,
          lokasi_lantai: parseInt(lokasi_lantai),
          kondisi,
          status
        }
      });

      // Create log
      await tx.activityLog.create({
        data: {
          asset_id: asset.id,
          action: 'CREATE',
          deskripsi: `Aset "${nama}" berhasil ditambahkan ke Lantai ${lokasi_lantai}`
        }
      });

      return asset;
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