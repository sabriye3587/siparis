const router = require('express').Router();
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const total_items = await Item.countDocuments();
    const total_suppliers = await Supplier.countDocuments();
    const total_users = await User.countDocuments();
    const critical_stocks = await Item.find({
      $expr: { $lt: ['$min_stock', '$critical_level'] },
    });

    res.json({
      total_items,
      total_suppliers,
      total_users,
      critical_stocks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;