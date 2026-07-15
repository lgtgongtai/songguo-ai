<template>
  <div id="app">
    <!-- 欢迎弹窗 -->
    <div v-if="showWelcome" class="modal-overlay">
      <div class="modal-content welcome-modal">
        <div class="welcome-header">
          <span class="logo">🌲</span>
          <h2>松果AI</h2>
          <p class="subtitle">你的情绪解压伙伴</p>
        </div>
        
        <div class="welcome-body">
          <p class="ai-notice">本服务由AI提供，内容仅供参考</p>
          <p class="minor-notice">未成年人请在监护人指导下使用</p>
          
          <label class="checkbox-label">
            <input type="checkbox" v-model="ageConfirmed" />
            <span>我已满18周岁</span>
          </label>
          
          <label class="checkbox-label">
            <input type="checkbox" v-model="termsAgreed" />
            <span>我已阅读并同意<a @click="showUserAgreement">用户协议</a>和<a @click="showPrivacyPolicy">隐私政策</a></span>
          </label>
        </div>
        
        <button class="start-btn" @click="acceptWelcome" :disabled="!canStart">
          开始使用
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <router-view />

    <!-- 底部Tab栏 -->
    <nav v-if="showTabBar" class="tab-bar">
      <router-link to="/" class="tab-item" active-class="active">
        <span class="tab-icon"></span>
        <span class="tab-text">首页</span>
      </router-link>
      <router-link to="/records" class="tab-item" active-class="active">
        <span class="tab-icon">📋</span>
        <span class="tab-text">记录</span>
      </router-link>
      <router-link to="/profile" class="tab-item" active-class="active">
        <span class="tab-icon">👤</span>
        <span class="tab-text">我的</span>
      </router-link>
    </nav>

    <!-- 法律页面弹窗 -->
    <div v-if="showLegalModal" class="modal-overlay" @click="showLegalModal = false">
      <div class="modal-content legal-modal" @click.stop>
        <h3>{{ legalTitle }}</h3>
        <div class="legal-content" v-html="legalContent"></div>
        <button class="confirm-btn" @click="showLegalModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const chatStore = useChatStore()

const showWelcome = ref(false)
const ageConfirmed = ref(false)
const termsAgreed = ref(false)
const showLegalModal = ref(false)
const legalTitle = ref('')
const legalContent = ref('')

const canStart = computed(() => ageConfirmed.value && termsAgreed.value)

const showTabBar = computed(() => {
  return route.path !== '/chat'
})

const acceptWelcome = () => {
  if (!canStart.value) {
    if (!ageConfirmed.value) {
      alert('请确认您已满18周岁')
      return
    }
    if (!termsAgreed.value) {
      alert('请阅读并同意用户协议和隐私政策')
      return
    }
  }
  
  localStorage.setItem('complianceAgreed', 'true')
  showWelcome.value = false
  chatStore.init()
}

const showUserAgreement = () => {
  legalTitle.value = '用户协议'
  legalContent.value = `
    <h4>一、服务说明</h4>
    <p>松果AI是一款AI角色扮演解压互动游戏平台，不是心理咨询的替代品。</p>
    <h4>二、用户责任</h4>
    <p>用户需满18周岁，未成年人请在监护人指导下使用。</p>
    <h4>三、隐私保护</h4>
    <p>对话内容去标识化存储，仅用于提供服务。</p>
    <h4>四、免责声明</h4>
    <p>AI生成内容仅供参考，不构成专业建议。</p>
  `
  showLegalModal.value = true
}

const showPrivacyPolicy = () => {
  legalTitle.value = '隐私政策'
  legalContent.value = `
    <h4>一、信息收集</h4>
    <p>收集对话内容用于提供解压服务。</p>
    <h4>二、信息使用</h4>
    <p>仅用于解压服务和松劲报告生成。</p>
    <h4>三、信息保护</h4>
    <p>采用加密存储和访问控制。</p>
    <h4>四、信息共享</h4>
    <p>除法律要求外，不与第三方共享。</p>
    <h4>五、用户权利</h4>
    <p>可查看、复制、删除自己的对话记录。</p>
  `
  showLegalModal.value = true
}

onMounted(() => {
  const agreed = localStorage.getItem('complianceAgreed')
  if (!agreed) {
    showWelcome.value = true
  } else {
    chatStore.init()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
}

#app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  position: relative;
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
  max-height: 80vh;
  overflow-y: auto;
}

.welcome-modal {
  text-align: center;
}

.welcome-header {
  margin-bottom: 20px;
}

.welcome-header .logo {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.welcome-header h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.welcome-body {
  text-align: left;
  margin-bottom: 20px;
}

.ai-notice {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.minor-notice {
  font-size: 12px;
  color: #ff9800;
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 3px;
}

.checkbox-label a {
  color: #4CAF50;
  text-decoration: underline;
  cursor: pointer;
}

.start-btn {
  width: 100%;
  padding: 14px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  cursor: pointer;
}

.start-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  text-decoration: none;
  color: #999;
}

.tab-item.active {
  color: #4CAF50;
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tab-text {
  font-size: 12px;
}

.legal-modal h3 {
  text-align: center;
  margin-bottom: 20px;
}

.legal-content {
  text-align: left;
  font-size: 14px;
  line-height: 1.6;
}

.legal-content h4 {
  margin-top: 15px;
  margin-bottom: 8px;
}

.legal-content p {
  margin: 5px 0;
  color: #666;
}

.confirm-btn {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 20px;
}
</style>
