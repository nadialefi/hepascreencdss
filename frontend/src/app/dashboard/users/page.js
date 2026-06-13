'use client';
import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit, X, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'medis'
  });

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    password: '',
    role: 'medis'
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 403) {
        alert("Anda tidak memiliki akses ke halaman ini.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/', formData);
      alert('Pengguna berhasil dibuat');
      setShowModal(false);
      setFormData({ username: '', full_name: '', password: '', role: 'medis' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal membuat pengguna');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editFormData };
      if (!payload.password) delete payload.password; // Don't send empty password

      await api.put(`/users/${editingUser.id}`, payload);
      alert('Data pengguna berhasil diperbarui');
      setEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal memperbarui pengguna');
    }
  };

  const confirmDelete = (user) => {
    setDeletingUser(user);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await api.delete(`/users/${deletingUser.id}`);
      setDeleteModal(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menghapus pengguna');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      role: user.role,
      password: '' // empty so we don't overwrite if not changed
    });
    setEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h2>
          <p className="text-slate-600 mt-1">Kelola akses tenaga medis ke dalam sistem.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-medical-600 hover:bg-medical-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Memuat data pengguna...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Peran (Role)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-medical-100 text-medical-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(user)} className="text-slate-400 hover:text-medical-600 mr-3 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(user)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                  Tambah Tenaga Medis Baru
                </h3>
              </div>
              <form onSubmit={handleCreate}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      required
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input
                      required
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Peran</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500 outline-none"
                    >
                      <option value="medis">Tenaga Medis</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-medical-600 text-base font-medium text-white hover:bg-medical-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" aria-hidden="true" onClick={() => setEditModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                  Edit Pengguna: {editingUser?.username}
                </h3>
                <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      required
                      value={editFormData.full_name}
                      onChange={e => setEditFormData({...editFormData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru (Kosongkan jika tidak diubah)</label>
                    <input
                      type="password"
                      value={editFormData.password}
                      onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500 outline-none"
                      placeholder="Masukkan password baru..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Peran</label>
                    <select
                      value={editFormData.role}
                      onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-medical-500 focus:border-medical-500 outline-none"
                    >
                      <option value="medis">Tenaga Medis</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-medical-600 text-base font-medium text-white hover:bg-medical-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" aria-hidden="true" onClick={() => setDeleteModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                      Hapus Akun Pengguna
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Apakah Anda yakin ingin menghapus akun pengguna <strong>{deletingUser.full_name}</strong> secara permanen? Data riwayat pasien yang diinputkan pengguna ini akan tetap tersimpan dengan aman di database.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Ya, Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
