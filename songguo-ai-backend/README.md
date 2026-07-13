# 松果AI后端API

基于DeepSeek大模型的松果AI角色扮演解压系统后端服务。

## 功能

- 松果主角色接待
- 六大解压角色切换（吐槽/治愈/吵架/树洞/复盘/呼吸）
- 五维解压维度追踪
- 多轮对话记忆
- 名言警句+哲学意味回复风格

## 本地测试

```bash
pip install -r requirements.txt
uvicorn api.main:app --reload
```

访问 http://localhost:8000/docs 查看API文档

## 部署到Vercel

```bash
vercel --prod
```

## API接口

### POST /api/chat
发送对话消息

请求体：
```json
{
  "message": "今天好烦",
  "session_id": "user123",
  "scene": "吐槽大会"
}
```

响应：
```json
{
  "reply": "哎，今天谁惹你了？...",
  "scene": "吐槽大会",
  "role": "最佳损友"
}
```

### GET /api/health
健康检查

### GET /api/scenes
获取场景列表
