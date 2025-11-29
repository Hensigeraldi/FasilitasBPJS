'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Pencil, Trash2, X, MoveVertical } from 'lucide-react';

export default function LantaiPage() {
  const params = useParams();
  const lantai = parseInt(params.nomor);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    kode_aset: '',
    kategori: '',
    lokasi_lantai: lantai,
    kondisi: 'Baik',
    status: 'Aktif',
  });

  useEffect(() => {
    fetchAssets();
  }, [lantai]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assets?lantai=${lantai}`);
      const { data } = await res.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      alert('Gagal memuat data aset');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editMode 
        ? `/api/assets/${currentAsset.id}` 
        : '/api/assets';
      
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      alert(editMode ? 'Aset berhasil diperbarui!' : 'Aset berhasil ditambahkan!');
      closeModal();
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert(error.message || 'Gagal menyimpan aset');
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
        throw new Error(result.error);
      }

      alert('Aset berhasil dihapus!');
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert(error.message || 'Gagal menghapus aset');
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentAsset(null);
    setFormData({
      nama: '',
      kode_aset: '',
      kategori: '',
      lokasi_lantai: lantai,
      kondisi: 'Baik',
      status: 'Aktif',
    });
    setShowModal(true);
  };

  const openEditModal = (asset) => {
    setEditMode(true);
    setCurrentAsset(asset);
    setFormData({
      nama: asset.nama,
      kode_aset: asset.kode_aset,
      kategori: asset.kategori,
      lokasi_lantai: asset.lokasi_lantai,
      kondisi: asset.kondisi,
      status: asset.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentAsset(null);
  };

  const getKondisiBadge = (kondisi) => {
    if (kondisi === 'Baik') return 'badge success';
    if (kondisi.includes('Rusak Ringan')) return 'badge warning';
    return 'badge error';
  };

  const getStatusBadge = (status) => {
    if (status === 'Aktif') return 'badge primary';
    return 'badge error';
  };

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Daftar Aset Lantai {lantai}</h1>
          <p className="page-subtitle">
            Kelola aset yang berada di Lantai {lantai}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={20} />
          Tambah Aset
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {loading ? 'Memuat...' : `Total: ${assets.length} Aset`}
          </h2>
        </div>
        
        {loading ? (
          <div className="card-body">
            <p>Loading...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="card-body text-center">
            <p style={{ color: 'var(--color-text-light)' }}>
              Belum ada aset di lantai ini
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode Aset</th>
                  <th>Nama Aset</th>
                  <th>Kategori</th>
                  <th>Kondisi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, index) => (
                  <tr key={asset.id}>
                    <td>{index + 1}</td>
                    <td><strong>{asset.kode_aset}</strong></td>
                    <td>{asset.nama}</td>
                    <td>{asset.kategori}</td>
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
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
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
                  <label className="form-label">Kategori</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                    placeholder="Contoh: Elektronik, Furniture, IT"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Lokasi Lantai {editMode && <MoveVertical size={16} style={{display: 'inline', marginLeft: '0.5rem'}} />}
                  </label>
                  <select
                    className="form-select"
                    value={formData.lokasi_lantai}
                    onChange={(e) => setFormData({...formData, lokasi_lantai: parseInt(e.target.value)})}
                    required
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                    <option value={3}>Lantai 3</option>
                  </select>
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
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
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
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                  </select>
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
  );
}