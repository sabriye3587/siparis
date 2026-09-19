import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  X,
  ArrowLeftRight,
  AlertTriangle,
  Filter,
  ChevronDown,
  Save,
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  Trash2,
  ClipboardList,
  Calendar,
  User,
  Warehouse,
  Package,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
} from 'lucide-react';
import api from '../services/api';

// Hareket türleri
const MOVEMENT_TYPES = {
  giris: {
    label: 'Giriş',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
    icon: ArrowDownToLine,
    sign: '+',
  },
  cikis: {
    label: 'Çıkış',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    icon: ArrowUpFromLine,
    sign: '-',
  },
  transfer: {
    label: 'Transfer',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    icon: Repeat,
    sign: '⇄',
  },
  sayim: {
    label: 'Sayım',
    color: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-500',
    icon: ClipboardList,
    sign: '=',
  },
  hurda: {
    label: 'Hurda',
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
    icon: Trash2,
    sign: '-',
  },
};

// Mock veriler
const MOCK_MOVEMENTS = [
  {
    _id: '1',
    item_code: 'MDF-001',
    item_name: 'MDF 18mm Beyaz',
    unit: 'm²',
    movement_type: 'giris',
    warehouse_name: 'Ana Depo',
    quantity: 150,
    reference_no: 'İRS-2026-0142',
    description: 'Ahşap Dünyası siparişi',
    movement_date: '2026-09-18T10:30:00',
    user_name: 'Mehmet Depo',
  },
  {
    _id: '2',
    item_code: 'MNT-001',
    item_name: 'Menteşe 35mm',
    unit: 'adet',
    movement_type: 'cikis',
    warehouse_name: 'Ana Depo',
    quantity: 500,
    reference_no: 'İŞE-2026-0089',
    description: 'Üretim emri #89 için',
    movement_date: '2026-09-18T14:15:00',
    user_name: 'Ayşe Üretim',
  },
  {
    _id: '3',
    item_code: 'VID-001',
    item_name: 'Vida 4x40',
    unit: 'adet',
    movement_type: 'transfer',
    warehouse_name: 'Ana Depo → Şube Depo',
    quantity: 1000,
    reference_no: 'TRF-2026-0023',
    description: 'Şube depo takviyesi',
    movement_date: '2026-09-17T09:00:00',
    user_name: 'Mehmet Depo',
  },
  {
    _id: '4',
    item_code: 'BOY-001',
    item_name: 'Boya Beyaz 20kg',
    unit: 'kg',
    movement_type: 'hurda',
    warehouse_name: 'Ana Depo',
    quantity: 15,
    reference_no: 'HRD-2026-0007',
    description: 'Son kullanma tarihi geçmiş',
    movement_date: '2026-09-16T16:45:00',
    user_name: 'Mehmet Depo',
  },
  {
    _id: '5',
    item_code: 'KLP-001',
    item_name: 'Kulp Modern 128mm',
    unit: 'adet',
    movement_type: 'sayim',
    warehouse_name: 'Ana Depo',
    quantity: 780,
    reference_no: 'SYM-2026-0005',
    description: 'Aylık sayım sonucu',
    movement_date: '2026-09-15T17:30:00',
    user_name: 'Mehmet Depo',
  },
  {
    _id: '6',
    item_code: 'MDF-001',
    item_name: 'MDF 18mm Beyaz',
    unit: 'm²',
    movement_type: 'cikis',
    warehouse_name: 'Ana Depo',
    quantity: 80,
    reference_no: 'İŞE-2026-0088',
    description: 'Üretim emri #88',
    movement_date: '2026-09-15T11:20:00',
    user_name: 'Ayşe Üretim',
  },
];

// Mock ürünler ve depolar
const MOCK_ITEMS = [
  { _id: '1', item_code: 'MDF-001', item_name: 'MDF 18mm Beyaz', unit: 'm²' },
  { _id: '2', item_code: 'MNT-001', item_name: 'Menteşe 35mm', unit: 'adet' },
  { _id: '3', item_code: 'VID-001', item_name: 'Vida 4x40', unit: 'adet' },
  { _id: '4', item_code: 'KLP-001', item_name: 'Kulp Modern 128mm', unit: 'adet' },
  { _id: '5', item_code: 'BOY-001', item_name: 'Boya Beyaz 20kg', unit: 'kg' },
];

