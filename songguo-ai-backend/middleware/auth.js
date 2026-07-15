const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'songguo-ai-secret-key-2026';

// 认证中间件
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未登录' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: '登录已过期' });
  }
}

// 可选认证（不强制登录）
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
    } catch (error) {
      // 忽略错误，继续执行
    }
  }
  
  next();
}

// 会员权限检查
function requireVip(level = 1) {
  return (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({ error: '未登录' });
    }
    
    // 这里应该从数据库查询用户的VIP等级
    // 简化处理：假设所有用户都是免费用户
    const userVipLevel = 0; // TODO: 从数据库查询
    
    if (userVipLevel < level) {
      return res.status(403).json({ 
        error: '需要会员权限',
        upgrade_url: '/api/payment/upgrade'
      });
    }
    
    next();
  };
}

// 错误处理中间件
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// 请求日志中间件
function logger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  
  next();
}

module.exports = {
  authenticate,
  optionalAuth,
  requireVip,
  errorHandler,
  logger,
  JWT_SECRET
};
