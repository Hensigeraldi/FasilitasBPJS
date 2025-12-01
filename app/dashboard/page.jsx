'use client';

import { useEffect, useState } from 'react';
import { Package, AlertTriangle, Building2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,        // jumlah baris/record
    totalQuantity: 0,      // total jumlah semua unit
    assetRusak: 0,         // jumlah baris kondisi rusak
    assetRusakQuantity: 0, // total unit kondisi rusak
    lantai1: 0,            // jumlah baris di lantai 1
    lantai1Quantity: 0,    // total unit di lantai 1
    lantai2: 0,            // jumlah baris di lantai 2
    lantai2Quantity: 0,    // total unit di lantai 2
    lantai3: 0,            // jumlah baris di lantai 3
    lantai3Quantity: 0,    // total unit di lantai 3
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/assets');
      const { data } = await res.json();

      // PERHITUNGAN:
      const totalAssets = data.length;
      
      // Total semua jumlah (quantity)
      const totalQuantity = data.reduce((sum, asset) => sum + (asset.jumlah || 1), 0);
      
      // Aset rusak (record)
      const assetRusak = data.filter(a => 
        a.kondisi && a.kondisi.includes('Rusak')
      ).length;
      
      // Total unit rusak
      const assetRusakQuantity = data
        .filter(a => a.kondisi && a.kondisi.includes('Rusak'))
        .reduce((sum, asset) => sum + (asset.jumlah || 1), 0);
      
      // Lantai 1
      const lantai1Data = data.filter(a => a.lokasi_lantai === 1);
      const lantai1 = lantai1Data.length;
      const lantai1Quantity = lantai1Data.reduce((sum, asset) => sum + (asset.jumlah || 1), 0);
      
      // Lantai 2
      const lantai2Data = data.filter(a => a.lokasi_lantai === 2);
      const lantai2 = lantai2Data.length;
      const lantai2Quantity = lantai2Data.reduce((sum, asset) => sum + (asset.jumlah || 1), 0);
      
      // Lantai 3
      const lantai3Data = data.filter(a => a.lokasi_lantai === 3);
      const lantai3 = lantai3Data.length;
      const lantai3Quantity = lantai3Data.reduce((sum, asset) => sum + (asset.jumlah || 1), 0);

      setStats({ 
        totalAssets, 
        totalQuantity,
        assetRusak,
        assetRusakQuantity,
        lantai1, 
        lantai1Quantity,
        lantai2, 
        lantai2Quantity,
        lantai3, 
        lantai3Quantity
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Sistem Digitalisasi Aset BPJS Ketenagakerjaan Manado
        </p>
      </div>

      <div className="stats-grid">
        {/* Total Aset Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Total Aset</div>
              <div className="stat-card-value">{stats.totalQuantity} unit</div>
              <div className="stat-card-subtitle">{stats.totalAssets} jenis aset</div>
            </div>
            <div className="stat-card-icon primary">
              <Package size={24} />
            </div>
          </div>
        </div>

        {/* Aset Rusak Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Aset Rusak</div>
              <div className="stat-card-value">{stats.assetRusakQuantity} unit</div>
              <div className="stat-card-subtitle">{stats.assetRusak} jenis rusak</div>
            </div>
            <div className="stat-card-icon warning">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        {/* Lantai 1 Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Lantai 1</div>
              <div className="stat-card-value">{stats.lantai1Quantity} unit</div>
              <div className="stat-card-subtitle">{stats.lantai1} jenis aset</div>
            </div>
            <div className="stat-card-icon success">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        {/* Lantai 2 Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Lantai 2</div>
              <div className="stat-card-value">{stats.lantai2Quantity} unit</div>
              <div className="stat-card-subtitle">{stats.lantai2} jenis aset</div>
            </div>
            <div className="stat-card-icon success">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        {/* Lantai 3 Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Lantai 3</div>
              <div className="stat-card-value">{stats.lantai3Quantity} unit</div>
              <div className="stat-card-subtitle">{stats.lantai3} jenis aset</div>
            </div>
            <div className="stat-card-icon success">
              <Building2 size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Selamat Datang</h2>
        </div>
        <div className="card-body">
          <p style={{ marginBottom: '1rem' }}>
            Sistem ini membantu mengelola dan melacak aset BPJS Ketenagakerjaan 
            Manado dengan fitur:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Manajemen aset per lantai</li>
            <li>Pencatatan kondisi dan status aset</li>
            <li>Tracking perpindahan aset antar lantai</li>
            <li>Histori aktivitas lengkap</li>
            <li>Dashboard dengan statistik total unit</li>
          </ul>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-gray-50)', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>📊 Statistik Saat Ini:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <strong>Total Unit:</strong> {stats.totalQuantity} unit
              </div>
              <div>
                <strong>Jenis Aset:</strong> {stats.totalAssets} jenis
              </div>
              <div>
                <strong>Unit Rusak:</strong> {stats.assetRusakQuantity} unit ({stats.assetRusak} jenis)
              </div>
              <div>
                <strong>Persentase Rusak:</strong> {stats.totalQuantity > 0 ? ((stats.assetRusakQuantity / stats.totalQuantity * 100).toFixed(1)) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}