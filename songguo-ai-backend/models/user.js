const db = require('./database');
const bcrypt = require('bcryptjs');

class User {
  // 创建用户
  static create(phone, nickname = '松果用户', avatar = 'user-1') {
    const stmt = db.prepare(`
      INSERT INTO users (phone, nickname, avatar)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(phone, nickname, avatar);
    return this.findById(result.lastInsertRowid);
  }

  // 根据ID查找用户
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  // 根据手机号查找用户
  static findByPhone(phone) {
    const stmt = db.prepare('SELECT * FROM users WHERE phone = ?');
    return stmt.get(phone);
  }

  // 更新用户信息
  static update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.nickname) {
      fields.push('nickname = ?');
      values.push(data.nickname);
    }
    if (data.avatar) {
      fields.push('avatar = ?');
      values.push(data.avatar);
    }
    if (data.vip_level !== undefined) {
      fields.push('vip_level = ?');
      values.push(data.vip_level);
    }
    if (data.vip_expire_at) {
      fields.push('vip_expire_at = ?');
      values.push(data.vip_expire_at);
    }
    
    if (fields.length === 0) return this.findById(id);
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return this.findById(id);
  }

  // 升级会员
  static upgradeVip(id, level, expireAt) {
    return this.update(id, { vip_level: level, vip_expire_at: expireAt });
  }

  // 获取所有用户（分页）
  static findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?');
    return stmt.all(limit, offset);
  }

  // 统计用户总数
  static count() {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM users');
    return stmt.get().total;
  }
}

module.exports = User;
