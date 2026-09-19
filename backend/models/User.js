const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ad Soyad gerekli'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-posta gerekli'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Şifre gerekli'],
      minlength: [6, 'Şifre en az 6 karakter olmalı'],
      select: false, // Sorgularda varsayılan olarak gelmesin
    },
    role: {
      type: String,
      enum: ['yonetici', 'satinalma_muduru', 'depo_sorumlusu', 'uretim_sorumlusu', 'talep_kullanici'],
      default: 'talep_kullanici',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Şifreyi kaydetmeden önce hash'le
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);