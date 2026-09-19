const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token doğrulama
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
      }
      if (!req.user.active) {
        return res.status(403).json({ message: 'Hesabınız devre dışı' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
  } else {
    return res.status(401).json({ message: 'Token bulunamadı' });
  }
};

// Sadece yönetici
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'yonetici') {
    next();
  } else {
    return res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gerekli' });
  }
};

// Belirli rollere izin ver
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
  };
};

module.exports = { protect, isAdmin, allowRoles };