const db = require('./database');

class Session {
  // 创建会话
  static create(userId, sceneId, sceneName, roleId, roleName) {
    const stmt = db.prepare(`
      INSERT INTO sessions (user_id, scene_id, scene_name, role_id, role_name)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, sceneId, sceneName, roleId, roleName);
    return this.findById(result.lastInsertRowid);
  }

  // 根据ID查找会话
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id);
  }

  // 获取用户的会话列表
  static findByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const stmt = db.prepare(`
      SELECT * FROM sessions 
      WHERE user_id = ? 
      ORDER BY started_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset);
  }

  // 结束会话
  static end(id, messageCount, overallStage, dimensionScores) {
    const stmt = db.prepare(`
      UPDATE sessions 
      SET ended_at = CURRENT_TIMESTAMP, 
          message_count = ?, 
          overall_stage = ?, 
          dimension_scores = ?
      WHERE id = ?
    `);
    stmt.run(messageCount, overallStage, JSON.stringify(dimensionScores), id);
    return this.findById(id);
  }

  // 统计用户的会话数
  static countByUser(userId) {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM sessions WHERE user_id = ?');
    return stmt.get(userId).total;
  }
}

class Message {
  // 创建消息
  static create(sessionId, userId, role, content) {
    const stmt = db.prepare(`
      INSERT INTO messages (session_id, user_id, role, content)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(sessionId, userId, role, content);
    return this.findById(result.lastInsertRowid);
  }

  // 根据ID查找消息
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    return stmt.get(id);
  }

  // 获取会话的消息列表
  static findBySession(sessionId) {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(sessionId);
  }

  // 获取用户的消息列表（分页）
  static findByUser(userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const stmt = db.prepare(`
      SELECT m.*, s.scene_name 
      FROM messages m
      JOIN sessions s ON m.session_id = s.id
      WHERE m.user_id = ? 
      ORDER BY m.created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset);
  }

  // 删除用户的所有消息
  static deleteByUser(userId) {
    const stmt = db.prepare('DELETE FROM messages WHERE user_id = ?');
    return stmt.run(userId);
  }
}

module.exports = { Session, Message };
