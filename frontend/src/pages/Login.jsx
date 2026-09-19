import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, LogIn, AlertTriangle, User, Lock } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { username, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: data._id,
          username: data.username,
          name: data.name,
          role: data.role,
        })
      );

      nav('/');
    } catch (err) {
      const isNetworkError = !err.response;

      if (isNetworkError) {
        // Demo mod
        if (username && password.length >= 6) {
          localStorage.setItem('token', 'demo-token-' + Date.now());
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: 'demo-admin',
              username: username,
              name: 'Demo Admin',
              role: 'yonetici',
            })
          );
          nav('/');
        } else {
          setError('Şifre en az 6 karakter olmalı');
        }
      } else {
        setError(err.response?.data?.message || 'Giriş başarısız');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Sipariş ve Stok Yönetimi</h1>
          <p className="text-slate-400 text-sm mt-1">Devam etmek için giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 Demo: <strong>admin / admin123</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}