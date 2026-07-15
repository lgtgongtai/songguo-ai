<template>
  <div class="records-view">
    <h2>对话记录</h2>
    <div v-if="records.length === 0" class="empty-state">
      <p>暂无对话记录</p>
    </div>
    <div v-else class="records-list">
      <div v-for="record in records" :key="record.id" class="record-item">
        <div class="record-header">
          <span class="record-scene">{{ record.sceneName }}</span>
          <span class="record-date">{{ record.date }}</span>
        </div>
        <div class="record-preview">{{ record.preview }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const records = computed(() => chatStore.records)
</script>

<style scoped>
.records-view {
  padding: 20px;
  padding-bottom: 80px;
}

.records-view h2 {
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #999;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.record-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.record-scene {
  font-weight: bold;
  color: #333;
}

.record-date {
  font-size: 12px;
  color: #999;
}

.record-preview {
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
