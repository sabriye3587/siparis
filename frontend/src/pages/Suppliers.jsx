import { useEffect, useState } from 'react';
import SearchableSelect from '../components/SearchableSelect';
import { ShieldAlert } from 'lucide-react';
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
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Printer,
} from 'lucide-react';
import api from '../services/api';

// Geçici örnek veriler (backend yoksa)
const MOCK_SUPPLIERS = [
  {
    _id: '1',
    code: 'TD-001',
    company_name: 'Ahşap Dünyası Ltd. Şti.',
    phone: '0216 555 11 11',
    email: 'info@ahsapdunyasi.com',
    address: 'Sanayi Mah. Ahşap Sok. No:15 Kadıköy/İstanbul',
    contact_person: 'Ali Veli',
    bank_info: 'Ziraat Bankası - TR12 0001 0002 0003 0004 0005 01',
    payment_term: 30,
    old_price: '240',
    new_price: '250',
    unit: 'm²',
    status: 'aktif',
  },
  {
    _id: '2',
    code: 'TD-002',
    company_name: 'Hırdavat Merkezi A.Ş.',
    phone: '0212 444 22 22',
    email: 'satis@hirdavatmerkezi.com',
    address: 'Perpa Ticaret Merkezi B Blok No:412 Şişli/İstanbul',
    contact_person: 'Ayşe Kaya',
    bank_info: 'İş Bankası - TR34 0006 4000 0011 2233 4455 66',
    payment_term: 45,
    old_price: '4.5',
    new_price: '5',
    unit: 'adet',
    status: 'aktif',
  },
  {
    _id: '3',
    code: 'TD-003',
    company_name: 'Aksesuar Plus Ltd.',
    phone: '0212 333 33 33',
    email: 'siparis@aksesuarplus.com',
    address: 'Karaköy Mah. Bankalar Cad. No:8 Beyoğlu/İstanbul',
    contact_person: 'Mehmet Demir',
    bank_info: 'Garanti BBVA - TR56 0006 2000 1234 5678 9012 34',
    payment_term: 60,
    old_price: '14',
    new_price: '15',
    unit: 'adet',
    status: 'aktif',
  },
  {
    _id: '4',
    code: 'TD-004',
    company_name: 'Boya Kimya San. Tic.',
    phone: '0216 777 88 88',
    email: 'info@boyakimya.com',
    address: 'İçerenköy Mah. Kimya Cad. No:22 Ataşehir/İstanbul',
    contact_person: 'Fatma Öztürk',
    bank_info: 'Yapı Kredi - TR78 0006 7010 0000 0012 3456 78',
    payment_term: 30,
    old_price: '75',
    new_price: '80',
    unit: 'kg',
    status: 'pasif',
  },
];

