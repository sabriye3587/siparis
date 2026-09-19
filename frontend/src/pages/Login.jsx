import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, LogIn, AlertTriangle, Mail, Lock } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gerçek API'ye giriş denemesi
      const { data } = await api.post('/auth/login', { email, password });

      // Token ve kullanıcı bilgisini kaydet
      localStorage.setItem('token', data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      nav('/');
    } catch (err) {
      // Backend çalışmıyorsa demo moduna geç
      const isNetworkError = !err.response;

      if (isNetworkError) {
        console.warn('Backend erişilemedi, demo moda geçiliyor');

        // Demo giriş: herhangi bir e-posta + en az 6 karakter şifre
        if (email && password.length >= 6) {
          localStorage.setItem('token', 'demo-token-' + Date.now());
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: 'demo-admin',
              name: 'Demo Admin',
              email: email,
              role: 'yonetici', // Demo modda admin olarak giriş yapılır
            })
          );
          nav('/');
        } else {
          setError('Şifre en az 6 karakter olmalı');
        }
      } else {
        // API'den gelen hata mesajı
        setError(err.response?.data?.message || 'Giriş başarısız');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Sipariş ve Stok Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">Devam etmek için giriş yapın</p>
        </div>

        {/* Form Kartı */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-2xl"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* E-posta */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@stok.com"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn size={18} />
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          {/* Bilgi Notu */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              💡 Backend çalışmıyorsa <strong>demo mod</strong> aktif olur:
              <br />
              Herhangi bir e-posta + en az 6 karakter şifre yeterlidir.
            </p>
          </div>
        </form>

        {/* Alt Bilgi */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 Sipariş ve Stok Yönetimi • v1.0
        </p>
      </div>
    </div>
  );
}