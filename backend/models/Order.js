const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplier_name: String,
    supplier_code: String,
    old_price: Number,
    unit_price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    unit: String,
    order_date: { type: Date, default: Date.now },
    notes: String,
    status: {
      type: String,
      enum: ['bekliyor', 'onaylandi', 'hazir', 'teslim_edildi', 'iptal'],
      default: 'bekliyor',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);