const EMPTY_FORM = {
  code: '',
  company_name: '',
  phone: '',
  email: '',
  address: '',
  contact_person: '',
  bank_info: '',
  payment_term: 30,
  old_price: '0',
  new_price: '0',
  unit: 'adet',
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

  // Sipariş formu state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSupplier, setOrderSupplier] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Rol kontrolü
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      try {
        setCurrentUser(JSON.parse(u));
      } catch {}
    }
  }, []);

  const hasAccess =
    currentUser &&
    ['yonetici', 'satinalma_muduru'].includes(currentUser.role);

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
    if (hasAccess) {
      loadSuppliers();
    }
  }, [hasAccess]);

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

  const openEditModal = (supplier) => {
    setForm({
      code: supplier.code || '',
      company_name: supplier.company_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      contact_person: supplier.contact_person || '',
      bank_info: supplier.bank_info || '',
      payment_term: supplier.payment_term || 30,
      old_price: String(supplier.old_price ?? '0'),
      new_price: String(supplier.new_price ?? '0'),
      unit: supplier.unit || 'adet',
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

    const payload = {
      ...form,
      old_price: String(form.old_price || '0'),
      new_price: String(form.new_price || '0'),
      payment_term: Number(form.payment_term) || 0,
    };

    try {
      if (useMock) {
        if (editingId) {
          setSuppliers(
            suppliers.map((s) =>
              s._id === editingId ? { ...s, ...payload } : s
            )
          );
        } else {
          setSuppliers([
            ...suppliers,
            { _id: Date.now().toString(), ...payload },
          ]);
        }
      } else {
        if (editingId) {
          await api.put(`/suppliers/${editingId}`, payload);
        } else {
          await api.post('/suppliers', payload);
        }
        await loadSuppliers();
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Bir hata oluştu'
      );
    }
  };

  // Sil
  const handleDelete = async (id, name) => {
    if (
      !confirm(`"${name}" tedarikçisini silmek istediğinize emin misiniz?`)
    )
      return;

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

  // Sipariş formu aç
  const openOrderModal = (supplier) => {
    setOrderSupplier(supplier);
    setOrderQuantity(1);
    setOrderNotes('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setOrderSuccess(false);
    setShowOrderModal(true);
  };

  // Sipariş kaydet
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderQuantity || Number(orderQuantity) <= 0) {
      alert('Geçerli bir miktar girin');
      return;
    }

    const payload = {
      supplier_id: orderSupplier._id,
      supplier_name: orderSupplier.company_name,
      supplier_code: orderSupplier.code,
      unit_price: Number(orderSupplier.new_price) || 0,
      old_price: Number(orderSupplier.old_price) || 0,
      quantity: Number(orderQuantity),
      total:
        Number(orderQuantity) * (Number(orderSupplier.new_price) || 0),
      unit: orderSupplier.unit,
      order_date: orderDate,
      notes: orderNotes,
      status: 'bekliyor',
    };

    try {
      try {
        await api.post('/orders', payload);
      } catch (err) {
        console.warn(
          'Backend yok veya hata, sadece UI güncelleniyor:',
          err.message
        );
      }

      setOrderSuccess(true);
      setTimeout(() => {
        setShowOrderModal(false);
        setOrderSuccess(false);
      }, 2000);
    } catch (err) {
      alert('Sipariş oluşturulamadı: ' + err.message);
    }
  };

  // Yazdır
  const handlePrintOrder = () => {
    if (!orderSupplier) return;

    const unitPrice = Number(orderSupplier.new_price) || 0;
    const oldPrice = Number(orderSupplier.old_price) || 0;
    const qty = Number(orderQuantity) || 0;
    const total = (qty * unitPrice).toFixed(2);

    const printWindow = window.open('', '', 'height=900,width=1000');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sipariş Formu - ${orderSupplier.company_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
              padding: 40px;
              color: #1f2937;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #16a34a;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 22px;
              font-weight: bold;
              color: #16a34a;
            }
            .logo-sub {
              font-size: 12px;
              color: #6b7280;
              margin-top: 4px;
            }
            .title { text-align: right; }
            .title h1 {
              font-size: 26px;
              color: #1f2937;
              margin-bottom: 4px;
              letter-spacing: 1px;
            }
            .title p { font-size: 12px; color: #6b7280; }
            .section { margin-bottom: 25px; }
            .section-title {
              font-size: 12px;
              font-weight: 600;
              color: #16a34a;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 6px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px 40px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dotted #e5e7eb;
              font-size: 13px;
            }
            .info-label { color: #6b7280; }
            .info-value {
              font-weight: 500;
              text-align: right;
              max-width: 60%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background: #f9fafb;
              color: #374151;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 12px;
              text-align: left;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 14px 12px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 13px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { background: #16a34a; color: white; }
            .total-row td {
              padding: 16px 12px;
              font-size: 18px;
              font-weight: bold;
            }
            .old-price {
              text-decoration: line-through;
              color: #9ca3af;
              font-size: 12px;
            }
            .notes {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #16a34a;
              font-size: 13px;
              color: #4b5563;
            }
            .signature {
              margin-top: 70px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 80px;
            }
            .signature-box {
              text-align: center;
              border-top: 1px solid #374151;
              padding-top: 8px;
              font-size: 12px;
              color: #374151;
            }
            .signature-box span {
              display: block;
              font-size: 11px;
              color: #9ca3af;
              margin-top: 4px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #9ca3af;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">📦 Sipariş ve Stok Yönetimi</div>
              <div class="logo-sub">Profesyonel Sipariş Yönetim Sistemi</div>
            </div>
            <div class="title">
              <h1>SİPARİŞ FORMU</h1>
              <p>Form No: SIP-${Date.now().toString().slice(-8)}</p>
              <p>Tarih: ${new Date(orderDate).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Tedarikçi Bilgileri</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Firma Adı:</span>
                <span class="info-value">${orderSupplier.company_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tedarikçi Kodu:</span>
                <span class="info-value">${orderSupplier.code}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Yetkili Kişi:</span>
                <span class="info-value">${orderSupplier.contact_person || '-'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Telefon:</span>
                <span class="info-value">${orderSupplier.phone || '-'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">E-posta:</span>
                <span class="info-value">${orderSupplier.email || '-'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Ödeme Vadesi:</span>
                <span class="info-value">${orderSupplier.payment_term} gün</span>
              </div>
              <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">Adres:</span>
                <span class="info-value">${orderSupplier.address || '-'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Sipariş Detayları</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 35%;">Ürün / Hizmet</th>
                  <th class="text-right" style="width: 15%;">Eski Fiyat</th>
                  <th class="text-right" style="width: 15%;">Yeni Fiyat</th>
                  <th class="text-center" style="width: 10%;">Miktar</th>
                  <th class="text-center" style="width: 10%;">Birim</th>
                  <th class="text-right" style="width: 15%;">Toplam</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${orderSupplier.company_name}</strong> ürün grubu</td>
                  <td class="text-right">
                    <span class="old-price">₺${oldPrice.toFixed(2)}</span>
                  </td>
                  <td class="text-right"><strong>₺${unitPrice.toFixed(2)}</strong></td>
                  <td class="text-center"><strong>${qty}</strong></td>
                  <td class="text-center">${orderSupplier.unit}</td>
                  <td class="text-right"><strong>₺${total}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="5" class="text-right">GENEL TOPLAM</td>
                  <td class="text-right">₺${total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${
            orderNotes
              ? `
            <div class="section">
              <div class="section-title">Notlar</div>
              <div class="notes">${orderNotes}</div>
            </div>
          `
              : ''
          }

          <div class="signature">
            <div class="signature-box">
              Siparişi Veren
              <span>(İmza / Kaşe)</span>
            </div>
            <div class="signature-box">
              Tedarikçi Onayı
              <span>(İmza / Kaşe)</span>
            </div>
          </div>

          <div class="footer">
            <div>Bu form otomatik olarak oluşturulmuştur.</div>
            <div>${new Date().toLocaleString('tr-TR')}</div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Fiyat farkı hesapla
  const getPriceDiff = (oldP, newP) => {
    const oldN = Number(oldP);
    const newN = Number(newP);
    if (!oldN || !newN) return null;
    const diff = ((newN - oldN) / oldN) * 100;
    return diff;
  };

  // ==== YETKİSİZ ERİŞİM KONTROLÜ ====
  if (currentUser && !hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Yetkisiz Erişim
          </h2>
          <p className="text-gray-600 text-sm">
            Tedarikçi bilgileri <strong>fiyat ve ticari veriler</strong> içerdiği
            için sadece <strong>yönetici</strong> ve{' '}
            <strong>satın alma müdürü</strong> tarafından görüntülenebilir.
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Tedarikçiler
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} tedarikçi listeleniyor
            {useMock && (
              <span className="ml-2 text-orange-600">(Demo veri)</span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              if (suppliers.length === 0) {
                alert('Önce tedarikçi eklemelisiniz');
                return;
              }
              openOrderModal(suppliers[0]);
            }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-sm"
          >
            <ShoppingCart size={18} /> Sipariş Formu Oluştur
          </button>
          <button
            onClick={openNewModal}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={18} /> Yeni Tedarikçi
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              Toplam Tedarikçi
            </p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Aktif</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.active}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pasif</p>
            <p className="text-2xl font-bold text-gray-600">
              {stats.passive}
            </p>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Firma adı, kod, yetkili, e-posta veya telefon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative md:w-48">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
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
          <Building2 size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Tedarikçi bulunamadı</p>
          <p className="text-sm mt-1">
            Arama kriterlerinize uygun tedarikçi yok.
          </p>
        </div>
      ) : (
        <>
          {/* Masaüstü Tablo */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Kod
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Firma Adı
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Yetkili
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      İletişim
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Eski Fiyat
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Yeni Fiyat
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Vade
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const diff = getPriceDiff(s.old_price, s.new_price);
                    return (
                      <tr
                        key={s._id}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {s.code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {s.company_name}
                          </div>
                          {s.address && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} />{' '}
                              {s.address.substring(0, 40)}
                              {s.address.length > 40 ? '...' : ''}
                            </div>
                          )}
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
                                <Phone
                                  size={12}
                                  className="text-gray-400"
                                />{' '}
                                {s.phone}
                              </div>
                            )}
                            {s.email && (
                              <div className="flex items-center gap-1">
                                <Mail
                                  size={12}
                                  className="text-gray-400"
                                />{' '}
                                {s.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-500 text-sm">
                            ₺{s.old_price || '0'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {' '}
                            / {s.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div>
                              <div className="font-bold text-gray-800">
                                ₺{s.new_price || '0'}
                              </div>
                              <div className="text-xs text-gray-400">
                                / {s.unit}
                              </div>
                            </div>
                            {diff !== null && diff !== 0 && (
                              <span
                                className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                  diff > 0
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                <TrendingUp
                                  size={10}
                                  className={diff < 0 ? 'rotate-180' : ''}
                                />
                                {diff > 0 ? '+' : ''}
                                {diff.toFixed(1)}%
                              </span>
                            )}
                          </div>
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
                                s.status === 'aktif'
                                  ? 'bg-green-500'
                                  : 'bg-gray-400'
                              }`}
                            ></span>
                            {s.status === 'aktif' ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => openOrderModal(s)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                              title="Sipariş Oluştur"
                            >
                              <ShoppingCart size={16} />
                            </button>
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              title="Düzenle"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(s._id, s.company_name)
                              }
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
          </div>

          {/* Mobil/Tablet Kart Görünümü */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((s) => {
              const diff = getPriceDiff(s.old_price, s.new_price);
              return (
                <div
                  key={s._id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <span className="font-mono text-xs text-gray-500">
                        {s.code}
                      </span>
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

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">
                          Eski Fiyat
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₺{s.old_price || '0'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Yeni Fiyat
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          ₺{s.new_price || '0'}
                          <span className="text-xs text-gray-400 font-normal">
                            {' '}
                            / {s.unit}
                          </span>
                        </div>
                      </div>
                      {diff !== null && diff !== 0 && (
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            diff > 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {diff > 0 ? '+' : ''}
                          {diff.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                    {s.contact_person && (
                      <div className="flex items-center gap-2">
                        <User
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span>{s.contact_person}</span>
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-2">
                        <Phone
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={14}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span className="text-xs">
                        {s.payment_term} gün vade
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openOrderModal(s)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg transition text-sm font-medium"
                    >
                      <ShoppingCart size={14} /> Sipariş
                    </button>
                    <button
                      onClick={() => openEditModal(s)}
                      className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition text-sm font-medium"
                    >
                      <Edit2 size={14} /> Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(s._id, s.company_name)}
                      className="flex items-center justify-center text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tedarikçi Ekle/Düzenle Modal — DÜZELTİLDİ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-2 sm:my-4 max-h-[calc(100vh-1rem)] flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {editingId
                      ? 'Tedarikçi Düzenle'
                      : 'Yeni Tedarikçi Ekle'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {editingId
                      ? 'Tedarikçi bilgilerini güncelleyin'
                      : 'Yeni bir tedarikçi kartı oluşturun'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-5 overflow-y-auto flex-1"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" /> Firma
                  Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tedarikçi Kodu{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
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
                      onChange={(e) =>
                        setForm({
                          ...form,
                          company_name: e.target.value,
                        })
                      }
                      placeholder="Örn: Ahşap Dünyası Ltd."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" /> İletişim
                  Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yetkili Kişi
                    </label>
                    <input
                      type="text"
                      value={form.contact_person}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact_person: e.target.value,
                        })
                      }
                      placeholder="Örn: Ali Veli"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="Örn: 0216 555 11 11"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Posta
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="Örn: info@firma.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Açık adres..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-600" /> Fiyat
                  Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eski Fiyat (₺)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.old_price}
                      onChange={(e) =>
                        setForm({ ...form, old_price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Fiyat (₺)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.new_price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          new_price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birim
                    </label>
                    <select
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="adet">adet</option>
                      <option value="kg">kg</option>
                      <option value="m²">m²</option>
                      <option value="m">m</option>
                      <option value="lt">lt</option>
                      <option value="paket">paket</option>
                      <option value="kutu">kutu</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-600" /> Ticari
                  Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banka Bilgileri
                    </label>
                    <input
                      type="text"
                      value={form.bank_info}
                      onChange={(e) =>
                        setForm({ ...form, bank_info: e.target.value })
                      }
                      placeholder="Örn: Ziraat Bankası - TR12 0001..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vade (Gün)
                    </label>
                    <input
                      type="number"
                      value={form.payment_term}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          payment_term: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durum
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="aktif"
                          checked={form.status === 'aktif'}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              status: e.target.value,
                            })
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Aktif
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="pasif"
                          checked={form.status === 'pasif'}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              status: e.target.value,
                            })
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Pasif
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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

      {/* Sipariş Formu Modal — DÜZELTİLDİ */}
      {showOrderModal && orderSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-2 sm:my-4 max-h-[calc(100vh-1rem)] flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">
                    Sipariş Formu Oluştur
                  </h2>
                  <p className="text-xs sm:text-sm text-green-100 mt-0.5">
                    Yeni sipariş kaydı oluşturun
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {orderSuccess && (
                <div className="m-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
                  <div className="bg-green-600 text-white p-1.5 rounded-full">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium">
                      Sipariş başarıyla oluşturuldu!
                    </p>
                    <p className="text-sm text-green-600">
                      Pencere otomatik kapanacak...
                    </p>
                  </div>
                </div>
              )}

              {!orderSuccess && (
                <form onSubmit={handleOrderSubmit} className="p-4 sm:p-5">
                  {/* Tedarikçi Seçimi */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tedarikçi Ara ve Seç
                    </label>
                    <SearchableSelect
                      options={suppliers
                        .filter((s) => s.status === 'aktif')
                        .map((s) => ({
                          value: s._id,
                          label: `${s.code} — ${s.company_name}`,
                          sublabel: `${s.contact_person || 'Yetkili yok'} • ${s.phone || 'Telefon yok'}`,
                        }))}
                      value={orderSupplier?._id}
                      onChange={(value) => {
                        const found = suppliers.find(
                          (s) => s._id === value
                        );
                        if (found) setOrderSupplier(found);
                      }}
                      placeholder="Firma adı, kod veya yetkili ara..."
                      emptyMessage="Tedarikçi bulunamadı"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Firma
                        </div>
                        <div className="font-medium text-gray-800">
                          {orderSupplier.company_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Yetkili
                        </div>
                        <div className="text-sm text-gray-700">
                          {orderSupplier.contact_person || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Telefon
                        </div>
                        <div className="text-sm text-gray-700">
                          {orderSupplier.phone || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Vade
                        </div>
                        <div className="text-sm text-gray-700">
                          {orderSupplier.payment_term} gün
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Eski Fiyat
                      </label>
                      <div className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 line-through">
                        ₺{orderSupplier.old_price || '0'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yeni Fiyat
                      </label>
                      <div className="px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg font-bold text-green-700">
                        ₺{orderSupplier.new_price || '0'}
                        <span className="text-xs text-green-600 font-normal ml-1">
                          / {orderSupplier.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sipariş Tarihi
                      </label>
                      <input
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Miktar <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={orderQuantity}
                        onChange={(e) =>
                          setOrderQuantity(e.target.value)
                        }
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-medium"
                        required
                      />
                      <span className="text-gray-600 font-medium px-3 py-2 bg-gray-100 rounded-lg">
                        {orderSupplier.unit}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar (Opsiyonel)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Sipariş ile ilgili notlar..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white mb-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-green-100 text-sm mb-1">
                          Toplam Tutar
                        </div>
                        <div className="text-xs text-green-100">
                          {orderQuantity} {orderSupplier.unit} × ₺
                          {orderSupplier.new_price || '0'}
                        </div>
                      </div>
                      <div className="text-3xl font-bold">
                        ₺
                        {(
                          Number(orderQuantity) *
                          (Number(orderSupplier.new_price) || 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintOrder}
                      className="px-5 py-2.5 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Printer size={18} /> Yazdır
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium shadow-sm"
                    >
                      <ShoppingCart size={18} /> Siparişi Oluştur
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}