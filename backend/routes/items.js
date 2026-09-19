const router = require('express').Router();
const Item = require('../models/Item');
const { protect, isAdmin, allowRoles } = require('../middleware/auth');

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
    res.json(items);
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

// @route   POST /api/items — Sadece admin + satın alma müdürü
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

module.exports = router;