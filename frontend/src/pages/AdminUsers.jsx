import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Users,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Filter,
  ChevronDown,
  ShieldAlert,
  User as UserIcon,
} from 'lucide-react';
import api from '../services/api';

// Rol tanımları
const ROLES = {
  yonetici: { label: 'Yönetici', color: 'bg-red-100 text-red-700', desc: 'Tam yetki' },
  satinalma_muduru: { label: 'Satın Alma Müdürü', color: 'bg-purple-100 text-purple-700', desc: 'Alım yetkisi' },
  depo_sorumlusu: { label: 'Depo Sorumlusu', color: 'bg-blue-100 text-blue-700', desc: 'Stok işlemleri' },
  uretim_sorumlusu: { label: 'Üretim Sorumlusu', color: 'bg-amber-100 text-amber-700', desc: 'Üretim işlemleri' },
  talep_kullanici: { label: 'Talep Kullanıcı', color: 'bg-gray-100 text-gray-700', desc: 'Sadece talep' },
};

const EMPTY_FORM = {
  name: '',
  username: '',
  password: '',
  role: 'talep_kullanici',
  active: true,
};

// Mock kullanıcılar (backend yoksa gösterilir)
const MOCK_USERS = [
  { _id: '1', name: 'Sistem Yöneticisi', username: 'admin', password: 'admin123', role: 'yonetici', active: true, createdAt: '2026-09-01' },
  { _id: '2', name: 'Ahmet Satın Alma', username: 'ahmet', password: '123456', role: 'satinalma_muduru', active: true, createdAt: '2026-09-05' },
  { _id: '3', name: 'Mehmet Depo', username: 'mehmet', password: '123456', role: 'depo_sorumlusu', active: true, createdAt: '2026-09-08' },
  { _id: '4', name: 'Ayşe Üretim', username: 'ayse', password: '123456', role: 'uretim_sorumlusu', active: true, createdAt: '2026-09-10' },
  { _id: '5', name: 'Zeynep Talep', username: 'zeynep', password: '123456', role: 'talep_kullanici', active: false, createdAt: '2026-09-12' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Mevcut kullanıcıyı al
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setCurrentUser(JSON.parse(u));
  }, []);

  // Verileri yükle
  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
      setUseMock(false);
    } catch (err) {
      console.warn('API erişilemedi, mock data:', err.message);
      setUsers(MOCK_USERS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Şifre görünürlüğünü değiştir
  const togglePassword = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Rastgele şifre üret
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: pass }));
  };

  // Formu sıfırla
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setForm({
      name: user.name || '',
      username: user.username || '',
      password: user.password || '',
      role: user.role || 'talep_kullanici',
      active: user.active !== false,
    });
    setEditingId(user._id);
    setError('');
    setShowModal(true);
  };

  // Kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.username.trim()) {
      setError('Ad Soyad ve kullanıcı adı zorunludur');
      return;
    }
    if (form.username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı');
      return;
    }
    if (!editingId && !form.password) {
      setError('Yeni kullanıcı için şifre zorunludur');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    try {
      if (useMock) {
        if (editingId) {
          setUsers(users.map((u) => (u._id === editingId ? { ...u, ...form } : u)));
        } else {
          setUsers([
            ...users,
            {
              _id: Date.now().toString(),
              ...form,
              createdAt: new Date().toISOString().split('T')[0],
            },
          ]);
        }
      } else {
        if (editingId) {
          await api.put(`/users/${editingId}`, form);
        } else {
          await api.post('/users', form);
        }
        await loadUsers();
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Bir hata oluştu');
    }
  };

  // Sil
  const handleDelete = async (id, name) => {
    if (currentUser && currentUser._id === id) {
      alert('Kendi hesabınızı silemezsiniz!');
      return;
    }
    if (!confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz?`)) return;

    try {
      if (useMock) {
        setUsers(users.filter((u) => u._id !== id));
      } else {
        await api.delete(`/users/${id}`);
        await loadUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Filtreleme
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // İstatistikler
  const stats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    passive: users.filter((u) => !u.active).length,
    admins: users.filter((u) => u.role === 'yonetici').length,
  };

  // Admin kontrolü
  const isAdmin = currentUser?.role === 'yonetici';

  // ==== ADMIN DEĞİLSE UYARI ====
  if (currentUser && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Yetkisiz Erişim</h2>
          <p className="text-gray-600 text-sm">
            Bu sayfayı görüntülemek için <strong>yönetici</strong> yetkisine sahip olmanız gerekir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 text-red-600 p-2 rounded-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
              <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
                <ShieldCheck size={13} className="text-red-500" />
                Yalnızca yönetici erişimi
                {useMock && <span className="text-orange-600 ml-2">(Demo veri)</span>}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <UserPlus size={18} /> Yeni Kullanıcı
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><Users size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Toplam</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg"><Users size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-gray-100 text-gray-600 p-3 rounded-lg"><Users size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pasif</p>
            <p className="text-2xl font-bold text-gray-600">{stats.passive}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-red-100 text-red-600 p-3 rounded-lg"><ShieldCheck size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Yönetici</p>
            <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Ad veya kullanıcı adı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Tüm Roller</option>
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          Yükleniyor...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
          <Users size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Kullanıcı bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Ad Soyad</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} /> Kullanıcı Adı
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <KeyRound size={14} /> Şifre
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Durum</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const role = ROLES[u.role] || ROLES.talep_kullanici;
                  const isVisible = visiblePasswords[u._id];
                  return (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{u.name}</div>
                            {u._id === currentUser?._id && (
                              <div className="text-xs text-blue-600 font-medium">(Siz)</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {u.username}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-700 min-w-[90px] inline-block">
                            {isVisible ? (u.password || '-') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePassword(u._id)}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition"
                            title={isVisible ? 'Gizle' : 'Göster'}
                          >
                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${role.color} px-2.5 py-1 rounded-full text-xs font-medium`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                            u.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-gray-400'}`}
                          ></span>
                          {u.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            disabled={u._id === currentUser?._id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  {editingId ? <Edit2 size={20} /> : <UserPlus size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {editingId ? 'Bilgileri güncelleyin' : 'Kullanıcı bilgilerini girin'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Örn: ahmet"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                    minLength={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    En az 3 karakter, boşluk olmadan
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={editingId ? 'Değiştirmek istemiyorsanız boş bırakın' : 'En az 6 karakter'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition whitespace-nowrap"
                      title="Rastgele şifre üret"
                    >
                      🎲 Üret
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Eye size={11} /> Şifre görünür halde saklanır (kolay hatırlama için)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.entries(ROLES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label} — {v.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Hesap aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}