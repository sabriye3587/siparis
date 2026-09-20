const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    item_code: String,
    item_name: String,
    unit: String,
    movement_type: {
      type: String,
      enum: ['giris', 'cikis', 'transfer', 'sayim', 'hurda'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    description: { type: String, default: '' },
    reference_no: { type: String, default: '' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user_name: { type: String, default: '' },
    movement_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);