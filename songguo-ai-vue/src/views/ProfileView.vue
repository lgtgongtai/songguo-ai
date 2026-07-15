<template>
  <div class="profile-view">
    <!-- 用户信息 -->
    <div class="user-info">
      <div class="avatar-section" @click="showAvatarPicker = true">
        <div class="avatar">
          <span>{{ userAvatar }}</span>
        </div>
        <span class="change-hint">点击更换</span>
      </div>
      <div class="user-details">
        <h3>{{ nickname }}</h3>
        <p class="vip-status">{{ vipText }}</p>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-list">
      <div class="menu-item" @click="copyRecords">
        <span class="menu-icon">📋</span>
        <span class="menu-text">复制对话记录</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="clearRecords">
        <span class="menu-icon">🗑️</span>
        <span class="menu-text">清空对话记录</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="showUserAgreement">
        <span class="menu-icon">📄</span>
        <span class="menu-text">用户协议</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="showPrivacyPolicy">
        <span class="menu-icon">🔒</span>
        <span class="menu-text">隐私政策</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item logout" @click="logout">
        <span class="menu-icon"></span>
        <span class="menu-text">退出登录</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- 头像选择器 -->
    <div v-if="showAvatarPicker" class="modal-overlay" @click="showAvatarPicker = false">
      <div class="modal-content" @click.stop>
        <h3>选择头像</h3>
        <div class="avatar-grid">
          <div 
            v-for="avatar in avatars" 
            :key="avatar"
            class="avatar-option"
            :class="{ selected: avatar === userAvatar }"
            @click="selectAvatar(avatar)"
          >
            <span>{{ avatar }}</span>
          </div>
        </div>
        <button class="confirm-btn" @click="showAvatarPicker = false">确定</button>
      </div>
    </div>

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
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const showAvatarPicker = ref(false)
const showLegalModal = ref(false)
const legalTitle = ref('')
const legalContent = ref('')

const userAvatar = computed(() => chatStore.userAvatar)
const nickname = computed(() => chatStore.nickname)
const vipText = computed(() => {
  const level = chatStore.vipLevel
  if (level === 0) return '免费用户'
  if (level === 1) return '会员'
  return 'VIP会员'
})

const avatars = ['🐿️', '', '🐼', '', '🦁', '', '🐸', '']

const selectAvatar = (avatar) => {
  chatStore.setUserAvatar(avatar)
}

const copyRecords = () => {
  const records = chatStore.records
  if (records.length === 0) {
    alert('暂无对话记录')
    return
  }
  const text = records.map(r => `[${r.date}] ${r.sceneName}: ${r.preview}`).join('\n')
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板')
  })
}

const clearRecords = () => {
  if (confirm('确定要清空所有对话记录吗？')) {
    chatStore.clearRecords()
    alert('已清空对话记录')
  }
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

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    chatStore.logout()
    window.location.reload()
  }
}
</script>

<style scoped>
.profile-view {
  padding: 20px;
  padding-bottom: 80px;
}

.user-info {
  background: white;
  border-radius: 16px;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.change-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.user-details h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.vip-status {
  margin: 0;
  font-size: 14px;
  color: #FFD700;
}

.menu-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f5f5f5;
}

.menu-item.logout {
  color: #ff4444;
}

.menu-icon {
  font-size: 20px;
  margin-right: 15px;
}

.menu-text {
  flex: 1;
  font-size: 14px;
}

.menu-arrow {
  font-size: 20px;
  color: #999;
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

.modal-content h3 {
  margin-top: 0;
  text-align: center;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.avatar-option {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  cursor: pointer;
  border: 3px solid transparent;
}

.avatar-option.selected {
  border-color: #4CAF50;
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
</style>
