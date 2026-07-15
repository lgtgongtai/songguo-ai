<template>
  <div class="chat-view">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left" @click="goBack">
        <span class="back-icon">←</span>
      </div>
      <div class="header-center">
        <span class="role-icon">{{ currentRole?.icon || '🐿️' }}</span>
        <span class="role-name">{{ currentRole?.name || '松松' }}</span>
      </div>
      <div class="header-right">
        <span class="ai-badge">AI交互</span>
      </div>
    </div>

    <!-- 聊天消息区 -->
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="message-avatar">
          <span>{{ msg.role === 'user' ? userAvatar : (currentRole?.icon || '🐿️') }}</span>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            {{ msg.content }}
          </div>
        </div>
      </div>
      
      <!-- 正在输入提示 -->
      <div v-if="isTyping" class="message ai">
        <div class="message-avatar">
          <span>{{ currentRole?.icon || '️' }}</span>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="chat-input-area">
      <button v-if="!isRecording" class="voice-btn" @click="startRecording">🎤</button>
      <button v-else class="voice-btn recording" @click="stopRecording">⏹️</button>
      <input 
        v-model="inputText" 
        type="text" 
        placeholder="说点什么吧..."
        @keyup.enter="sendMessage"
      />
      <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">发送</button>
    </div>

    <!-- 危机干预弹窗 -->
    <div v-if="showCrisisModal" class="modal-overlay" @click="closeCrisisModal">
      <div class="modal-content crisis-modal" @click.stop>
        <h3>我们在这里陪你</h3>
        <p>你现在的感受很重要，请记得：</p>
        <ul>
          <li>心理援助热线：400-161-9995</li>
          <li>北京心理危机研究与干预中心：010-82951332</li>
          <li>全国24小时希望热线：400-161-9995</li>
        </ul>
        <p>你并不孤单，我们陪着你。</p>
        <button class="confirm-btn" @click="closeCrisisModal">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { apiService } from '@/services/api'

const router = useRouter()
const chatStore = useChatStore()

const inputText = ref('')
const isTyping = ref(false)
const isRecording = ref(false)
const showCrisisModal = ref(false)
const messagesContainer = ref(null)

const messages = computed(() => chatStore.messages)
const currentRole = computed(() => chatStore.currentRole)
const userAvatar = computed(() => chatStore.userAvatar)

const goBack = () => {
  router.push('/')
}

const sendMessage = async () => {
  if (!inputText.value.trim()) return
  
  const text = inputText.value.trim()
  inputText.value = ''
  
  // 添加用户消息
  chatStore.addMessage('user', text)
  
  // 检查危机关键词
  if (chatStore.checkCrisisKeywords(text)) {
    showCrisisModal.value = true
  }
  
  // 显示正在输入
  isTyping.value = true
  await nextTick()
  scrollToBottom()
  
  try {
    // 调用后端API发送消息
    const result = await apiService.sendMessage(chatStore.currentSessionId, text)
    
    // 隐藏正在输入
    isTyping.value = false
    
    // 添加AI消息
    chatStore.addMessage('ai', result.reply)
    
    // 更新五维得分
    if (result.dimension_scores) {
      chatStore.updateDimensionScores(result.dimension_scores)
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    isTyping.value = false
    // 使用本地回复作为fallback
    const reply = await chatStore.getAIReply(text)
    chatStore.addMessage('ai', reply)
  }
  
  await nextTick()
  scrollToBottom()
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const startRecording = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('您的浏览器不支持语音识别功能')
    return
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false
  
  recognition.onstart = () => {
    isRecording.value = true
  }
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    inputText.value = transcript
    isRecording.value = false
  }
  
  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error)
    isRecording.value = false
  }
  
  recognition.onend = () => {
    isRecording.value = false
  }
  
  recognition.start()
}

const stopRecording = () => {
  isRecording.value = false
}

const closeCrisisModal = () => {
  showCrisisModal.value = false
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-left {
  width: 40px;
  cursor: pointer;
}

.back-icon {
  font-size: 20px;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.role-icon {
  font-size: 24px;
}

.role-name {
  font-size: 16px;
  font-weight: bold;
}

.header-right {
  width: 40px;
  text-align: right;
}

.ai-badge {
  font-size: 12px;
  color: #4CAF50;
  border: 1px solid #4CAF50;
  padding: 2px 6px;
  border-radius: 4px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.message.ai .message-bubble {
  background: white;
  color: #333;
}

.message.user .message-bubble {
  background: #4CAF50;
  color: white;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-input-area {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  gap: 10px;
}

.voice-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  font-size: 20px;
  cursor: pointer;
}

.voice-btn.recording {
  background: #ff4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chat-input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.chat-input-area input:focus {
  border-color: #4CAF50;
}

.send-btn {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 80%;
  text-align: center;
}

.crisis-modal h3 {
  color: #ff4444;
  margin-bottom: 15px;
}

.crisis-modal ul {
  text-align: left;
  margin: 15px 0;
  padding-left: 20px;
}

.crisis-modal li {
  margin-bottom: 8px;
  color: #666;
}

.confirm-btn {
  margin-top: 20px;
  padding: 12px 30px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}
</style>
