const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    item_code: { type: String, required: true, unique: true, trim: true },
    item_name: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    sub_category: { type: String, default: '' },
    unit: { type: String, required: true, default: 'adet' },
    barcode: { type: String, default: '' },
    brand: { type: String, default: '' },
    min_stock: { type: Number, default: 0 },
    max_stock: { type: Number, default: 0 },
    critical_level: { type: Number, default: 0 },
    last_purchase_price: { type: Number, default: 0 },
    average_cost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);