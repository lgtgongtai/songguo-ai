const express = require('express');

const router = express.Router();

// 场景数据（从roles.js导入）
const scenes = [
  // 情绪解压圈
  { id: 'roast', name: '吐槽大会', circle: '情绪解压', difficulty: '简单', vip_level: 0, icon: '', desc: '安全宣泄出口', role: { name: '最佳损友', style: '犀利但温暖' } },
  { id: 'healing', name: '治愈聊天', circle: '情绪解压', difficulty: '简单', vip_level: 1, icon: '🌿', desc: '温暖陪伴', role: { name: '倾听者', style: '温柔共情' } },
  { id: 'rage_room', name: '吵架模拟器', circle: '情绪解压', difficulty: '中等', vip_level: 1, icon: '', desc: '释放愤怒', role: { name: '对手', style: '针锋相对' } },
  { id: 'tree_hole', name: '树洞', circle: '情绪解压', difficulty: '简单', vip_level: 1, icon: '🕳️', desc: '秘密倾诉', role: { name: '树洞', style: '安静倾听' } },
  { id: 'life_sim', name: '人生模拟器', circle: '情绪解压', difficulty: '困难', vip_level: 1, icon: '🎭', desc: '体验不同人生', role: { name: '命运', style: '随机应变' } },
  
  // 社交训练圈
  { id: 'date_sim', name: '约会模拟', circle: '社交训练', difficulty: '中等', vip_level: 1, icon: '💕', desc: '练完更敢', role: { name: '约会对象', style: '自然互动' } },
  { id: 'party_ice', name: '聚会破冰', circle: '社交训练', difficulty: '中等', vip_level: 1, icon: '🎉', desc: '社交不尴尬', role: { name: '聚会达人', style: '活跃气氛' } },
  { id: 'conflict', name: '冲突处理', circle: '社交训练', difficulty: '困难', vip_level: 1, icon: '⚡', desc: '学会沟通', role: { name: '冲突方', style: '理性对话' } },
  { id: 'speech', name: '演讲陪练', circle: '社交训练', difficulty: '中等', vip_level: 1, icon: '🎤', desc: '克服紧张', role: { name: '观众', style: '鼓励支持' } },
  { id: 'interview', name: '面试轻松版', circle: '社交训练', difficulty: '中等', vip_level: 1, icon: '💼', desc: '面试不紧张', role: { name: '面试官', style: '专业友好' } },
  
  // 亲子互动圈
  { id: 'parent_child', name: '亲子对话', circle: '亲子互动', difficulty: '简单', vip_level: 1, icon: '👨👩‍👧', desc: '全家一起', role: { name: '孩子', style: '天真好奇' } },
  { id: 'adventure', name: '冒险故事', circle: '亲子互动', difficulty: '简单', vip_level: 0, icon: '🗺️', desc: '想象力飞行', role: { name: '冒险伙伴', style: '勇敢探索' } },
  { id: 'family_game', name: '家庭桌游', circle: '亲子互动', difficulty: '简单', vip_level: 1, icon: '🎲', desc: '亲子时光', role: { name: '游戏主持', style: '欢乐互动' } },
  { id: 'homework', name: '作业伙伴', circle: '亲子互动', difficulty: '简单', vip_level: 1, icon: '📚', desc: '学习不痛苦', role: { name: '学习伙伴', style: '耐心引导' } },
  { id: 'bedtime', name: '睡前故事', circle: '亲子互动', difficulty: '简单', vip_level: 0, icon: '', desc: '安心入睡', role: { name: '故事大王', style: '温柔讲述' } }
];

// 获取场景列表
router.get('/', (req, res) => {
  const { circle } = req.query;
  
  let filteredScenes = scenes;
  
  if (circle) {
    filteredScenes = scenes.filter(s => s.circle === circle);
  }
  
  res.json({
    success: true,
    scenes: filteredScenes,
    circles: [
      { id: '情绪解压', name: '情绪解压', desc: '安全宣泄出口', count: scenes.filter(s => s.circle === '情绪解压').length },
      { id: '社交训练', name: '社交训练', desc: '练完更敢', count: scenes.filter(s => s.circle === '社交训练').length },
      { id: '亲子互动', name: '亲子互动', desc: '全家一起', count: scenes.filter(s => s.circle === '亲子互动').length }
    ]
  });
});

// 获取场景详情
router.get('/:id', (req, res) => {
  const scene = scenes.find(s => s.id === req.params.id || s.name === req.params.id);
  
  if (!scene) {
    return res.status(404).json({ error: '场景不存在' });
  }
  
  res.json({
    success: true,
    scene
  });
});

module.exports = router;
