const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema(
  {
    request_no: { type: String, required: true, unique: true },
    request_date: { type: Date, default: Date.now },
    department: String,
    requester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requester_name: String,
    wanted_date: Date,
    description: String,
    priority: {
      type: String,
      enum: ['dusuk', 'normal', 'yuksek', 'acil'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['bekliyor', 'onaylandi', 'reddedildi', 'siparise_donustu'],
      default: 'bekliyor',
    },
    items: [
      {
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        item_code: String,
        item_name: String,
        unit: String,
        quantity: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);