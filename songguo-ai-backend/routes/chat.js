const express = require('express');
const { Session, Message } = require('../models/session');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 创建对话会话
router.post('/sessions', authenticate, (req, res) => {
  const { scene_id, scene_name, role_id, role_name } = req.body;
  
  if (!scene_id) {
    return res.status(400).json({ error: '请选择场景' });
  }
  
  const session = Session.create(
    req.userId,
    scene_id,
    scene_name || scene_id,
    role_id || 'songguo',
    role_name || '松松'
  );
  
  res.json({
    success: true,
    session
  });
});

// 发送消息
router.post('/messages', authenticate, (req, res) => {
  const { session_id, content } = req.body;
  
  if (!session_id || !content) {
    return res.status(400).json({ error: '参数不完整' });
  }
  
  // 保存用户消息
  const userMessage = Message.create(session_id, req.userId, 'user', content);
  
  // TODO: 调用大模型API生成回复
  // 这里先返回一个简单的回复
  const aiReply = '我理解你的感受，让我们继续聊聊。';
  const aiMessage = Message.create(session_id, req.userId, 'assistant', aiReply);
  
  res.json({
    success: true,
    messages: [userMessage, aiMessage]
  });
});

// 获取会话消息
router.get('/sessions/:sessionId/messages', authenticate, (req, res) => {
  const messages = Message.findBySession(req.params.sessionId);
  
  res.json({
    success: true,
    messages
  });
});

// 获取用户的对话历史
router.get('/history', authenticate, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const messages = Message.findByUser(req.userId, page, limit);
  
  res.json({
    success: true,
    messages,
    pagination: {
      page,
      limit,
      total: messages.length
    }
  });
});

// 删除对话记录
router.delete('/messages', authenticate, (req, res) => {
  Message.deleteByUser(req.userId);
  
  res.json({
    success: true,
    message: '对话记录已删除'
  });
});

module.exports = router;
