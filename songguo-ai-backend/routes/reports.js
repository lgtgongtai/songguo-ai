const express = require('express');
const Report = require('../models/report');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户的松劲报告列表
router.get('/', authenticate, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const reports = Report.findByUser(req.userId, page, limit);
  const total = Report.countByUser(req.userId);
  
  res.json({
    success: true,
    reports,
    pagination: {
      page,
      limit,
      total
    }
  });
});

// 获取报告详情
router.get('/:id', authenticate, (req, res) => {
  const report = Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({ error: '报告不存在' });
  }
  
  // 检查报告是否属于当前用户
  if (report.user_id !== req.userId) {
    return res.status(403).json({ error: '无权查看此报告' });
  }
  
  res.json({
    success: true,
    report
  });
});

module.exports = router;