const MOCK_WAREHOUSES = [
  { _id: '1', warehouse_name: 'Ana Depo' },
  { _id: '2', warehouse_name: 'Şube Depo' },
  { _id: '3', warehouse_name: 'Üretim Depo' },
];

const EMPTY_FORM = {
  item_id: '',
  movement_type: 'giris',
  warehouse_id: '',
  target_warehouse_id: '',
  quantity: '',
  reference_no: '',
  description: '',
};

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [items] = useState(MOCK_ITEMS);
  const [warehouses] = useState(MOCK_WAREHOUSES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);

  // Verileri yükle
  const loadMovements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stock');
      setMovements(data);
      setUseMock(false);
    } catch (err) {
      console.warn('API erişilemedi, mock data:', err.message);
      setMovements(MOCK_MOVEMENTS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  // Formu sıfırla
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setError('');
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.item_id) {
      setError('Ürün seçmelisiniz');
      return;
    }
    if (!form.warehouse_id) {
      setError('Depo seçmelisiniz');
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Geçerli bir miktar girin');
      return;
    }
    if (form.movement_type === 'transfer' && !form.target_warehouse_id) {
      setError('Transfer için hedef depo seçmelisiniz');
      return;
    }

    const item = items.find((i) => i._id === form.item_id);
    const warehouse = warehouses.find((w) => w._id === form.warehouse_id);

    const payload = {
      item_id: form.item_id,
      item_code: item?.item_code,
      item_name: item?.item_name,
      unit: item?.unit,
      movement_type: form.movement_type,
      warehouse_id: form.warehouse_id,
      warehouse_name: warehouse?.warehouse_name,
      target_warehouse_id: form.target_warehouse_id || null,
      quantity: Number(form.quantity),
      reference_no: form.reference_no,
      description: form.description,
    };

    try {
      if (useMock) {
        const newMovement = {
          _id: Date.now().toString(),
          ...payload,
          movement_date: new Date().toISOString(),
          user_name: 'Siz',
        };
        setMovements([newMovement, ...movements]);
      } else {
        await api.post('/stock', payload);
        await loadMovements();
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Sil
  const handleDelete = async (id, ref) => {
    if (!confirm(`Bu hareket kaydını silmek istediğinize emin misiniz?\nReferans: ${ref || id}`)) return;
    try {
      if (useMock) {
        setMovements(movements.filter((m) => m._id !== id));
      } else {
        await api.delete(`/stock/${id}`);
        await loadMovements();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Filtreleme
  const filtered = movements.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.item_code?.toLowerCase().includes(q) ||
      m.item_name?.toLowerCase().includes(q) ||
      m.reference_no?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.user_name?.toLowerCase().includes(q);
    const matchType = !typeFilter || m.movement_type === typeFilter;
    const matchWarehouse = !warehouseFilter || m.warehouse_name?.includes(warehouseFilter);
    const matchDate = !dateFilter || m.movement_date?.startsWith(dateFilter);
    return matchSearch && matchType && matchWarehouse && matchDate;
  });

  // İstatistikler
  const stats = {
    total: movements.length,
    giris: movements.filter((m) => m.movement_type === 'giris').length,
    cikis: movements.filter((m) => m.movement_type === 'cikis').length,
    hurda: movements.filter((m) => m.movement_type === 'hurda').length,
  };

  // Tarih formatla
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Stok Hareketleri</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} hareket listeleniyor
            {useMock && <span className="ml-2 text-orange-600">(Demo veri)</span>}
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} /> Yeni Hareket
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><ArrowLeftRight size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Toplam Hareket</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg"><TrendingUp size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Giriş</p>
            <p className="text-2xl font-bold text-green-600">{stats.giris}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-red-100 text-red-600 p-3 rounded-lg"><TrendingDown size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Çıkış</p>
            <p className="text-2xl font-bold text-red-600">{stats.cikis}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-lg"><Trash2 size={22} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Hurda</p>
            <p className="text-2xl font-bold text-orange-600">{stats.hurda}</p>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Ürün, referans, açıklama veya kullanıcı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Tüm Türler</option>
              {Object.entries(MOVEMENT_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          <div className="relative">
            <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Tüm Depolar</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w.warehouse_name}>{w.warehouse_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Tarih filtresi */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Tarih:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-red-600 hover:underline"
              >
                Temizle
              </button>
            )}
          </div>
          {(search || typeFilter || warehouseFilter || dateFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('');
                setWarehouseFilter('');
                setDateFilter('');
              }}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              <X size={12} /> Filtreleri Temizle
            </button>
          )}
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
          <ArrowLeftRight size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Hareket bulunamadı</p>
          <p className="text-sm mt-1">Arama kriterlerinize uygun hareket yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tarih</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Tür</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Ürün</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Depo</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Miktar</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Referans</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Kullanıcı</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const t = MOVEMENT_TYPES[m.movement_type] || MOVEMENT_TYPES.giris;
                  const TypeIcon = t.icon;
                  const isPositive = m.movement_type === 'giris';
                  const isNegative = m.movement_type === 'cikis' || m.movement_type === 'hurda';
                  return (
                    <tr key={m._id} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(m.movement_date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${t.color}`}>
                          <TypeIcon size={12} />
                          {t.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{m.item_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{m.item_code}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Warehouse size={12} className="text-gray-400" />
                          {m.warehouse_name || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-blue-600'
                          }`}
                        >
                          {isPositive ? '+' : isNegative ? '-' : t.sign}
                          {m.quantity} {m.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-mono text-gray-700">{m.reference_no || '-'}</div>
                        {m.description && (
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{m.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <User size={12} className="text-gray-400" />
                          {m.user_name || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(m._id, m.reference_no)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yeni Hareket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Yeni Stok Hareketi</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Stok giriş/çıkış işlemi kaydet</p>
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

              {/* Hareket Türü Seçimi */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hareket Türü <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(MOVEMENT_TYPES).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const isActive = form.movement_type === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, movement_type: key })}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 transition ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ürün + Miktar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.item_id}
                    onChange={(e) => setForm({ ...form, item_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">-- Ürün Seç --</option>
                    {items.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.item_code} — {i.item_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miktar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Depo(lar) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.movement_type === 'transfer' ? 'Kaynak Depo' : 'Depo'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.warehouse_id}
                    onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">-- Depo Seç --</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>{w.warehouse_name}</option>
                    ))}
                  </select>
                </div>

                {form.movement_type === 'transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hedef Depo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.target_warehouse_id}
                      onChange={(e) => setForm({ ...form, target_warehouse_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="">-- Hedef Depo Seç --</option>
                      {warehouses
                        .filter((w) => w._id !== form.warehouse_id)
                        .map((w) => (
                          <option key={w._id} value={w._id}>{w.warehouse_name}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Referans + Açıklama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referans No</label>
                  <input
                    type="text"
                    value={form.reference_no}
                    onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                    placeholder="Örn: İRS-2026-0142"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Kısa açıklama..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Önizleme */}
              {form.item_id && form.quantity && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                    <FileText size={14} /> İşlem Önizlemesi
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      {items.find((i) => i._id === form.item_id)?.item_name}
                    </span>
                    <span
                      className={`font-bold ${
                        form.movement_type === 'giris'
                          ? 'text-green-600'
                          : form.movement_type === 'cikis' || form.movement_type === 'hurda'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {form.movement_type === 'giris' ? '+' : ''}
                      {form.movement_type === 'cikis' || form.movement_type === 'hurda' ? '-' : ''}
                      {form.quantity} {items.find((i) => i._id === form.item_id)?.unit}
                    </span>
                  </div>
                </div>
              )}

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
                  <Save size={18} /> Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}