import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Building2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  Save,
  Filter,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';

// Geçici örnek veriler (backend yoksa)
const MOCK_SUPPLIERS = [
  {
    _id: '1',
    code: 'TD-001',
    company_name: 'Ahşap Dünyası Ltd. Şti.',
    tax_office: 'Kadıköy',
    tax_number: '1234567890',
    phone: '0216 555 11 11',
    email: 'info@ahsapdunyasi.com',
    address: 'Sanayi Mah. Ahşap Sok. No:15 Kadıköy/İstanbul',
    contact_person: 'Ali Veli',
    bank_info: 'Ziraat Bankası - TR12 0001 0002 0003 0004 0005 01',
    payment_term: 30,
    status: 'aktif',
  },
  {
    _id: '2',
    code: 'TD-002',
    company_name: 'Hırdavat Merkezi A.Ş.',
    tax_office: 'Şişli',
    tax_number: '9876543210',
    phone: '0212 444 22 22',
    email: 'satis@hirdavatmerkezi.com',
    address: 'Perpa Ticaret Merkezi B Blok No:412 Şişli/İstanbul',
    contact_person: 'Ayşe Kaya',
    bank_info: 'İş Bankası - TR34 0006 4000 0011 2233 4455 66',
    payment_term: 45,
    status: 'aktif',
  },
  {
    _id: '3',
    code: 'TD-003',
    company_name: 'Aksesuar Plus Ltd.',
    tax_office: 'Beyoğlu',
    tax_number: '5556667770',
    phone: '0212 333 33 33',
    email: 'siparis@aksesuarplus.com',
    address: 'Karaköy Mah. Bankalar Cad. No:8 Beyoğlu/İstanbul',
    contact_person: 'Mehmet Demir',
    bank_info: 'Garanti BBVA - TR56 0006 2000 1234 5678 9012 34',
    payment_term: 60,
    status: 'aktif',
  },
  {
    _id: '4',
    code: 'TD-004',
    company_name: 'Boya Kimya San. Tic.',
    tax_office: 'Bostancı',
    tax_number: '1112223330',
    phone: '0216 777 88 88',
    email: 'info@boyakimya.com',
    address: 'İçerenköy Mah. Kimya Cad. No:22 Ataşehir/İstanbul',
    contact_person: 'Fatma Öztürk',
    bank_info: 'Yapı Kredi - TR78 0006 7010 0000 0012 3456 78',
    payment_term: 30,
    status: 'pasif',
  },
];

