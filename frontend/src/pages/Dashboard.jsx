import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Users,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  Activity,
  DollarSign,
  Layers,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';

// Renkler
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Kullanıcı bilgisi
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  // Verileri yükle
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard yüklenemedi:', err);
      // Demo veri fallback
      setData({
        total_items: 42,
        total_suppliers: 8,
        active_suppliers: 6,
        total_users: 5,
        pending_requests: 3,
        critical_stocks: [],
        recent_movements: [],
        recent_requests: [],
        category_chart: [
          { name: 'MDF', value: 12 },
          { name: 'Kenarbant', value: 8 },
          { name: 'Tutkal', value: 6 },
          { name: 'Diğer', value: 16 },
        ],
        weekly_trend: [
          { day: 'Pzt', giris: 120, cikis: 80 },
          { day: 'Sal', giris: 90, cikis: 110 },
          { day: 'Çar', giris: 150, cikis: 70 },
          { day: 'Per', giris: 80, cikis: 130 },
          { day: 'Cum', giris: 200, cikis: 90 },
          { day: 'Cmt', giris: 60, cikis: 40 },
          { day: 'Paz', giris: 30, cikis: 20 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Saat bazlı selamlama
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // Tarih formatla
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Kısa tarih
  const shortDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };

  // Yükleniyor
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Stat kartları
  const cards = [
    {
      label: 'Toplam Ürün',
      value: data.total_items,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      link: '/items',
      subtitle: 'Malzeme deposu',
    },
    {
      label: 'Tedarikçi',
      value: data.total_suppliers,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      text: 'text-green-600',
      link: '/suppliers',
      subtitle: `${data.active_suppliers} aktif`,
    },
    {
      label: 'Bekleyen Talep',
      value: data.pending_requests,
      icon: ClipboardList,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      link: '/requests',
      subtitle: 'Onay bekliyor',
    },
    {
      label: 'Kritik Stok',
      value: data.critical_stocks.length,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      text: 'text-red-600',
      link: '/items',
      subtitle: 'Acil sipariş',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Karşılama */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Kullanıcı'}! 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              {new Date().toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="self-start md:self-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm"
          >
            <RefreshCw size={16} /> Yenile
          </button>
        </div>
      </div>

      {/* Stat Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.link}
            className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition group border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`bg-gradient-to-br ${c.color} text-white p-3 rounded-lg shadow-sm`}
              >
                <c.icon size={22} />
              </div>
              <ArrowRight
                size={16}
                className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-0.5">{c.value}</p>
              <p className={`text-xs ${c.text} mt-1 font-medium`}>{c.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Haftalık Hareket Trendi */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Haftalık Stok Hareketi
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Son 7 günlük giriş/çıkış</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Giriş</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Çıkış</span>
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={data.weekly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="giris" fill="#10b981" radius={[4, 4, 0, 0]} name="Giriş" />
                <Bar dataKey="cikis" fill="#ef4444" radius={[4, 4, 0, 0]} name="Çıkış" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kategori Dağılımı */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers size={20} className="text-purple-600" />
              Kategori Dağılımı
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Ürün sayısı</p>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.category_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.category_chart.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  iconType="circle"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* İki Kolon: Kritik Stok + Son Hareketler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kritik Stok */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Kritik Stok</h2>
                <p className="text-xs text-gray-500">
                  {data.critical_stocks.length} ürün kritik seviyede
                </p>
              </div>
            </div>
            <Link
              to="/items"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Tümü <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-5">
            {data.critical_stocks.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  ✓
                </div>
                <p className="text-gray-600 font-medium">Kritik stok yok</p>
                <p className="text-xs text-gray-400 mt-1">Tüm ürünler yeterli seviyede</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.critical_stocks.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {s.item_name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{s.item_code}</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-lg font-bold text-red-600">
                        {s.current_stock}
                      </div>
                      <div className="text-xs text-gray-500">
                        min: {s.critical_level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Son Stok Hareketleri */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Son Hareketler</h2>
                <p className="text-xs text-gray-500">Son 5 stok işlemi</p>
              </div>
            </div>
            <Link
              to="/stock"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Tümü <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-5">
            {data.recent_movements.length === 0 ? (
              <div className="text-center py-8">
                <Activity size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Henüz hareket yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recent_movements.map((m) => {
                  const isIn = m.movement_type === 'giris';
                  return (
                    <div
                      key={m._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          isIn
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {isIn ? (
                          <ArrowDownToLine size={14} />
                        ) : (
                          <ArrowUpFromLine size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {m.item_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {m.user_name} • {formatDate(m.movement_date)}
                        </div>
                      </div>
                      <div
                        className={`font-bold text-sm ${
                          isIn ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isIn ? '+' : '−'}
                        {m.quantity} {m.unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Son Talepler */}
      {data.recent_requests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                <ClipboardList size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Son Talepler</h2>
                <p className="text-xs text-gray-500">En son oluşturulan 5 talep</p>
              </div>
            </div>
            <Link
              to="/requests"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Tümü <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Talep No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Departman</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Talep Eden</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Durum</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_requests.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-gray-100 hover:bg-blue-50/50 transition"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {r.request_no}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.department}</td>
                    <td className="px-4 py-3 text-gray-600">{r.requester_name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === 'bekliyor'
                            ? 'bg-yellow-100 text-yellow-700'
                            : r.status === 'onaylandi'
                            ? 'bg-green-100 text-green-700'
                            : r.status === 'reddedildi'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {r.status === 'bekliyor'
                          ? 'Bekliyor'
                          : r.status === 'onaylandi'
                          ? 'Onaylandı'
                          : r.status === 'reddedildi'
                          ? 'Reddedildi'
                          : 'Siparişe Dönüştü'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {shortDate(r.request_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/items"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 group"
        >
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
            <Package size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Malzeme Deposu</span>
        </Link>

        <Link
          to="/stock"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 group"
        >
          <div className="bg-purple-100 text-purple-600 p-3 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
            <Activity size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Stok Hareketleri</span>
        </Link>

        <Link
          to="/requests"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 group"
        >
          <div className="bg-amber-100 text-amber-600 p-3 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
            <ClipboardList size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Talepler</span>
        </Link>

        <Link
          to="/suppliers"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 group"
        >
          <div className="bg-green-100 text-green-600 p-3 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
            <ShoppingCart size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Sipariş Oluştur</span>
        </Link>
      </div>
    </div>
  );
}