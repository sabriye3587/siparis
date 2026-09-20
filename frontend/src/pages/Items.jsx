import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  AlertTriangle,
  Filter,
  ChevronDown,
  Save,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  TrendingDown,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import api from '../services/api';

// Geçici örnek veriler
const MOCK_ITEMS = [
  { _id: '1', item_code: 'MDF-001', item_name: 'MDF 18mm Beyaz', unit: 'm²', category: 'MDF', brand: 'Kastamonu', min_stock: 50, max_stock: 500, critical_level: 100, last_purchase_price: 250, current_stock: 320 },
  { _id: '2', item_code: 'MNT-001', item_name: 'Menteşe 35mm', unit: 'adet', category: 'Diğer', brand: 'Blum', min_stock: 200, max_stock: 2000, critical_level: 500, last_purchase_price: 5, current_stock: 150 },
  { _id: '3', item_code: 'VID-001', item_name: 'Vida 4x40', unit: 'adet', category: 'Diğer', brand: 'Reisser', min_stock: 1000, max_stock: 10000, critical_level: 2000, last_purchase_price: 0.5, current_stock: 8500 },
  { _id: '4', item_code: 'KLP-001', item_name: 'Kulp Modern 128mm', unit: 'adet', category: 'Aksesuar', brand: 'Hettich', min_stock: 100, max_stock: 1000, critical_level: 200, last_purchase_price: 15, current_stock: 780 },
  { _id: '5', item_code: 'BOY-001', item_name: 'Boya Beyaz 20kg', unit: 'kg', category: 'Kimyasal', brand: 'Marshall', min_stock: 20, max_stock: 200, critical_level: 50, last_purchase_price: 80, current_stock: 35 },
];

const CATEGORIES = ['MDF', 'Kenarbant-kapak', 'Kenarbant-kapı', 'PVC-kapak', 'PVC-kapı', 'Tutkal-kapak', 'Tutkal-kapı', 'Diğer'];
const UNITS = ['adet', 'kg', 'm²', 'm', 'lt', 'paket', 'kutu'];

