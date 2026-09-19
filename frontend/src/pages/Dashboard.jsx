import { Package, Users, ClipboardList, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  // Şimdilik örnek veriler
  const data = {
    total_items: 42,
    total_suppliers: 8,
    pending_requests: 5,
    critical_stocks: [
      { id: 1, item_code: 'MDF-001', item_name: 'MDF 18mm', stock: 12 },
      { id: 2, item_code: 'VID-003', item_name: 'Vida 4x40', stock: 8 },
    ],
  };

  const cards = [
    { label: 'Toplam Ürün', value: data.total_items, icon: Package, color: 'bg-blue-500' },
    { label: 'Tedarikçi', value: data.total_suppliers, icon: Users, color: 'bg-green-500' },
    { label: 'Bekleyen Talep', value: data.pending_requests, icon: ClipboardList, color: 'bg-yellow-500' },
    { label: 'Kritik Stok', value: data.critical_stocks.length, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
            <div className={`${c.color} text-white p-3 rounded-lg`}>
              <c.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4 text-red-600">
          ⚠️ Kritik Stok Seviyesindeki Ürünler
        </h2>
        {data.critical_stocks.length === 0 ? (
          <p className="text-gray-500">Kritik stok yok 👍</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Kod</th>
                  <th className="p-2 text-left">Ürün</th>
                  <th className="p-2 text-right">Stok</th>
                </tr>
              </thead>
              <tbody>
                {data.critical_stocks.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 font-mono">{s.item_code}</td>
                    <td className="p-2">{s.item_name}</td>
                    <td className="p-2 text-right font-bold text-red-600">{s.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}