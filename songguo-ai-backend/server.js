const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { logger, errorHandler } = require('./middleware/auth');

// 导入路由
const authRoutes = require('./routes/auth');
const sceneRoutes = require('./routes/scenes');
const chatRoutes = require('./routes/chat');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/scenes', sceneRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '松果AI API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🌰 松果AI API服务已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(` 健康检查: http://localhost:${PORT}/api/health`);
  console.log(` API文档:`);
  console.log(`   - POST /api/auth/send-code    发送验证码`);
  console.log(`   - POST /api/auth/login        登录/注册`);
  console.log(`   - GET  /api/auth/me           获取用户信息`);
  console.log(`   - GET  /api/scenes            获取场景列表`);
  console.log(`   - GET  /api/scenes/:id        获取场景详情`);
  console.log(`   - POST /api/chat/sessions     创建对话会话`);
  console.log(`   - POST /api/chat/messages     发送消息`);
  console.log(`   - GET  /api/chat/history      获取对话历史`);
  console.log(`   - GET  /api/reports           获取松劲报告`);
});

module.exports = app;
