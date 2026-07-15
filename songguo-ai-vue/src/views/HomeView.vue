<template>
  <div class="home-view">
    <!-- 松松客服引导区 -->
    <div class="guide-section" @click="goToChat">
      <div class="guide-content">
        <div class="guide-text">
          <h3>嗨，我是松松，你的解压向导~</h3>
          <p>今天感觉怎么样？选择一个场景开始解压吧，或者<span class="link-text">点击这里</span>跟我聊聊~</p>
        </div>
      </div>
    </div>

    <!-- 场景选择区 -->
    <div class="scenes-section">
      <h2 class="section-title">选择场景，开始解压</h2>
      
      <!-- 情绪解压圈 -->
      <div class="circle-group">
        <div class="circle-header">
          <span class="circle-icon">🔥</span>
          <span class="circle-name">情绪解压</span>
          <span class="circle-desc">安全宣泄出口</span>
        </div>
        <div class="scene-grid">
          <div 
            v-for="scene in emotionScenes" 
            :key="scene.id"
            class="scene-card"
            @click="enterScene(scene)"
          >
            <span class="scene-icon">{{ scene.icon }}</span>
            <span class="scene-name">{{ scene.name }}</span>
            <span v-if="scene.vipLevel > 0" class="vip-badge">{{ scene.vipLevel === 1 ? '会员' : 'VIP' }}</span>
            <span v-else class="free-badge">免费</span>
          </div>
        </div>
      </div>

      <!-- 社交训练圈 -->
      <div class="circle-group">
        <div class="circle-header">
          <span class="circle-icon">👥</span>
          <span class="circle-name">社交训练</span>
          <span class="circle-desc">练完更敢</span>
        </div>
        <div class="scene-grid">
          <div 
            v-for="scene in socialScenes" 
            :key="scene.id"
            class="scene-card"
            @click="enterScene(scene)"
          >
            <span class="scene-icon">{{ scene.icon }}</span>
            <span class="scene-name">{{ scene.name }}</span>
            <span v-if="scene.vipLevel > 0" class="vip-badge">{{ scene.vipLevel === 1 ? '会员' : 'VIP' }}</span>
            <span v-else class="free-badge">免费</span>
          </div>
        </div>
      </div>

      <!-- 亲子互动圈 -->
      <div class="circle-group">
        <div class="circle-header">
          <span class="circle-icon">‍👩‍</span>
          <span class="circle-name">亲子互动</span>
          <span class="circle-desc">全家一起</span>
        </div>
        <div class="scene-grid">
          <div 
            v-for="scene in familyScenes" 
            :key="scene.id"
            class="scene-card"
            @click="enterScene(scene)"
          >
            <span class="scene-icon">{{ scene.icon }}</span>
            <span class="scene-name">{{ scene.name }}</span>
            <span v-if="scene.vipLevel > 0" class="vip-badge">{{ scene.vipLevel === 1 ? '会员' : 'VIP' }}</span>
            <span v-else class="free-badge">免费</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import scenes from '@/utils/roles'

const router = useRouter()
const chatStore = useChatStore()

const emotionScenes = computed(() => scenes.filter(s => s.circle === '情绪解压'))
const socialScenes = computed(() => scenes.filter(s => s.circle === '社交训练'))
const familyScenes = computed(() => scenes.filter(s => s.circle === '亲子互动'))

const goToChat = () => {
  router.push('/chat')
}

const enterScene = (scene) => {
  chatStore.enterScene(scene)
  router.push('/chat')
}
</script>

<style scoped>
.home-view {
  padding: 20px;
  padding-bottom: 80px;
}

.guide-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  cursor: pointer;
}

.guide-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.guide-text h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.guide-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.link-text {
  color: #4CAF50;
  text-decoration: underline;
}

.scenes-section {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.circle-group {
  margin-bottom: 30px;
}

.circle-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.circle-icon {
  font-size: 20px;
}

.circle-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.circle-desc {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.scene-card {
  background: white;
  border-radius: 12px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.scene-card:active {
  transform: scale(0.95);
}

.scene-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.scene-name {
  font-size: 14px;
  color: #333;
}

.vip-badge, .free-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.vip-badge {
  background: #FFD700;
  color: #333;
}

.free-badge {
  background: #E8F5E9;
  color: #4CAF50;
}
</style>
