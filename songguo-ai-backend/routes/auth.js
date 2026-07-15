const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// 发送验证码（模拟）
router.post('/send-code', (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: '请输入手机号' });
  }
  
  // 模拟发送验证码
  const code = '123456'; // 生产环境应该随机生成并发送到手机
  
  console.log(`验证码: ${code} (手机号: ${phone})`);
  
  res.json({ 
    success: true, 
    message: '验证码已发送',
    code: code // 开发环境返回验证码，生产环境不返回
  });
});

// 登录/注册
router.post('/login', (req, res) => {
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    return res.status(400).json({ error: '请输入手机号和验证码' });
  }
  
  // 验证验证码（开发环境固定为123456）
  if (code !== '123456') {
    return res.status(400).json({ error: '验证码错误' });
  }
  
  // 查找或创建用户
  let user = User.findByPhone(phone);
  
  if (!user) {
    user = User.create(phone);
  }
  
  // 生成JWT Token
  const token = jwt.sign(
    { userId: user.id, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      vip_level: user.vip_level
    }
  });
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未登录' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        vip_level: user.vip_level,
        vip_expire_at: user.vip_expire_at,
        created_at: user.created_at
      }
    });
  } catch (error) {
    res.status(401).json({ error: '登录已过期' });
  }
});

// 更新用户信息
router.put('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未登录' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = User.update(decoded.userId, req.body);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(401).json({ error: '登录已过期' });
  }
});

module.exports = router;