const EMPTY_FORM = {
  code: '',
  company_name: '',
  tax_office: '',
  tax_number: '',
  phone: '',
  email: '',
  address: '',
  contact_person: '',
  bank_info: '',
  payment_term: 30,
  status: 'aktif',
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);

  // Verileri yükle
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
      setUseMock(false);
    } catch (err) {
      console.warn('API erişilemedi, mock data kullanılıyor:', err.message);
      setSuppliers(MOCK_SUPPLIERS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Formu sıfırla
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  // Modal aç (yeni)
  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Modal aç (düzenle)
  const openEditModal = (supplier) => {
    setForm({
      code: supplier.code || '',
      company_name: supplier.company_name || '',
      tax_office: supplier.tax_office || '',
      tax_number: supplier.tax_number || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      contact_person: supplier.contact_person || '',
      bank_info: supplier.bank_info || '',
      payment_term: supplier.payment_term || 30,
      status: supplier.status || 'aktif',
    });
    setEditingId(supplier._id);
    setError('');
    setShowModal(true);
  };

  // Kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.code.trim() || !form.company_name.trim()) {
      setError('Tedarikçi kodu ve firma adı zorunludur');
      return;
    }

    try {
      if (useMock) {
        if (editingId) {
          setSuppliers(suppliers.map((s) => (s._id === editingId ? { ...s, ...form } : s)));
        } else {
          setSuppliers([...suppliers, { _id: Date.now().toString(), ...form }]);
        }
      } else {
        if (editingId) {
          await api.put(`/suppliers/${editingId}`, form);
        } else {
          await api.post('/suppliers', form);
        }
        await loadSuppliers();
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Bir hata oluştu');
    }
  };

  // Sil
  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" tedarikçisini silmek istediğinize emin misiniz?`)) return;

    try {
      if (useMock) {
        setSuppliers(suppliers.filter((s) => s._id !== id));
      } else {
        await api.delete(`/suppliers/${id}`);
        await loadSuppliers();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Filtreleme
  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.company_name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.contact_person?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(search);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // İstatistikler
  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === 'aktif').length,
    passive: suppliers.filter((s) => s.status === 'pasif').length,
  };

  return (
    <div>
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tedarikçiler</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} tedarikçi listeleniyor
            {useMock && <span className="ml-2 text-orange-600">(Demo veri)</span>}
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} /> Yeni Tedarikçi
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Toplam Tedarikçi</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pasif</p>
            <p className="text-2xl font-bold text-gray-600">{stats.passive}</p>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Firma adı, kod, yetkili, e-posta veya telefon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Kart Listesi (Responsive) */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          Yükleniyor...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
          <Building2 size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Tedarikçi bulunamadı</p>
          <p className="text-sm mt-1">Arama kriterlerinize uygun tedarikçi yok.</p>
        </div>
      ) : (
        <>
          {/* Masaüstü Tablo */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Kod</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Firma Adı</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Yetkili</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">İletişim</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Vergi No</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Vade</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Durum</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{s.code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{s.company_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {s.tax_office || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User size={14} className="text-gray-400" />
                          {s.contact_person || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {s.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={12} className="text-gray-400" /> {s.phone}
                            </div>
                          )}
                          {s.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={12} className="text-gray-400" /> {s.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {s.tax_number || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {s.payment_term} gün
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                            s.status === 'aktif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.status === 'aktif' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          ></span>
                          {s.status === 'aktif' ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id, s.company_name)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Sil"
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
          </div>

          {/* Mobil/Tablet Kart Görünümü */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((s) => (
              <div
                key={s._id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                {/* Üst kısım */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <span className="font-mono text-xs text-gray-500">{s.code}</span>
                    <h3 className="font-bold text-gray-800 mt-0.5 leading-tight">
                      {s.company_name}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                      s.status === 'aktif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {s.status === 'aktif' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {/* Detaylar */}
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  {s.contact_person && (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{s.contact_person}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.tax_office && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{s.tax_office}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs">{s.payment_term} gün vade</span>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(s)}
                    className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition text-sm font-medium"
                  >
                    <Edit2 size={14} /> Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(s._id, s.company_name)}
                    className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 py-2 rounded-lg transition text-sm font-medium"
                  >
                    <Trash2 size={14} /> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            {/* Modal Başlık */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingId ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {editingId
                      ? 'Tedarikçi bilgilerini güncelleyin'
                      : 'Yeni bir tedarikçi kartı oluşturun'}
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

            {/* Modal İçerik */}
            <form onSubmit={handleSubmit} className="p-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              {/* Firma Bilgileri */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" /> Firma Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tedarikçi Kodu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="Örn: TD-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firma Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="Örn: Ahşap Dünyası Ltd."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                    <input
                      type="text"
                      value={form.tax_office}
                      onChange={(e) => setForm({ ...form, tax_office: e.target.value })}
                      placeholder="Örn: Kadıköy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                    <input
                      type="text"
                      value={form.tax_number}
                      onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                      placeholder="Örn: 1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="mb-5 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" /> İletişim Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yetkili Kişi</label>
                    <input
                      type="text"
                      value={form.contact_person}
                      onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                      placeholder="Örn: Ali Veli"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Örn: 0216 555 11 11"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Örn: info@firma.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Açık adres..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ticari Bilgiler */}
              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-600" /> Ticari Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banka Bilgileri</label>
                    <input
                      type="text"
                      value={form.bank_info}
                      onChange={(e) => setForm({ ...form, bank_info: e.target.value })}
                      placeholder="Örn: Ziraat Bankası - TR12 0001..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vade (Gün)</label>
                    <input
                      type="number"
                      value={form.payment_term}
                      onChange={(e) => setForm({ ...form, payment_term: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="aktif"
                          checked={form.status === 'aktif'}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Aktif</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="pasif"
                          checked={form.status === 'pasif'}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Pasif</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Butonlar */}
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
                  <Save size={18} />
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}