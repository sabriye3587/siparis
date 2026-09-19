const router = require('express').Router();
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect, isAdmin);

// Tüm kullanıcıları listele
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni kullanıcı ekle
router.post('/', async (req, res) => {
  try {
    const { username, name, password, role } = req.body;

    if (!username || !name || !password) {
      return res.status(400).json({ message: 'Kullanıcı adı, ad ve şifre gerekli' });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kayıtlı' });
    }

    const user = await User.create({
      username,
      name,
      password,
      role: role || 'talep_kullanici',
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcı güncelle
router.put('/:id', async (req, res) => {
  try {
    const { username, name, role, active } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    if (username) user.username = username;
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof active === 'boolean') user.active = active;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin şifre sıfırlar
router.put('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Şifre sıfırlandı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcı sil
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    res.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;