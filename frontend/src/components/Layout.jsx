import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  ArrowLeftRight,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const menu = [
  { to: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
  { to: '/items', label: 'Malzeme Depo', icon: Package },
  { to: '/suppliers', label: 'Tedarikçiler', icon: Users },
  { to: '/requests', label: 'Talepler', icon: ClipboardList },
  { to: '/stock', label: 'Stok Hareketleri', icon: ArrowLeftRight },
  { to: '/admin/users', label: 'Kullanıcı Yönetimi', icon: ShieldCheck },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobil üst bar */}
      <header className="md:hidden bg-slate-800 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-bold">📦 Sipariş ve Stok Yönetimi</h1>
        <button onClick={() => setOpen(!open)} aria-label="Menü">
          {open ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          open ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-800 text-white md:min-h-screen flex-shrink-0`}
      >
        <div className="p-4 hidden md:block border-b border-slate-700">
          <h1 className="text-xl font-bold">📦 Sipariş ve Stok Yönetimi</h1>
        </div>

        <nav className="p-2 space-y-1">
          {menu.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                pathname === to ? 'bg-blue-600' : 'hover:bg-slate-700'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600 mt-4 transition"
          >
            <LogOut size={18} /> Çıkış
          </button>
        </nav>
      </aside>

      {/* İçerik */}
      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}