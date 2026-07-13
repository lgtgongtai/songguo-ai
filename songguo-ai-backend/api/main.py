"""松果AI后端API - FastAPI + DeepSeek"""

import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

from .roles import ROLES, SONGGUO_MAIN, SCENE_TO_ROLE

# 加载环境变量
load_dotenv()

# 初始化FastAPI
app = FastAPI(title="松果AI API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化OpenAI客户端（使用DeepSeek）
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY", "sk-5b17fe3873c54f20a63da3f4e6d9bde4"),
    base_url="https://api.deepseek.com/v1"
)

# 会话存储（简单内存存储，生产环境用Redis）
sessions = {}


# 请求模型
class ChatRequest(BaseModel):
    session_id: str
    message: str
    role: Optional[str] = "松果"  # 当前角色


class RoleSwitchRequest(BaseModel):
    session_id: str
    target_role: str


# 响应模型
class ChatResponse(BaseModel):
    reply: str
    current_role: str
    suggested_scene: Optional[str] = None


# 检测用户意图，判断是否需要切换角色
def detect_scene_intent(message: str) -> Optional[str]:
    """检测用户消息中是否包含场景切换意图"""
    message_lower = message.lower()
    for keyword, role in SCENE_TO_ROLE.items():
        if keyword in message_lower:
            return role
    return None


# 生成回复
def generate_reply(session_id: str, message: str, current_role: str) -> dict:
    """调用DeepSeek API生成回复"""
    
    # 获取或创建会话
    if session_id not in sessions:
        sessions[session_id] = {
            "role": current_role,
            "messages": []
        }
    
    session = sessions[session_id]
    
    # 检查是否需要切换角色
    detected_role = detect_scene_intent(message)
    if detected_role and detected_role != session["role"]:
        # 建议切换角色
        role_name = detected_role
        scene_name = {
            "最佳损友": "吐槽大会",
            "治愈倾听者": "治愈聊天",
            "吵架对手": "吵架模拟器",
            "树洞": "安全宣泄",
            "情绪向导": "复盘引导",
            "呼吸引导员": "放松舱"
        }.get(role_name, role_name)
        
        return {
            "reply": f"要不要切到【{scene_name}】？我让{role_name}上线～",
            "current_role": session["role"],
            "suggested_scene": scene_name,
            "suggested_role": role_name
        }
    
    # 构建消息历史
    system_prompt = ROLES.get(session["role"], SONGGUO_MAIN)
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # 添加历史消息（最近10轮）
    for msg in session["messages"][-10:]:
        messages.append(msg)
    
    # 添加当前用户消息
    messages.append({"role": "user", "content": message})
    
    # 调用DeepSeek API
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=False
        )
        
        reply = response.choices[0].message.content
        
        # 保存消息历史
        session["messages"].append({"role": "user", "content": message})
        session["messages"].append({"role": "assistant", "content": reply})
        
        return {
            "reply": reply,
            "current_role": session["role"],
            "suggested_scene": None
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API调用失败：{str(e)}")


# API路由
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """聊天接口"""
    result = generate_reply(request.session_id, request.message, request.role)
    
    # 如果有建议的场景，更新会话角色
    if result.get("suggested_role"):
        sessions[request.session_id]["suggested_role"] = result["suggested_role"]
    
    return ChatResponse(
        reply=result["reply"],
        current_role=result["current_role"],
        suggested_scene=result.get("suggested_scene")
    )


@app.post("/api/switch-role")
async def switch_role(request: RoleSwitchRequest):
    """切换角色接口"""
    if request.session_id not in sessions:
        sessions[request.session_id] = {
            "role": request.target_role,
            "messages": []
        }
    else:
        sessions[request.session_id]["role"] = request.target_role
        # 清空历史消息，避免角色混淆
        sessions[request.session_id]["messages"] = []
    
    # 获取新角色的开场白
    opening_lines = {
        "最佳损友": "来，今天谁惹你了？我当树洞，随便骂，我帮你记仇。",
        "治愈倾听者": "今天过得还好吗？想说点什么都可以，我都在。",
        "吵架对手": "说吧，今天演谁？甲方？领导？还是谁惹你了？我接火但不真伤人。",
        "树洞": "这里是树洞，说什么都可以，说完就删。来吧，我接着。",
        "情绪向导": "刚才那件事，最让你在意的是哪一句/哪个瞬间？咱们一起看看。",
        "呼吸引导员": "来，找个舒服的姿势。跟着松果的呼吸泡泡：吸——停——呼——"
    }
    
    opening = opening_lines.get(request.target_role, "嘿，我来啦～")
    
    return {
        "success": True,
        "current_role": request.target_role,
        "opening": opening
    }


@app.get("/api/roles")
async def get_roles():
    """获取所有角色列表"""
    return {
        "roles": [
            {"name": "松果", "scene": "主接待", "desc": "温暖松弛的小松鼠朋友"},
            {"name": "最佳损友", "scene": "吐槽大会", "desc": "站队护短、一起吐槽"},
            {"name": "治愈倾听者", "scene": "治愈聊天", "desc": "温柔不评判的倾听"},
            {"name": "吵架对手", "scene": "吵架模拟器", "desc": "演那个让你不爽的人"},
            {"name": "树洞", "scene": "安全宣泄", "desc": "无评判的容纳容器"},
            {"name": "情绪向导", "scene": "复盘引导", "desc": "苏格拉底式提问"},
            {"name": "呼吸引导员", "scene": "放松舱", "desc": "松果呼吸泡泡意象放松"}
        ]
    }


@app.get("/api/health")
async def health():
    """健康检查"""
    return {"status": "ok", "service": "松果AI API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
