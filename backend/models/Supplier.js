const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    company_name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true },
    address: { type: String, default: '' },
    contact_person: { type: String, default: '' },
    bank_info: { type: String, default: '' },
    payment_term: { type: Number, default: 0 },

    // YENİ ALANLAR
    old_price: { type: Number, default: 0 },
    new_price: { type: Number, default: 0 },
    unit: { type: String, default: 'adet' },

    status: { type: String, enum: ['aktif', 'pasif'], default: 'aktif' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);