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
      console.log('👤 Admin oluşturuldu: admin / Admin1987x');
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

    // === 4. ÖRNEK TEDARİKÇİLER (GÜNCELLENDİ) ===
    const suppliers = [
      {
        code: 'TD-001',
        company_name: 'Ahşap Dünyası Ltd.',
        phone: '0216 555 11 11',
        email: 'info@ahsapdunyasi.com',
        address: 'Sanayi Mah. Ahşap Sok. No:15 Kadıköy/İstanbul',
        contact_person: 'Ali Veli',
        bank_info: 'Ziraat Bankası - TR12 0001 0002 0003 0004 0005 01',
        payment_term: 30,
        old_price: 240,
        new_price: 250,
        unit: 'm²',
      },
      {
        code: 'TD-002',
        company_name: 'Hırdavat Merkezi A.Ş.',
        phone: '0212 444 22 22',
        email: 'satis@hirdavat.com',
        address: 'Perpa Ticaret Merkezi B Blok No:412 Şişli/İstanbul',
        contact_person: 'Ayşe Kaya',
        bank_info: 'İş Bankası - TR34 0006 4000 0011 2233 4455 66',
        payment_term: 45,
        old_price: 4.5,
        new_price: 5,
        unit: 'adet',
      },
      {
        code: 'TD-003',
        company_name: 'Aksesuar Plus',
        phone: '0212 333 33 33',
        email: 'siparis@aksesuarplus.com',
        address: 'Karaköy Mah. Bankalar Cad. No:8 Beyoğlu/İstanbul',
        contact_person: 'Mehmet Demir',
        bank_info: 'Garanti BBVA - TR56 0006 2000 1234 5678 9012 34',
        payment_term: 60,
        old_price: 14,
        new_price: 15,
        unit: 'adet',
      },
      {
        code: 'TD-004',
        company_name: 'Boya Kimya San. Tic.',
        phone: '0216 777 88 88',
        email: 'info@boyakimya.com',
        address: 'İçerenköy Mah. Kimya Cad. No:22 Ataşehir/İstanbul',
        contact_person: 'Fatma Öztürk',
        bank_info: 'Yapı Kredi - TR78 0006 7010 0000 0012 3456 78',
        payment_term: 30,
        old_price: 75,
        new_price: 80,
        unit: 'kg',
      },
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
    console.log('   Admin:     admin / Admin1987x');
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