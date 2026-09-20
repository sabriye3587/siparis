const router = require('express').Router();
const Item = require('../models/Item');
const StockMovement = require('../models/StockMovement');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/items
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { item_code: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    const items = await Item.find(query).sort({ item_name: 1 });

    // Her ürün için mevcut stoğu hesapla
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
          ...item.toObject(),
          current_stock: totalIn - totalOut,
        };
      })
    );

    res.json(itemsWithStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ürün bulunamadı' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/items — Sadece admin + satın alma
router.post('/', isAdmin, async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/items/:id
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Ürün bulunamadı' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/items/:id
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ürün bulunamadı' });
    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ⬇️ YENİ: STOK GİRİŞ / ÇIKIŞ

// @route   POST /api/items/:id/stock-in
// @desc    Stoğa ürün ekle
router.post('/:id/stock-in', async (req, res) => {
  try {
    const { quantity, description, reference_no } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Geçerli bir miktar girin' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ürün bulunamadı' });

    const movement = await StockMovement.create({
      item_id: item._id,
      item_code: item.item_code,
      item_name: item.item_name,
      unit: item.unit,
      movement_type: 'giris',
      quantity: Number(quantity),
      description: description || 'Hızlı stok girişi',
      reference_no: reference_no || '',
      user_id: req.user._id,
      user_name: req.user.name,
    });

    // Mevcut stoğu hesapla
    const movements = await StockMovement.find({ item_id: item._id });
    let totalIn = 0;
    let totalOut = 0;
    movements.forEach((m) => {
      if (m.movement_type === 'giris') totalIn += m.quantity;
      else if (m.movement_type === 'cikis' || m.movement_type === 'hurda')
        totalOut += m.quantity;
    });
    const current_stock = totalIn - totalOut;

    res.status(201).json({ movement, current_stock });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/items/:id/stock-out
// @desc    Stoktan ürün çıkar
router.post('/:id/stock-out', async (req, res) => {
  try {
    const { quantity, description, reference_no } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Geçerli bir miktar girin' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ürün bulunamadı' });

    // Mevcut stok kontrolü
    const movements = await StockMovement.find({ item_id: item._id });
    let totalIn = 0;
    let totalOut = 0;
    movements.forEach((m) => {
      if (m.movement_type === 'giris') totalIn += m.quantity;
      else if (m.movement_type === 'cikis' || m.movement_type === 'hurda')
        totalOut += m.quantity;
    });
    const currentStock = totalIn - totalOut;

    if (Number(quantity) > currentStock) {
      return res.status(400).json({
        message: `Yetersiz stok! Mevcut: ${currentStock} ${item.unit}`,
      });
    }

    const movement = await StockMovement.create({
      item_id: item._id,
      item_code: item.item_code,
      item_name: item.item_name,
      unit: item.unit,
      movement_type: 'cikis',
      quantity: Number(quantity),
      description: description || 'Hızlı stok çıkışı',
      reference_no: reference_no || '',
      user_id: req.user._id,
      user_name: req.user.name,
    });

    res.status(201).json({
      movement,
      current_stock: currentStock - Number(quantity),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/items/:id/movements
// @desc    Ürünün hareket geçmişi
router.get('/:id/movements', async (req, res) => {
  try {
    const movements = await StockMovement.find({ item_id: req.params.id })
      .sort({ movement_date: -1 })
      .limit(50);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;