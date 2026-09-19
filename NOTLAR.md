# 📦 Stok Yönetimi Projesi - İlerleme Notları

> **Bu dosya, her oturum sonunda güncellenir. Yeni bir sohbette bu dosyayı paylaşarak kaldığımız yerden devam edebiliriz.**

---

## 📅 Son Güncelleme
**Tarih:** 19.09.2026  
**Saat:** 18:15

---

## 🎯 Proje Hakkında

**Proje Adı:** Satın Alma, Stok ve Üretim Takip Sistemi  
**Teknolojiler:**
- Frontend: React + Vite + TailwindCSS v4 + React Router + Axios + Recharts + Lucide Icons
- Backend: Node.js + Express + MySQL2 + JWT + Bcrypt
- Veritabanı: MySQL

**Konum:** `C:\Users\sabri\Desktop\PROJELER\stok-yonetim`

**Modüller (planlanan):**
1. Tedarikçi Yönetimi
2. Stok Kartları
3. Satın Alma Talepleri
4. Teklif Toplama
5. Satın Alma Siparişleri
6. Mal Kabul
7. Depo Yönetimi
8. Üretim (BOM + İş Emirleri)
9. Fatura Takibi
10. Raporlama
11. Kullanıcı ve Yetki Yönetimi

---

## ✅ Tamamlanan İşler

### Ortam Kurulumu
- ✅ Node.js kuruldu (v24.21.0)
- ✅ npm kuruldu (11.19.0)
- ✅ PowerShell Execution Policy: `RemoteSigned` (CurrentUser)

### Frontend Kurulumu
- ✅ Vite + React projesi oluşturuldu (`frontend/`)
- ✅ TailwindCSS v4 kuruldu (`@tailwindcss/vite`)
- ✅ Paketler kuruldu:
  - `react-router-dom`
  - `axios`
  - `recharts`
  - `lucide-react`
  - `tailwindcss`
  - `@tailwindcss/vite`
- ✅ `vite.config.js` → Tailwind eklentisi aktif
- ✅ `src/index.css` → `@import "tailwindcss";`

### Backend Kurulumu
- ✅ Backend klasörü oluşturuldu (`backend/`)
- ✅ `npm init -y` çalıştırıldı
- ✅ Paketler kuruldu:
  - `express`
  - `mysql2`
  - `cors`
  - `dotenv`
  - `bcryptjs`
  - `jsonwebtoken`
- ✅ DevDependency: `nodemon`

### Frontend Dosyaları Oluşturuldu
- ✅ `src/App.jsx` → Router + Route yapısı + PrivateRoute
- ✅ `src/components/Layout.jsx` → Sidebar + responsive mobil menü + LogOut
- ✅ `src/pages/Login.jsx` → Geçici giriş (herhangi bir e-posta/şifre kabul ediyor)
- ✅ `src/pages/Dashboard.jsx` → 4 kart + kritik stok tablosu (mock data)
- ✅ `src/pages/Items.jsx` → Placeholder (yapım aşamasında)
- ✅ `src/pages/Suppliers.jsx` → Placeholder
- ✅ `src/pages/Warehouses.jsx` → Placeholder
- ✅ `src/pages/Requests.jsx` → Placeholder
- ✅ `src/pages/StockMovements.jsx` → Placeholder
- ✅ `src/pages/Production.jsx` → Placeholder
- ✅ `src/services/api.js` → Axios yapılandırması

### Çalışan Özellikler
- ✅ Login sayfası açılıyor
- ✅ Herhangi bir bilgi ile giriş yapılabiliyor
- ✅ Dashboard açılıyor
- ✅ Sidebar menüsü çalışıyor
- ✅ Sayfa geçişleri (React Router) çalışıyor
- ✅ Responsive tasarım (mobil menü açılıp kapanıyor)

---

## 🚧 Yapılacaklar (TODO)

### Backend
- [ ] `backend/routes/` klasörü oluşturulacak
- [ ] Route dosyaları eklenecek: `auth.js`, `items.js`, `suppliers.js`, `warehouses.js`, `requests.js`, `orders.js`, `stock.js`, `production.js`, `dashboard.js`
- [ ] `backend/config/db.js` → MySQL bağlantı havuzu
- [ ] `backend/.env` → Ortam değişkenleri (DB bilgileri, JWT secret)
- [ ] `backend/server.js` → Şu an hata veriyor (eksik route'lar yüzünden), düzeltilecek
- [ ] MySQL veritabanı oluşturulacak (`stok_yonetim`)
- [ ] SQL şeması çalıştırılacak (11 tablo)

### Frontend
- [ ] Login sayfası gerçek API'ye bağlanacak
- [ ] Items sayfası tam CRUD (ekle, listele, güncelle, sil)
- [ ] Suppliers sayfası tam CRUD
- [ ] Warehouses sayfası tam CRUD
- [ ] Requests sayfası (talep oluşturma + onay akışı)
- [ ] StockMovements sayfası (stok giriş/çıkış/transfer)
- [ ] Production sayfası (BOM + İş emirleri)
- [ ] Dashboard gerçek verilerle çalışacak
- [ ] Kullanıcı rolüne göre menü filtreleme
- [ ] Rapor sayfaları (grafiklerle)

### Genel
- [ ] Rol bazlı yetkilendirme (JWT middleware)
- [ ] Hata yönetimi (error handling)
- [ ] Form validasyonu
- [ ] Toast/notification sistemi
- [ ] Test verileri (seed data)

---

## 🎯 KALDIĞIMIZ YER (Bir Sonraki Adım)

**Şu anki durum:** Frontend iskeleti çalışıyor, Login → Dashboard akışı tamam. Placeholder sayfalar var.

**Sıradaki iş (öncelik sırası):**

### Seçenek A: Backend'i Ayağa Kaldırmak
1. `backend/routes/` klasörünü ve dosyalarını oluştur
2. `backend/config/db.js` oluştur
3. `backend/.env` oluştur
4. MySQL'de `stok_yonetim` veritabanını ve tabloları oluştur
5. `server.js`'i düzelt ve çalıştır
6. Test: `http://localhost:5000/api/dashboard` → JSON dönmeli

### Seçenek B: Frontend Sayfalarını Geliştirmek
1. `Items.jsx` → Tam CRUD (form + tablo + arama + silme)
2. `Suppliers.jsx` → Tam CRUD
3. Diğer sayfalar...

**ÖNERİM:** **Seçenek A (Backend)** ile devam edelim. Çünkü frontend sayfaları yaparken zaten API'ye ihtiyaç duyacağız. Backend hazır olursa frontend'i gerçek verilerle bağlarız.

---

## 🐛 Bilinen Sorunlar

| Sorun | Durum | Çözüm |
|-------|-------|-------|
| `backend/server.js` çöküyor | Açık | `routes/` klasörü eksik |
| Login geçici | Açık | Gerçek JWT auth yapılacak |
| Dashboard mock data | Açık | API'ye bağlanacak |
| `Logout` vs `LogOut` hatası | ✅ Çözüldü | lucide-react'te doğru isim `LogOut` |

---

## 🔧 Önemli Komutlar

### Frontend
```powershell
cd C:\Users\sabri\Desktop\PROJELER\stok-yonetim\frontend
npm run dev
# Tarayıcı: http://localhost:5173