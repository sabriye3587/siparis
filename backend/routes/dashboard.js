const router = require('express').Router();
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const StockMovement = require('../models/StockMovement');
const PurchaseRequest = require('../models/PurchaseRequest');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    // === 1. SAYILAR ===
    const total_items = await Item.countDocuments();
    const total_suppliers = await Supplier.countDocuments();
    const total_users = await User.countDocuments();
    const active_suppliers = await Supplier.countDocuments({ status: 'aktif' });

    // === 2. STOK HESAPLARI ===
    const items = await Item.find();
    const itemsWithStock = await Promise.all(
      items.map(async (item) => {
        const movements = await StockMovement.find({ item_id: item._id });
        let totalIn = 0;
        let totalOut = 0;
        movements.forEach((m) => {
          if (m.movement_type === 'giris') totalIn += m.quantity;
          else if (m.movement_type === 'cikis' || m.movement_type === 'hurda')
            totalOut += m.quantity;
        });
        return {
          _id: item._id,
          item_code: item.item_code,
          item_name: item.item_name,
          unit: item.unit,
          category: item.category,
          min_stock: item.min_stock,
          critical_level: item.critical_level,
          current_stock: totalIn - totalOut,
        };
      })
    );

    // Kritik stoklar (mevcut < kritik seviye)
    const critical_stocks = itemsWithStock.filter(
      (i) => i.current_stock < i.critical_level
    );

    // Toplam stok değeri (yaklaşık)
    const total_stock_value = itemsWithStock.reduce((sum, i) => {
      return sum + i.current_stock * 0; // Fiyat bilgisi item'da yok, şimdilik 0
    }, 0);

    // === 3. SON HAREKETLER ===
    const recent_movements = await StockMovement.find()
      .sort({ movement_date: -1 })
      .limit(5);

    // === 4. SON TALEPLER ===
    let recent_requests = [];
    let pending_requests = 0;
    try {
      recent_requests = await PurchaseRequest.find()
        .sort({ createdAt: -1 })
        .limit(5);
      pending_requests = await PurchaseRequest.countDocuments({
        status: 'bekliyor',
      });
    } catch (err) {
      // Model henüz yoksa hata verme
      console.warn('PurchaseRequest modeli yok veya hata:', err.message);
    }

    // === 5. KATEGORİ DAĞILIMI ===
    const categoryStats = {};
    itemsWithStock.forEach((i) => {
      const cat = i.category || 'Diğer';
      if (!categoryStats[cat]) categoryStats[cat] = 0;
      categoryStats[cat]++;
    });

    const category_chart = Object.entries(categoryStats).map(([name, value]) => ({
      name,
      value,
    }));

    // === 6. HAFTALIK HAREKET TRENDİ (son 7 gün) ===
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayMovements = await StockMovement.find({
        movement_date: { $gte: date, $lt: nextDate },
      });

      let giris = 0;
      let cikis = 0;
      dayMovements.forEach((m) => {
        if (m.movement_type === 'giris') giris += m.quantity;
        else if (m.movement_type === 'cikis' || m.movement_type === 'hurda')
          cikis += m.quantity;
      });

      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      last7Days.push({
        day: dayNames[date.getDay()],
        giris,
        cikis,
      });
    }

    // === 7. SONUÇ ===
    res.json({
      total_items,
      total_suppliers,
      active_suppliers,
      total_users,
      pending_requests,
      critical_stocks: critical_stocks.slice(0, 10), // en fazla 10
      total_stock_value,
      recent_movements,
      recent_requests,
      category_chart,
      weekly_trend: last7Days,
    });
  } catch (error) {
    console.error('Dashboard hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;