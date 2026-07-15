// API服务模块
const API_BASE = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token') || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(method, path, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '请求失败');
    }

    return result;
  }

  // 认证相关
  async sendCode(phone) {
    return this.request('POST', '/auth/send-code', { phone });
  }

  async login(phone, code) {
    const result = await this.request('POST', '/auth/login', { phone, code });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async getUserInfo() {
    return this.request('GET', '/auth/me');
  }

  // 场景相关
  async getScenes() {
    return this.request('GET', '/scenes');
  }

  async getSceneById(id) {
    return this.request('GET', `/scenes/${id}`);
  }

  // 对话相关
  async createSession(sceneId) {
    return this.request('POST', '/chat/sessions', { scene_id: sceneId });
  }

  async sendMessage(sessionId, content) {
    return this.request('POST', '/chat/messages', { session_id: sessionId, content });
  }

  async getHistory(sessionId) {
    return this.request('GET', `/chat/history?session_id=${sessionId}`);
  }

  // 报告相关
  async getReports() {
    return this.request('GET', '/reports');
  }

  async getReportById(id) {
    return this.request('GET', `/reports/${id}`);
  }
}

export const apiService = new ApiService();
