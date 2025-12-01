'use client';

import { useEffect, useState } from 'react';
import { Package, AlertTriangle, Building2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    assetRusak: 0,
    lantai1: 0,
    lantai2: 0,
    lantai3: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/assets');
      const { data } = await res.json();

      const totalAssets = data.length;
      const assetRusak = data.filter(a => 
        a.kondisi.includes('Rusak')
      ).length;
      const lantai1 = data.filter(a => a.lokasi_lantai === 1).length;
      const lantai2 = data.filter(a => a.lokasi_lantai === 2).length;
      const lantai3 = data.filter(a => a.lokasi_lantai === 3).length;

      setStats({ totalAssets, assetRusak, lantai1, lantai2, lantai3 });
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
              <div className="stat-card-value">{stats.totalAssets}</div>
            </div>
            <div className="stat-card-icon primary">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Aset Rusak</div>
              <div className="stat-card-value">{stats.assetRusak}</div>
            </div>
            <div className="stat-card-icon warning">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Lantai 1</div>
              <div className="stat-card-value">{stats.lantai1}</div>
            </div>
            <div className="stat-card-icon success">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Lantai 2</div>
              <div className="stat-card-value">{stats.lantai2}</div>
            </div>
            <div className="stat-card-icon success">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-title">Lantai 3</div>
              <div className="stat-card-value">{stats.lantai3}</div>
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
          </ul>
        </div>
      </div>
    </>
  );
}