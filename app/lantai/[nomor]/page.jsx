'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus, Pencil, Trash2, X, ArrowRight,
  Search, Package, AlertCircle
} from 'lucide-react';

export default function LantaiPage() {
  const params = useParams();
  const lantai = parseInt(params.nomor);

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [isMobile, setIsMobile] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    kode_aset: '',
    lokasi_lantai: lantai,
    kondisi: 'Baik',
    status: 'Aktif',
    jumlah: 1
  });

  const [moveFormData, setMoveFormData] = useState({
    assetId: '',
    targetLantai: '',
    jumlah: 1
  });

  const filters = ['Semua', 'Baik', 'Rusak'];
  const availableFloors = [1, 2, 3].filter(floor => floor !== lantai);

  useEffect(() => {
    fetchAssets();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [lantai]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      filterAssets();
    }, 300);
    
    setSearchTimeout(timeout);
    
    return () => clearTimeout(timeout);
  }, [assets, searchQuery, activeFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assets?lantai=${lantai}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch assets');
      }
      
      const result = await res.json();
      
      if (result.success) {
        setAssets(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch assets');
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      showToast('Gagal memuat data aset', 'error');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = useCallback(() => {
    let filtered = [...assets];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.nama.toLowerCase().includes(query) ||
        asset.kode_aset.toLowerCase().includes(query)
      );
    }
    
    // Filter by condition
    if (activeFilter !== 'Semua') {
      filtered = filtered.filter(asset => asset.kondisi === activeFilter);
    }
    
    setFilteredAssets(filtered);
  }, [assets, searchQuery, activeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate jumlah
    const qty = parseInt(formData.jumlah);
    if (qty < 1) {
      showToast('Jumlah minimal 1', 'warning');
      return;
    }

    try {
      const url = editMode
        ? `/api/assets/${currentAsset.id}`
        : '/api/assets';
      
      const method = editMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          jumlah: qty
        }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal menyimpan aset');
      }

      showToast(
        editMode ? 'Aset berhasil diperbarui' : 'Aset berhasil ditambahkan',
        'success'
      );
      closeModal();
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      showToast(error.message || 'Gagal menyimpan aset', 'error');
    }
  };

  // PERBAIKAN: Hanya ada SATU fungsi handleMoveAsset
  const handleMoveAsset = async (e) => {
    e.preventDefault();

    if (!moveFormData.assetId || !moveFormData.targetLantai) {
      showToast('Pilih aset dan lantai tujuan', 'warning');
      return;
    }

    const jumlahPindah = parseInt(moveFormData.jumlah);
    if (jumlahPindah < 1) {
      showToast('Jumlah minimal 1', 'warning');
      return;
    }

    try {
      const asset = assets.find(a => a.id === parseInt(moveFormData.assetId));
      
      if (!asset) {
        throw new Error('Aset tidak ditemukan');
      }

      if (jumlahPindah > asset.jumlah) {
        showToast(`Jumlah tersedia hanya ${asset.jumlah} unit`, 'warning');
        return;
      }

      // PERBAIKAN: Gunakan API move yang sudah ada
      const res = await fetch('/api/assets/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: parseInt(moveFormData.assetId),
          targetLantai: parseInt(moveFormData.targetLantai),
          jumlahPindah: jumlahPindah
        }),
      });

      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal memindahkan aset');
      }

      showToast(
        result.message || `Berhasil memindahkan ${jumlahPindah} unit ke Lantai ${moveFormData.targetLantai}`,
        'success'
      );
      closeMoveModal();
      fetchAssets(); // Refresh data

    } catch (error) {
      console.error('Error moving asset:', error);
      showToast(error.message || 'Gagal memindahkan aset', 'error');
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Yakin ingin menghapus aset "${nama}"?`)) return;

    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal menghapus aset');
      }

      showToast('Aset berhasil dihapus', 'success');
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      showToast(error.message || 'Gagal menghapus aset', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div>${message}</div>`;
    
    const container = document.querySelector('.toast-container') || createToastContainer();
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const createToastContainer = () => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentAsset(null);
    setFormData({
      nama: '',
      kode_aset: '',
      lokasi_lantai: lantai,
      kondisi: 'Baik',
      status: 'Aktif',
      jumlah: 1
    });
    setShowModal(true);
    setShowFabMenu(false);
  };

  const openEditModal = (asset) => {
    setEditMode(true);
    setCurrentAsset(asset);
    setFormData({
      nama: asset.nama,
      kode_aset: asset.kode_aset,
      lokasi_lantai: asset.lokasi_lantai,
      kondisi: asset.kondisi,
      status: asset.status,
      jumlah: asset.jumlah
    });
    setShowModal(true);
  };

  const openMoveModal = () => {
    if (assets.length === 0) {
      showToast('Tidak ada aset yang bisa dipindahkan', 'warning');
      return;
    }
    
    const firstAsset = assets[0];
    setMoveFormData({
      assetId: firstAsset?.id.toString() || '',
      targetLantai: availableFloors[0]?.toString() || '',
      jumlah: 1
    });
    setShowMoveModal(true);
    setShowFabMenu(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentAsset(null);
  };

  const closeMoveModal = () => {
    setShowMoveModal(false);
    setMoveFormData({
      assetId: '',
      targetLantai: '',
      jumlah: 1
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getKondisiBadge = (kondisi) => {
    if (kondisi === 'Baik') return 'badge success';
    return 'badge warning';
  };

  const getStatusBadge = (status) => {
    if (status === 'Aktif') return 'badge primary';
    return 'badge error';
  };

  const getMaxMoveQuantity = () => {
    if (!moveFormData.assetId) return 1;
    const asset = assets.find(a => a.id === parseInt(moveFormData.assetId));
    return asset ? asset.jumlah : 1;
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="assets-card-list">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        </div>
      ))}
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Package size={40} />
      </div>
      <h3 className="empty-state-title">Belum Ada Aset</h3>
      <p className="empty-state-description">
        Mulai tambahkan aset untuk lantai {lantai} dengan menekan tombol + di bawah
      </p>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lantai {lantai}</h1>
          <p className="page-subtitle">
            {loading ? 'Memuat...' : `${filteredAssets.length} dari ${assets.length} aset`}
          </p>
        </div>
        {/* Desktop buttons - hidden on mobile */}
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={openMoveModal}
            disabled={assets.length === 0}
          >
            <ArrowRight size={20} />
            Pindahkan Barang
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={20} />
            Tambah Aset
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Cari aset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="filter-chips">
          {filters.map(filter => (
            <button
              key={filter}
              className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Display */}
      <div className="card">
        {loading ? (
          <div className="card-body">
            <LoadingSkeleton />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="card-body">
            {assets.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="text-center" style={{ padding: '2rem' }}>
                <p style={{ color: 'var(--color-text-light)' }}>
                  Tidak ada aset yang sesuai dengan pencarian
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode Aset</th>
                    <th>Nama Aset</th>
                    <th>Kondisi</th>
                    <th>Status</th>
                    <th>Jumlah</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset, index) => (
                    <tr key={asset.id}>
                      <td>{index + 1}</td>
                      <td><strong>{asset.kode_aset}</strong></td>
                      <td>{asset.nama}</td>
                      <td>
                        <span className={getKondisiBadge(asset.kondisi)}>
                          {asset.kondisi}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadge(asset.status)}>
                          {asset.status}
                        </span>
                      </td>
                      <td><strong>{asset.jumlah}</strong> unit</td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            className="btn-icon btn-outline"
                            onClick={() => openEditModal(asset)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-icon btn-outline"
                            onClick={() => handleDelete(asset.id, asset.nama)}
                            title="Hapus"
                            style={{ color: 'var(--color-error)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="assets-card-list">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="asset-card">
                  <div className="asset-card-main">
                    <div className="asset-card-header">
                      <div className="asset-card-info">
                        <div className="asset-card-title">{asset.nama}</div>
                        <div className="asset-card-code">
                          {asset.kode_aset}
                        </div>
                      </div>
                      <div className="asset-card-icon">
                        <Package size={24} />
                      </div>
                    </div>
                    
                    <div className="asset-card-details">
                      <div className="asset-card-detail">
                        <span className="asset-card-label">Kondisi</span>
                        <span className={getKondisiBadge(asset.kondisi)}>
                          {asset.kondisi}
                        </span>
                      </div>
                      <div className="asset-card-detail">
                        <span className="asset-card-label">Status</span>
                        <span className={getStatusBadge(asset.status)}>
                          {asset.status}
                        </span>
                      </div>
                      <div className="asset-card-detail">
                        <span className="asset-card-label">Jumlah</span>
                        <span className="asset-card-value"><strong>{asset.jumlah}</strong> unit</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="asset-card-actions">
                    <button
                      className="asset-card-action edit"
                      onClick={() => openEditModal(asset)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      className="asset-card-action delete"
                      onClick={() => handleDelete(asset.id, asset.nama)}
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fab-container">
        <div
          className={`fab-backdrop ${showFabMenu ? 'open' : ''}`}
          onClick={() => setShowFabMenu(false)}
          style={{ display: showFabMenu ? 'block' : 'none' }}
        />
        
        <div className={`fab-menu ${showFabMenu ? 'open' : ''}`}>
          <div className="fab-item" onClick={(e) => {
            e.stopPropagation();
            openMoveModal();
          }}>
            <div className="fab-item-icon secondary">
              <ArrowRight size={20} />
            </div>
            <span className="fab-item-label">Pindahkan Barang</span>
          </div>
          <div className="fab-item" onClick={(e) => {
            e.stopPropagation();
            openAddModal();
          }}>
            <div className="fab-item-icon">
              <Plus size={20} />
            </div>
            <span className="fab-item-label">Tambah Aset</span>
          </div>
        </div>
        
        <button
          className="fab"
          onClick={(e) => {
            e.stopPropagation();
            setShowFabMenu(!showFabMenu);
          }}
          type="button"
        >
          {showFabMenu ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {/* Modal - Add/Edit - Desktop & Mobile */}
      {showModal && (
        <>
          {isMobile ? (
            // Mobile Bottom Sheet
            <>
              <div
                className={`bottom-sheet-overlay ${showModal ? 'open' : ''}`}
                onClick={closeModal}
              />
              <div className={`bottom-sheet ${showModal ? 'open' : ''}`}>
                <div className="bottom-sheet-handle" />
                <div className="bottom-sheet-header">
                  <h3 className="bottom-sheet-title">
                    {editMode ? 'Edit Aset' : 'Tambah Aset Baru'}
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="bottom-sheet-body">
                    <div className="form-group">
                      <label className="form-label">Nama Aset</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kode Aset</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.kode_aset}
                        onChange={(e) => setFormData({...formData, kode_aset: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kondisi</label>
                      <select
                        className="form-select"
                        value={formData.kondisi}
                        onChange={(e) => setFormData({...formData, kondisi: e.target.value})}
                        required
                      >
                        <option value="Baik">Baik</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        required
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jumlah</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={formData.jumlah}
                        onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="bottom-sheet-footer">
                    <button type="button" className="btn btn-outline w-full" onClick={closeModal}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary w-full">
                      {editMode ? 'Simpan Perubahan' : 'Tambah Aset'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Desktop Modal
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">
                    {editMode ? 'Edit Aset' : 'Tambah Aset Baru'}
                  </h3>
                  <button className="btn-icon" onClick={closeModal}>
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Nama Aset</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kode Aset</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.kode_aset}
                        onChange={(e) => setFormData({...formData, kode_aset: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kondisi</label>
                      <select
                        className="form-select"
                        value={formData.kondisi}
                        onChange={(e) => setFormData({...formData, kondisi: e.target.value})}
                        required
                      >
                        <option value="Baik">Baik</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        required
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jumlah</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        value={formData.jumlah}
                        onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={closeModal}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editMode ? 'Simpan Perubahan' : 'Tambah Aset'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal - Move Asset - Desktop & Mobile */}
      {showMoveModal && (
        <>
          {isMobile ? (
            // Mobile Bottom Sheet
            <>
              <div
                className={`bottom-sheet-overlay ${showMoveModal ? 'open' : ''}`}
                onClick={closeMoveModal}
              />
              <div className={`bottom-sheet ${showMoveModal ? 'open' : ''}`}>
                <div className="bottom-sheet-handle" />
                <div className="bottom-sheet-header">
                  <h3 className="bottom-sheet-title">Pindahkan Barang</h3>
                </div>
                
                <form onSubmit={handleMoveAsset}>
                  <div className="bottom-sheet-body">
                    <div className="form-group">
                      <label className="form-label">Pilih Aset</label>
                      <select
                        className="form-select"
                        value={moveFormData.assetId}
                        onChange={(e) => {
                          const asset = assets.find(a => a.id === parseInt(e.target.value));
                          setMoveFormData({
                            ...moveFormData, 
                            assetId: e.target.value,
                            jumlah: 1
                          });
                        }}
                        required
                      >
                        <option value="">-- Pilih Aset --</option>
                        {assets.map(asset => (
                          <option key={asset.id} value={asset.id}>
                            {asset.kode_aset} - {asset.nama} ({asset.jumlah} unit)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tujuan Lantai</label>
                      <select
                        className="form-select"
                        value={moveFormData.targetLantai}
                        onChange={(e) => setMoveFormData({...moveFormData, targetLantai: e.target.value})}
                        required
                      >
                        <option value="">-- Pilih Lantai Tujuan --</option>
                        {availableFloors.map(floor => (
                          <option key={floor} value={floor}>
                            Lantai {floor}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jumlah yang Dipindahkan</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        max={getMaxMoveQuantity()}
                        value={moveFormData.jumlah}
                        onChange={(e) => setMoveFormData({...moveFormData, jumlah: e.target.value})}
                        required
                      />
                      {moveFormData.assetId && (
                        <small style={{ color: 'var(--color-text-light)', marginTop: '0.25rem', display: 'block' }}>
                          Maksimal: {getMaxMoveQuantity()} unit
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="bottom-sheet-footer">
                    <button type="button" className="btn btn-outline w-full" onClick={closeMoveModal}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary w-full">
                      <ArrowRight size={16} />
                      Pindahkan Barang
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Desktop Modal
            <div className="modal-overlay" onClick={closeMoveModal}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Pindahkan Barang</h3>
                  <button className="btn-icon" onClick={closeMoveModal}>
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleMoveAsset}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Pilih Aset</label>
                      <select
                        className="form-select"
                        value={moveFormData.assetId}
                        onChange={(e) => {
                          const asset = assets.find(a => a.id === parseInt(e.target.value));
                          setMoveFormData({
                            ...moveFormData, 
                            assetId: e.target.value,
                            jumlah: 1
                          });
                        }}
                        required
                      >
                        <option value="">-- Pilih Aset --</option>
                        {assets.map(asset => (
                          <option key={asset.id} value={asset.id}>
                            {asset.kode_aset} - {asset.nama} ({asset.jumlah} unit)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tujuan Lantai</label>
                      <select
                        className="form-select"
                        value={moveFormData.targetLantai}
                        onChange={(e) => setMoveFormData({...moveFormData, targetLantai: e.target.value})}
                        required
                      >
                        <option value="">-- Pilih Lantai Tujuan --</option>
                        {availableFloors.map(floor => (
                          <option key={floor} value={floor}>
                            Lantai {floor}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jumlah yang Dipindahkan</label>
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        max={getMaxMoveQuantity()}
                        value={moveFormData.jumlah}
                        onChange={(e) => setMoveFormData({...moveFormData, jumlah: e.target.value})}
                        required
                      />
                      {moveFormData.assetId && (
                        <small style={{ color: 'var(--color-text-light)', marginTop: '0.25rem', display: 'block' }}>
                          Maksimal: {getMaxMoveQuantity()} unit
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={closeMoveModal}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <ArrowRight size={16} />
                      Pindahkan Barang
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}