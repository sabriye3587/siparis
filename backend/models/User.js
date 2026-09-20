const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Kullanıcı adı gerekli'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı'],
    },
    name: {
      type: String,
      required: [true, 'Ad Soyad gerekli'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Şifre gerekli'],
      minlength: [6, 'Şifre en az 6 karakter olmalı'],
      select: false,
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

// Şifreyi kaydetmeden önce hash'le (Mongoose v7+ formatı)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);