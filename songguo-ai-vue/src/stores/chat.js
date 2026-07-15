import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getSmartFallback } from '@/utils/modules/replies'
import { checkCrisisKeywords } from '@/utils/compliance'
import scenes from '@/utils/roles'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref([])
  const records = ref([])
  const currentRole = ref(null)
  const userAvatar = ref('')
  const nickname = ref('松果用户')
  const vipLevel = ref(0)
  const sessionStartTime = ref(null)
  const addictionShown = ref(false)
  const currentSessionId = ref(null)
  const dimensionScores = ref({
    emotionRecognition: 0,
    empathyAcceptance: 0,
    stressRelease: 0,
    relaxationDepth: 0,
    selfAwareness: 0
  })

  // 初始化
  const init = () => {
    // 从localStorage加载数据
    const savedAvatar = localStorage.getItem('userAvatar')
    if (savedAvatar) userAvatar.value = savedAvatar
    
    const savedNickname = localStorage.getItem('nickname')
    if (savedNickname) nickname.value = savedNickname
    
    const savedVipLevel = localStorage.getItem('vipLevel')
    if (savedVipLevel) vipLevel.value = parseInt(savedVipLevel)
    
    const savedRecords = localStorage.getItem('chatRecords')
    if (savedRecords) records.value = JSON.parse(savedRecords)
    
    // 检查沉迷防控
    checkAddiction()
  }

  // 进入场景
  const enterScene = (scene) => {
    currentRole.value = scene
    messages.value = []
    sessionStartTime.value = Date.now()
    
    // 添加开场白
    if (scene.opening) {
      addMessage('ai', scene.opening)
    }
  }

  // 添加消息
  const addMessage = (role, content) => {
    messages.value.push({
      role,
      content,
      timestamp: Date.now()
    })
  }

  // 获取AI回复
  const getAIReply = async (userText) => {
    // 使用本地回复
    return getSmartFallback(userText)
  }

  // 检查危机关键词
  const checkCrisis = (text) => {
    return checkCrisisKeywords(text)
  }

  // 检查沉迷防控
  const checkAddiction = () => {
    if (!sessionStartTime.value) return
    
    const elapsed = Date.now() - sessionStartTime.value
    const twoHours = 2 * 60 * 60 * 1000
    
    if (elapsed >= twoHours && !addictionShown.value) {
      addictionShown.value = true
      alert('您已连续使用2小时，请注意休息，保护视力。')
    }
  }

  // 设置用户头像
  const setUserAvatar = (avatar) => {
    userAvatar.value = avatar
    localStorage.setItem('userAvatar', avatar)
  }

  // 设置昵称
  const setNickname = (name) => {
    nickname.value = name
    localStorage.setItem('nickname', name)
  }

  // 清空记录
  const updateDimensionScores = (scores) => {
    dimensionScores.value = { ...dimensionScores.value, ...scores }
  }

  const clearRecords = () => {
    records.value = []
    localStorage.removeItem('chatRecords')
  }

  // 保存记录
  const saveRecord = () => {
    if (messages.value.length === 0) return
    
    const record = {
      id: Date.now(),
      sceneName: currentRole.value?.name || '松松',
      date: new Date().toLocaleDateString(),
      preview: messages.value[messages.value.length - 1]?.content || ''
    }
    
    records.value.unshift(record)
    localStorage.setItem('chatRecords', JSON.stringify(records.value))
  }

  // 退出登录
  const logout = () => {
    localStorage.removeItem('userAvatar')
    localStorage.removeItem('nickname')
    localStorage.removeItem('vipLevel')
    localStorage.removeItem('chatRecords')
    localStorage.removeItem('complianceAgreed')
    
    userAvatar.value = ''
    nickname.value = '松果用户'
    vipLevel.value = 0
    records.value = []
    messages.value = []
    currentRole.value = null
  }

  return {
    currentSessionId,
    dimensionScores,
    messages,
    records,
    currentRole,
    userAvatar,
    nickname,
    vipLevel,
    init,
    enterScene,
    addMessage,
    getAIReply,
    checkCrisis,
    setUserAvatar,
    setNickname,
    clearRecords,
    saveRecord,
    updateDimensionScores,
    logout
  }
})
