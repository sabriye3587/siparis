import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  ClipboardList,
  AlertTriangle,
  Filter,
  ChevronDown,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  PackagePlus,
  Calendar,
  User,
  Building2,
  FileText,
  Send,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';

// Durum tanımları
const STATUSES = {
  bekliyor: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: Clock },
  onaylandi: { label: 'Onaylandı', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', icon: CheckCircle2 },
  reddedildi: { label: 'Reddedildi', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: XCircle },
  siparise_donustu: { label: 'Siparişe Dönüştü', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', icon: ArrowRight },
};

const PRIORITIES = {
  dusuk: { label: 'Düşük', color: 'bg-gray-100 text-gray-600' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  yuksek: { label: 'Yüksek', color: 'bg-orange-100 text-orange-700' },
  acil: { label: 'Acil', color: 'bg-red-100 text-red-700' },
};

const DEPARTMENTS = ['Üretim', 'Depo', 'Satın Alma', 'Muhasebe', 'İdari İşler', 'Bakım', 'Kalite'];

// Mock veriler
const MOCK_REQUESTS = [
  {
    _id: '1',
    request_no: 'TAL-2026-0001',
    request_date: '2026-09-15',
    department: 'Üretim',
    requester: { name: 'Ayşe Üretim' },
    wanted_date: '2026-09-25',
    description: 'Acil üretim için MDF ve menteşe gerekli',
    priority: 'acil',
    status: 'bekliyor',
    items: [
      { item_id: '1', item_code: 'MDF-001', item_name: 'MDF 18mm Beyaz', quantity: 150, unit: 'm²' },
      { item_id: '2', item_code: 'MNT-001', item_name: 'Menteşe 35mm', quantity: 500, unit: 'adet' },
    ],
  },
  {
    _id: '2',
    request_no: 'TAL-2026-0002',
    request_date: '2026-09-16',
    department: 'Depo',
    requester: { name: 'Mehmet Depo' },
    wanted_date: '2026-10-01',
    description: 'Aylık boya stok takviyesi',
    priority: 'normal',
    status: 'onaylandi',
    items: [
      { item_id: '5', item_code: 'BOY-001', item_name: 'Boya Beyaz 20kg', quantity: 50, unit: 'kg' },
    ],
  },
  {
    _id: '3',
    request_no: 'TAL-2026-0003',
    request_date: '2026-09-17',
    department: 'Bakım',
    requester: { name: 'Zeynep Talep' },
    wanted_date: '2026-09-20',
    description: 'Makine bakımı için vida ve pul',
    priority: 'yuksek',
    status: 'siparise_donustu',
    items: [
      { item_id: '3', item_code: 'VID-001', item_name: 'Vida 4x40', quantity: 2000, unit: 'adet' },
      { item_id: '6', item_code: 'PUL-001', item_name: 'Pul M8', quantity: 1000, unit: 'adet' },
    ],
  },
  {
    _id: '4',
    request_no: 'TAL-2026-0004',
    request_date: '2026-09-18',
    department: 'İdari İşler',
    requester: { name: 'Ali İdari' },
    wanted_date: '2026-09-30',
    description: 'Ofis malzemesi',
    priority: 'dusuk',
    status: 'reddedildi',
    items: [
      { item_id: '7', item_code: 'KLP-001', item_name: 'Kulp Modern', quantity: 20, unit: 'adet' },
    ],
  },
];

// Mock ürünler (talep formunda seçim için)
const MOCK_ITEMS = [
  { _id: '1', item_code: 'MDF-001', item_name: 'MDF 18mm Beyaz', unit: 'm²' },
  { _id: '2', item_code: 'MNT-001', item_name: 'Menteşe 35mm', unit: 'adet' },
  { _id: '3', item_code: 'VID-001', item_name: 'Vida 4x40', unit: 'adet' },
  { _id: '5', item_code: 'BOY-001', item_name: 'Boya Beyaz 20kg', unit: 'kg' },
  { _id: '7', item_code: 'KLP-001', item_name: 'Kulp Modern 128mm', unit: 'adet' },
  { _id: '8', item_code: 'PUL-001', item_name: 'Pul M8', unit: 'adet' },
];

const EMPTY_FORM = {
  department: 'Üretim',
  wanted_date: '',
  description: '',
  priority: 'normal',
};

const EMPTY_LINE = { item_id: '', quantity: 1 };

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState(MOCK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [lines, setLines] = useState([{ ...EMPTY_LINE }]);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);

  // Verileri yükle
  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/requests');
      setRequests(data);
      setUseMock(false);
    } catch (err) {
      console.warn('API erişilemedi, mock data:', err.message);
      setRequests(MOCK_REQUESTS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Formu sıfırla
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setLines([{ ...EMPTY_LINE }]);
    setError('');
  };

  // Modal aç
  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Detay modal
  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  // Satır ekle
  const addLine = () => setLines([...lines, { ...EMPTY_LINE }]);

  // Satır sil
  const removeLine = (idx) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  // Satır güncelle
  const updateLine = (idx, field, value) => {
    setLines(lines.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  // Kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.wanted_date) {
      setError('İstenen tarih zorunludur');
      return;
    }

    const validLines = lines.filter((l) => l.item_id && l.quantity > 0);
    if (validLines.length === 0) {
      setError('En az bir ürün satırı eklemelisiniz');
      return;
    }

    const payload = {
      ...form,
      items: validLines.map((l) => {
        const item = items.find((i) => i._id === l.item_id);
        return {
          item_id: l.item_id,
          item_code: item?.item_code,
          item_name: item?.item_name,
          unit: item?.unit,
          quantity: Number(l.quantity),
        };
      }),
    };

    try {
      if (useMock) {
        const newReq = {
          _id: Date.now().toString(),
          request_no: `TAL-2026-${String(requests.length + 1).padStart(4, '0')}`,
          request_date: new Date().toISOString().split('T')[0],
          requester: { name: 'Siz' },
          ...payload,
          status: 'bekliyor',
        };
        setRequests([newReq, ...requests]);
      } else {
        await api.post('/requests', payload);
        await loadRequests();
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Durum değiştir (onay/red)
  const changeStatus = async (id, newStatus) => {
    const label = STATUSES[newStatus]?.label || newStatus;
    if (!confirm(`Talebi "${label}" olarak işaretlemek istiyor musunuz?`)) return;

    try {
      if (useMock) {
        setRequests(requests.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
        if (selectedRequest?._id === id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      } else {
        await api.put(`/requests/${id}/status`, { status: newStatus });
        await loadRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Sil
  const handleDelete = async (id, no) => {
    if (!confirm(`"${no}" talebini silmek istediğinize emin misiniz?`)) return;
    try {
      if (useMock) {
        setRequests(requests.filter((r) => r._id !== id));
      } else {
        await api.delete(`/requests/${id}`);
        await loadRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Filtreleme
  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.request_no?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q) ||
      r.requester?.name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.items?.some((i) => i.item_name?.toLowerCase().includes(q));
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchPriority = !priorityFilter || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  // İstatistikler
  const stats = {
    total: requests.length,
    bekliyor: requests.filter((r) => r.status === 'bekliyor').length,
    onaylandi: requests.filter((r) => r.status === 'onaylandi').length,
    acil: requests.filter((r) => r.priority === 'acil' && r.status === 'bekliyor').length,
  };

  return (
    <div>
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Satın Alma Talepleri</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} talep listeleniyor
            {useMock && <span className="ml-2 text-orange-600">(Demo veri)</span>}
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} /> Yeni Talep
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><ClipboardList size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Toplam</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg"><Clock size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Bekliyor</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.bekliyor}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg"><CheckCircle2 size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Onaylı</p>
            <p className="text-2xl font-bold text-green-600">{stats.onaylandi}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-red-100 text-red-600 p-3 rounded-lg"><AlertTriangle size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Acil Bekleyen</p>
            <p className="text-2xl font-bold text-red-600">{stats.acil}</p>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Talep no, departman, ürün veya açıklama ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {Object.entries(STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>

        <div className="relative md:w-44">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Tüm Öncelikler</option>
            {Object.entries(PRIORITIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          Yükleniyor...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
          <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Talep bulunamadı</p>
          <p className="text-sm mt-1">Arama kriterlerinize uygun talep yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const status = STATUSES[r.status] || STATUSES.bekliyor;
            const priority = PRIORITIES[r.priority] || PRIORITIES.normal;
            const StatusIcon = status.icon;
            return (
              <div
                key={r._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Sol: İkon + Ana Bilgiler */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-lg flex-shrink-0">
                        <FileText size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-gray-800">{r.request_no}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${status.color}`}>
                            <StatusIcon size={11} />
                            {status.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {r.description || 'Açıklama yok'}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 size={12} /> {r.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} /> {r.requester?.name || '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> Talep: {r.request_date}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-orange-600">
                            <Calendar size={12} /> İstenen: {r.wanted_date}
                          </span>
                        </div>

                        {/* Ürünler */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {r.items?.slice(0, 3).map((it, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md"
                            >
                              {it.item_name} × {it.quantity} {it.unit}
                            </span>
                          ))}
                          {r.items?.length > 3 && (
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md">
                              +{r.items.length - 3} ürün
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sağ: Aksiyonlar */}
                    <div className="flex md:flex-col lg:flex-row gap-2 md:w-40 lg:w-auto md:flex-shrink-0">
                      <button
                        onClick={() => openDetailModal(r)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition text-sm"
                        title="Detay"
                      >
                        <Eye size={15} /> Detay
                      </button>
                      {r.status === 'bekliyor' && (
                        <>
                          <button
                            onClick={() => changeStatus(r._id, 'onaylandi')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition text-sm"
                            title="Onayla"
                          >
                            <CheckCircle2 size={15} /> Onayla
                          </button>
                          <button
                            onClick={() => changeStatus(r._id, 'reddedildi')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition text-sm border border-red-200"
                            title="Reddet"
                          >
                            <XCircle size={15} /> Reddet
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(r._id, r.request_no)}
                        className="flex-1 md:flex-none flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Yeni Talep Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 sm:my-8">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Yeni Satın Alma Talebi</h2>
                  <p className="text-sm text-gray-500">İhtiyacınız olan ürünleri talep edin</p>
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

              {/* Talep Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İstenen Tarih <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.wanted_date}
                    onChange={(e) => setForm({ ...form, wanted_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.entries(PRIORITIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Talep hakkında kısa açıklama..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Ürünler */}
              <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <PackagePlus size={16} className="text-blue-600" /> Talep Edilen Ürünler
                  </h3>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <Plus size={14} /> Satır Ekle
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => {
                    const selectedItem = items.find((i) => i._id === line.item_id);
                    return (
                      <div key={idx} className="flex flex-col md:flex-row gap-2 items-stretch md:items-center bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={line.item_id}
                            onChange={(e) => updateLine(idx, 'item_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                          >
                            <option value="">-- Ürün Seç --</option>
                            {items.map((i) => (
                              <option key={i._id} value={i._id}>
                                {i.item_code} — {i.item_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={line.quantity}
                            onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Miktar"
                          />
                          <span className="text-sm text-gray-500 w-12 text-center">
                            {selectedItem?.unit || '-'}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            disabled={lines.length === 1}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <Send size={18} /> Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detay Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  {selectedRequest.request_no}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Talep Detayı</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Durum */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const s = STATUSES[selectedRequest.status] || STATUSES.bekliyor;
                  const p = PRIORITIES[selectedRequest.priority] || PRIORITIES.normal;
                  const SI = s.icon;
                  return (
                    <>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${s.color}`}>
                        <SI size={14} /> {s.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.color}`}>
                        Öncelik: {p.label}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Bilgiler */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Building2 size={16} className="text-gray-400" />
                  <span className="text-gray-500">Departman:</span> {selectedRequest.department}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-500">Talep Eden:</span> {selectedRequest.requester?.name || '-'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-500">Talep Tarihi:</span> {selectedRequest.request_date}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-orange-500" />
                  <span className="text-gray-500">İstenen:</span> {selectedRequest.wanted_date}
                </div>
              </div>

              {/* Açıklama */}
              {selectedRequest.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Açıklama</p>
                  <p className="text-sm text-gray-700">{selectedRequest.description}</p>
                </div>
              )}

              {/* Ürün Tablosu */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Talep Edilen Ürünler</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Kod</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Ürün</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">Miktar</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600">Birim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.items?.map((it, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-mono text-xs text-gray-600">{it.item_code}</td>
                          <td className="px-3 py-2 text-gray-800">{it.item_name}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-800">{it.quantity}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{it.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aksiyonlar (durum: bekliyor ise) */}
              {selectedRequest.status === 'bekliyor' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => changeStatus(selectedRequest._id, 'onaylandi')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition"
                  >
                    <CheckCircle2 size={18} /> Onayla
                  </button>
                  <button
                    onClick={() => changeStatus(selectedRequest._id, 'reddedildi')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition"
                  >
                    <XCircle size={18} /> Reddet
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}