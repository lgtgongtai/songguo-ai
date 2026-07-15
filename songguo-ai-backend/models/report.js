const db = require('./database');

class Report {
  // 创建报告
  static create(sessionId, userId, sceneName, dimensionScores, overallStage, gains, tinyAction, nextScene) {
    const stmt = db.prepare(`
      INSERT INTO reports (session_id, user_id, scene_name, dimension_scores, overall_stage, gains, tiny_action, next_scene)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      sessionId, 
      userId, 
      sceneName, 
      JSON.stringify(dimensionScores), 
      overallStage,
      JSON.stringify(gains),
      tinyAction,
      nextScene
    );
    return this.findById(result.lastInsertRowid);
  }

  // 根据ID查找报告
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
    const report = stmt.get(id);
    if (report) {
      report.dimension_scores = JSON.parse(report.dimension_scores);
      report.gains = JSON.parse(report.gains);
    }
    return report;
  }

  // 根据会话ID查找报告
  static findBySession(sessionId) {
    const stmt = db.prepare('SELECT * FROM reports WHERE session_id = ?');
    const report = stmt.get(sessionId);
    if (report) {
      report.dimension_scores = JSON.parse(report.dimension_scores);
      report.gains = JSON.parse(report.gains);
    }
    return report;
  }

  // 获取用户的报告列表
  static findByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const stmt = db.prepare(`
      SELECT * FROM reports 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    const reports = stmt.all(userId, limit, offset);
    return reports.map(r => ({
      ...r,
      dimension_scores: JSON.parse(r.dimension_scores),
      gains: JSON.parse(r.gains)
    }));
  }

  // 统计用户的报告数
  static countByUser(userId) {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM reports WHERE user_id = ?');
    return stmt.get(userId).total;
  }
}

module.exports = Report;
