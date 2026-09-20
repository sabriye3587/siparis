const router = require('express').Router();
const Supplier = require('../models/Supplier');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  const suppliers = await Supplier.find().sort({ company_name: 1 });
  res.json(suppliers);
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);   // ✅ req.body tamamen
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) return res.status(404).json({ message: 'Tedarikçi bulunamadı' });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tedarikçi silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;