const EMPTY_FORM = {
  item_code: '',
  item_name: '',
  category: 'MDF',
  sub_category: '',
  unit: 'adet',
  brand: '',
  barcode: '',
  min_stock: 0,
  max_stock: 0,
  critical_level: 0,
  last_purchase_price: 0,
};

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);

  // Stok hareket state
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockItem, setStockItem] = useState(null);
  const [stockType, setStockType] = useState('giris'); // 'giris' | 'cikis'
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockDescription, setStockDescription] = useState('');
  const [stockReference, setStockReference] = useState('');
  const [stockSuccess, setStockSuccess] = useState(false);
  const [stockError, setStockError] = useState('');

  // Verileri yükle
  const loadItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/items');
      setItems(data);
      setUseMock(false);
    } catch (err) {
      console.warn('API erişilemedi, mock data kullanılıyor:', err.message);
      setItems(MOCK_ITEMS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

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

  const openEditModal = (item) => {
    setForm({
      item_code: item.item_code || '',
      item_name: item.item_name || '',
      category: item.category || 'MDF',
      sub_category: item.sub_category || '',
      unit: item.unit || 'adet',
      brand: item.brand || '',
      barcode: item.barcode || '',
      min_stock: item.min_stock || 0,
      max_stock: item.max_stock || 0,
      critical_level: item.critical_level || 0,
      last_purchase_price: item.last_purchase_price || 0,
    });
    setEditingId(item._id);
    setError('');
    setShowModal(true);
  };

  // Kaydet (Ürün ekle/güncelle)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.item_code.trim() || !form.item_name.trim()) {
      setError('Ürün kodu ve adı zorunludur');
      return;
    }

    try {
      if (useMock) {
        if (editingId) {
          setItems(items.map((i) => (i._id === editingId ? { ...i, ...form } : i)));
        } else {
          setItems([...items, { _id: Date.now().toString(), ...form, current_stock: 0 }]);
        }
      } else {
        if (editingId) {
          await api.put(`/items/${editingId}`, form);
        } else {
          await api.post('/items', form);
        }
        await loadItems();
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Bir hata oluştu');
    }
  };

  // Sil
  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;

    try {
      if (useMock) {
        setItems(items.filter((i) => i._id !== id));
      } else {
        await api.delete(`/items/${id}`);
        await loadItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // ⬇️ STOK HAREKET MODAL'I
  const openStockModal = (item, type) => {
    setStockItem(item);
    setStockType(type);
    setStockQuantity(1);
    setStockDescription('');
    setStockReference('');
    setStockSuccess(false);
    setStockError('');
    setShowStockModal(true);
  };

  // Stok hareketi kaydet
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setStockError('');

    if (!stockQuantity || Number(stockQuantity) <= 0) {
      setStockError('Geçerli bir miktar girin');
      return;
    }

    const endpoint = stockType === 'giris' ? 'stock-in' : 'stock-out';
    const payload = {
      quantity: Number(stockQuantity),
      description: stockDescription,
      reference_no: stockReference,
    };

    try {
      if (useMock) {
        // Mock: sadece UI güncelle
        const delta = stockType === 'giris' ? Number(stockQuantity) : -Number(stockQuantity);
        setItems(
          items.map((i) =>
            i._id === stockItem._id
              ? { ...i, current_stock: (i.current_stock || 0) + delta }
              : i
          )
        );
      } else {
        const { data } = await api.post(`/items/${stockItem._id}/${endpoint}`, payload);

        // Ürün listesini güncelle
        setItems(
          items.map((i) =>
            i._id === stockItem._id ? { ...i, current_stock: data.current_stock } : i
          )
        );
      }

      setStockSuccess(true);
      setTimeout(() => {
        setShowStockModal(false);
        setStockSuccess(false);
      }, 1500);
    } catch (err) {
      setStockError(err.response?.data?.message || err.message || 'Bir hata oluştu');
    }
  };

  // Filtreleme
  const filtered = items.filter((item) => {
    const matchSearch =
      item.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Stok durumu hesapla
  const getStockStatus = (item) => {
    const stock = item.current_stock ?? 0;
    if (stock <= item.critical_level)
      return { label: 'Kritik', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    if (stock <= item.min_stock)
      return { label: 'Düşük', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' };
    return { label: 'Yeterli', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
  };

  return (
    <div>
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Malzeme Depo</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} ürün listeleniyor
            {useMock && <span className="ml-2 text-orange-600">(Demo veri)</span>}
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} /> Yeni Ürün
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Ürün adı, kodu veya marka ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative md:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Tüm Kategoriler</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Ürün bulunamadı</p>
            <p className="text-sm mt-1">Arama kriterlerinize uygun ürün yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Kod</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Ürün Adı</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Kategori</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Birim</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Mevcut Stok</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Min / Kritik</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Durum</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Hızlı İşlem</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Diğer</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item._id} className="border-b border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.item_code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{item.item_name}</div>
                        {item.brand && (
                          <div className="text-xs text-gray-500">{item.brand}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {item.category || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">{item.unit}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-lg font-bold text-gray-800">
                          {item.current_stock ?? 0}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 text-xs">
                        {item.min_stock} / <span className="font-medium text-red-600">{item.critical_level}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`${status.color} px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {/* + GİRİŞ BUTONU */}
                          <button
                            onClick={() => openStockModal(item, 'giris')}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium shadow-sm"
                            title="Stok Giriş (Ürün geldi)"
                          >
                            <PlusCircle size={14} /> Giriş
                          </button>

                          {/* - ÇIKIŞ BUTONU */}
                          <button
                            onClick={() => openStockModal(item, 'cikis')}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-medium shadow-sm"
                            title="Stok Çıkış (Ürün kullanıldı)"
                          >
                            <MinusCircle size={14} /> Çıkış
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.item_name)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
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
        )}
      </div>

      {/* Ürün Ekle/Düzenle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingId ? 'Ürün bilgilerini güncelleyin' : 'Yeni bir ürün kartı oluşturun'}
                </p>
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
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Kodu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.item_code}
                    onChange={(e) => setForm({ ...form, item_code: e.target.value })}
                    placeholder="Örn: MDF-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.item_name}
                    onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                    placeholder="Örn: MDF 18mm Beyaz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Kategori</label>
                  <input
                    type="text"
                    value={form.sub_category}
                    onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                    placeholder="Örn: Beyaz Seri"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Örn: Kastamonu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barkod</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    placeholder="Opsiyonel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Son Alış Fiyatı (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.last_purchase_price}
                    onChange={(e) => setForm({ ...form, last_purchase_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Stok Seviyeleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stok</label>
                    <input
                      type="number"
                      value={form.min_stock}
                      onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Stok</label>
                    <input
                      type="number"
                      value={form.max_stock}
                      onChange={(e) => setForm({ ...form, max_stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kritik Seviye</label>
                    <input
                      type="number"
                      value={form.critical_level}
                      onChange={(e) => setForm({ ...form, critical_level: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                  <Save size={18} />
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⬇️ STOK HAREKET MODAL */}
      {showStockModal && stockItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
            {/* Başlık */}
            <div
              className={`flex justify-between items-center p-5 border-b rounded-t-2xl text-white ${
                stockType === 'giris'
                  ? 'bg-gradient-to-r from-green-600 to-green-700'
                  : 'bg-gradient-to-r from-red-600 to-red-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  {stockType === 'giris' ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {stockType === 'giris' ? 'Stok Girişi' : 'Stok Çıkışı'}
                  </h2>
                  <p className="text-xs text-white/80 mt-0.5">
                    {stockType === 'giris' ? 'Depoya ürün ekle' : 'Depodan ürün çıkar'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {stockSuccess && (
              <div className="m-5 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                <div className="bg-green-600 text-white p-1 rounded-full">✓</div>
                <span>İşlem başarılı!</span>
              </div>
            )}

            {!stockSuccess && (
              <form onSubmit={handleStockSubmit} className="p-5">
                {stockError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {stockError}
                  </div>
                )}

                {/* Ürün Bilgi Kartı */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Ürün</div>
                  <div className="font-medium text-gray-800">{stockItem.item_name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-xs text-gray-500">{stockItem.item_code}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      Mevcut: {stockItem.current_stock ?? 0} {stockItem.unit}
                    </span>
                  </div>
                </div>

                {/* Miktar */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miktar <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStockQuantity(Math.max(1, Number(stockQuantity) - 1))}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700 transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="flex-1 text-center px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setStockQuantity(Number(stockQuantity) + 1)}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700 transition"
                    >
                      +
                    </button>
                    <span className="text-gray-600 font-medium text-sm w-12 text-center">
                      {stockItem.unit}
                    </span>
                  </div>
                </div>

                {/* Hızlı miktar butonları */}
                <div className="flex gap-2 mb-4">
                  {[5, 10, 20, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setStockQuantity(q)}
                      className="flex-1 text-xs py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Açıklama */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={stockDescription}
                    onChange={(e) => setStockDescription(e.target.value)}
                    placeholder={
                      stockType === 'giris'
                        ? 'Örn: Fatura no 12345 - Tedarikçi X'
                        : 'Örn: Üretim emri #89 için'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Referans No */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referans No (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={stockReference}
                    onChange={(e) => setStockReference(e.target.value)}
                    placeholder="Örn: IRS-2026-0142"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Önizleme */}
                {stockQuantity > 0 && (
                  <div
                    className={`rounded-lg p-3 mb-4 border ${
                      stockType === 'giris'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Yeni stok:</span>
                      <span
                        className={`font-bold ${
                          stockType === 'giris' ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {stockItem.current_stock ?? 0}{' '}
                        {stockType === 'giris' ? '+' : '−'} {stockQuantity} ={' '}
                        {stockType === 'giris'
                          ? (stockItem.current_stock ?? 0) + Number(stockQuantity)
                          : Math.max(0, (stockItem.current_stock ?? 0) - Number(stockQuantity))}{' '}
                        {stockItem.unit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Butonlar */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowStockModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 text-white px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 font-medium shadow-sm ${
                      stockType === 'giris'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {stockType === 'giris' ? (
                      <>
                        <PlusCircle size={18} /> Girişi Kaydet
                      </>
                    ) : (
                      <>
                        <MinusCircle size={18} /> Çıkışı Kaydet
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}