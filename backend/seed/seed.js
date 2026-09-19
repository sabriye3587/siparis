const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB bağlandı\n');

    // === 1. ADMİN KULLANICI ===
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        name: 'Sistem Yöneticisi',
        password: 'Admin1987x',
        role: 'yonetici',
      });
      console.log('👤 Admin oluşturuldu: admin / admin123');
    } else {
      console.log('ℹ️  Admin zaten var');
    }

    // === 2. ÖRNEK KULLANICILAR ===
    const users = [
      { username: 'ahmet', name: 'Ahmet Satın Alma', password: '123456', role: 'satinalma_muduru' },
      { username: 'mehmet', name: 'Mehmet Depo', password: '123456', role: 'depo_sorumlusu' },
      { username: 'ayse', name: 'Ayşe Üretim', password: '123456', role: 'uretim_sorumlusu' },
      { username: 'zeynep', name: 'Zeynep Talep', password: '123456', role: 'talep_kullanici' },
    ];

    for (const u of users) {
      const exists = await User.findOne({ username: u.username });
      if (!exists) {
        await User.create(u);
        console.log(`👤 Kullanıcı eklendi: ${u.username} / ${u.password}`);
      }
    }

    // === 3. ÖRNEK ÜRÜNLER ===
    const items = [
      { item_code: 'MDF-001', item_name: 'MDF 18mm Beyaz', unit: 'm²', category: 'MDF', min_stock: 50, max_stock: 500, critical_level: 100, last_purchase_price: 250 },
      { item_code: 'MNT-001', item_name: 'Menteşe 35mm', unit: 'adet', category: 'Hırdavat', min_stock: 200, max_stock: 2000, critical_level: 500, last_purchase_price: 5 },
      { item_code: 'VID-001', item_name: 'Vida 4x40', unit: 'adet', category: 'Hırdavat', min_stock: 1000, max_stock: 10000, critical_level: 2000, last_purchase_price: 0.5 },
      { item_code: 'KLP-001', item_name: 'Kulp Modern 128mm', unit: 'adet', category: 'Aksesuar', min_stock: 100, max_stock: 1000, critical_level: 200, last_purchase_price: 15 },
      { item_code: 'BOY-001', item_name: 'Boya Beyaz 20kg', unit: 'kg', category: 'Kimyasal', min_stock: 20, max_stock: 200, critical_level: 50, last_purchase_price: 80 },
    ];

    for (const it of items) {
      const exists = await Item.findOne({ item_code: it.item_code });
      if (!exists) {
        await Item.create(it);
        console.log(`📦 Ürün eklendi: ${it.item_code} - ${it.item_name}`);
      }
    }

    // === 4. ÖRNEK TEDARİKÇİLER ===
    const suppliers = [
      { code: 'TD-001', company_name: 'Ahşap Dünyası Ltd.', tax_office: 'Kadıköy', tax_number: '1234567890', phone: '0216 555 11 11', email: 'info@ahsapdunyasi.com', contact_person: 'Ali Veli', payment_term: 30 },
      { code: 'TD-002', company_name: 'Hırdavat Merkezi A.Ş.', tax_office: 'Şişli', tax_number: '9876543210', phone: '0212 444 22 22', email: 'satis@hirdavat.com', contact_person: 'Ayşe Kaya', payment_term: 45 },
      { code: 'TD-003', company_name: 'Aksesuar Plus', tax_office: 'Beyoğlu', tax_number: '5556667770', phone: '0212 333 33 33', email: 'siparis@aksesuarplus.com', contact_person: 'Mehmet Demir', payment_term: 60 },
    ];

    for (const s of suppliers) {
      const exists = await Supplier.findOne({ code: s.code });
      if (!exists) {
        await Supplier.create(s);
        console.log(`🏢 Tedarikçi eklendi: ${s.company_name}`);
      }
    }

    console.log('\n✅ Seed işlemi tamamlandı!\n');
    console.log('📋 GİRİŞ BİLGİLERİ (Kullanıcı Adı / Şifre):');
    console.log('   Admin:     admin / admin123');
    console.log('   Sat.Alma:  ahmet / 123456');
    console.log('   Depo:      mehmet / 123456');
    console.log('   Üretim:    ayse / 123456');
    console.log('   Talep:     zeynep / 123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  }
};

seedData();