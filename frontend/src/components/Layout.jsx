import { useState, useEffect } from 'react';
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

// Menu items with allowed roles
const ALL_MENU = [
  {
    to: '/',
    label: 'Ana Sayfa',
    icon: LayoutDashboard,
    roles: ['yonetici', 'satinalma_muduru', 'depo_sorumlusu', 'uretim_sorumlusu', 'talep_kullanici'],
  },
  {
    to: '/items',
    label: 'Malzeme Depo',
    icon: Package,
    roles: ['yonetici', 'satinalma_muduru', 'depo_sorumlusu', 'uretim_sorumlusu'],
  },
  {
    to: '/suppliers',
    label: 'Tedarikçiler',
    icon: Users,
    roles: ['yonetici', 'satinalma_muduru'], // 🔒 Sadece admin + satın alma
  },
  {
    to: '/requests',
    label: 'Talepler',
    icon: ClipboardList,
    roles: ['yonetici', 'satinalma_muduru', 'depo_sorumlusu', 'uretim_sorumlusu', 'talep_kullanici'],
  },
  {
    to: '/stock',
    label: 'Stok Hareketleri',
    icon: ArrowLeftRight,
    roles: ['yonetici', 'satinalma_muduru', 'depo_sorumlusu'],
  },
  {
    to: '/admin/users',
    label: 'Kullanıcı Yönetimi',
    icon: ShieldCheck,
    roles: ['yonetici'], // 🔒 Sadece admin
  },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { pathname } = useLocation();
  const nav = useNavigate();

  // Kullanıcı bilgisini al
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    nav('/login');
  };

  // Kullanıcının rolüne göre menüyü filtrele
  const userRole = user?.role || 'talep_kullanici';
  const menu = ALL_MENU.filter((item) => item.roles.includes(userRole));

  // Kullanıcı rolü etiketi
  const roleLabels = {
    yonetici: { label: 'Yönetici', color: 'bg-red-500' },
    satinalma_muduru: { label: 'Satın Alma', color: 'bg-purple-500' },
    depo_sorumlusu: { label: 'Depo', color: 'bg-blue-500' },
    uretim_sorumlusu: { label: 'Üretim', color: 'bg-amber-500' },
    talep_kullanici: { label: 'Talep', color: 'bg-gray-500' },
  };
  const roleInfo = roleLabels[userRole] || roleLabels.talep_kullanici;

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
        } md:block w-full md:w-64 bg-slate-800 text-white md:min-h-screen flex-shrink-0 flex flex-col`}
      >
        <div className="p-4 hidden md:block border-b border-slate-700">
          <h1 className="text-xl font-bold">📦 Sipariş ve Stok Yönetimi</h1>
        </div>

        {/* Kullanıcı Bilgisi */}
        {user && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`${roleInfo.color} text-white text-xs px-1.5 py-0.5 rounded font-medium`}
                  >
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
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