// ===== Chat Module =====
// Handles: message rendering, API calls, scene selection

// ===== API Configuration =====
const API_URL = 'https://songguo-backend-tyuawuehjq.cn-hangzhou.fcapp.run';
let sessionId = null;
let currentRole = '松果';
let messageCount = 0;

// ===== Message Rendering =====
function addMessage(text, isUser) {
  const container = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = 'msg-row ' + (isUser ? 'user' : 'bot');
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = isUser ? '' : (currentRole === '松松' ? '🐿' : (currentRole === '松果' ? '🐿' : scenes.find(s => s.name === currentRole)?.emoji || ''));
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  row.appendChild(avatar); row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = 'msg-row bot'; row.id = 'typing-row';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = currentRole === '松果' ? '🐿' : (scenes.find(s => s.name === currentRole)?.emoji || '🐿');
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  row.appendChild(avatar); row.appendChild(indicator);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() { const el = document.getElementById('typing-row'); if(el) el.remove(); }

// ===== Send Message =====
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if(!text) return;
  if(checkCrisisKeywords(text)) showCrisisModal();
  addMessage(text, true);
  input.value = ''; input.style.height = 'auto';
  messageCount++;
  showTyping();
  
  // 松松客服引导逻辑
  if(currentRole === '松松') {
    setTimeout(() => {
      removeTyping();
      const reply = getSongSongReply(text);
      addMessage(reply, false);
    }, 800);
    return;
  }
  
  try {
    const response = await fetch(API_URL + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Date': new Date().toUTCString() },
      body: JSON.stringify({ message: text, session_id: sessionId || 'session_' + Date.now(), role: currentRole })
    });
    if(!response.ok) throw new Error('API returned ' + response.status);
    const data = await response.json();
    removeTyping();
    sessionId = data.session_id;
    addMessage(data.reply, false);
  } catch (error) {
    removeTyping();
    console.log('API error, using fallback:', error.message);
    const replies = roleReplies[currentRole] || roleReplies['松果'];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    addMessage(reply, false);
  }
}

// ===== 松松客服回复逻辑 =====
function getSongSongReply(userText) {
  const text = userText.toLowerCase();
  
  // 检测会员/VIP意图
  if(text.includes('会员') || text.includes('vip') || text.includes('付费') || text.includes('开通')) {
    return songSongGuides.membership['会员'];
  }
  if(text.includes('复盘') || text.includes('深度')) {
    return songSongGuides.membership['VIP'];
  }
  
  // 检测场景选择意图
  if(text.includes('吐槽') || text.includes('发泄') || text.includes('骂')) {
    return '好的！<b>吐槽大会</b>是免费的，现在就可以去~ 点击左上角←返回首页，选择🔥吐槽大会，我们开始发泄！';
  }
  if(text.includes('治愈') || text.includes('陪伴') || text.includes('温柔')) {
    return '<b>治愈聊天</b>需要会员哦~ 开通会员后可以无限使用，还有专属角色皮肤和优先客服支持！点击这里开通会员 →';
  }
  if(text.includes('吵架') || text.includes('模拟') || text.includes('')) {
    return '<b>吵架模拟器</b>需要会员哦~ 把憋着的话甩出来，超解压！开通会员即可使用 →';
  }
  if(text.includes('树洞') || text.includes('秘密') || text.includes('删除')) {
    return '<b>树洞</b>需要会员哦~ 什么都可以说，说完就删，绝对安全！开通会员即可使用 →';
  }
  if(text.includes('复盘') || text.includes('分析') || text.includes('看清')) {
    return '<b>复盘引导</b>是VIP专属场景哦~ 包含深度情绪分析和专属心理报告！点击这里开通VIP →';
  }
  if(text.includes('放松') || text.includes('呼吸') || text.includes('深呼吸')) {
    return '好的！<b>放松舱</b>是免费的，跟着松果一起深呼吸~ 点击左上角←返回首页，选择放松舱，我们开始放松！';
  }
  
  // 检测情绪关键词，推荐场景
  for(const keyword in songSongGuides.recommend) {
    if(keyword !== 'default' && text.includes(keyword)) {
      return songSongGuides.recommend[keyword];
    }
  }
  
  // 检测场景选择
  if(text.includes('场景') || text.includes('哪个') || text.includes('试试') || text.includes('选择')) {
    return songSongGuides.opening;
  }
  
  // 默认回复
  const fallback = songSongGuides.fallback[Math.floor(Math.random() * songSongGuides.fallback.length)];
  return fallback + '\n\n🔥 吐槽大会（免费）\n🫧 放松舱（免费）\n🌿 治愈聊天（会员）\n💢 吵架模拟器（会员）\n🕳 树洞（会员）\n🧭 复盘引导（VIP）';
}

function handleKeyDown(e) {
  if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

// ===== Voice Input =====
let recognition = null;
let isRecording = false;

function initVoiceRecognition() {
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log('Voice recognition not supported');
    document.getElementById('voice-btn').style.display = 'none';
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onstart = function() {
    isRecording = true;
    document.getElementById('voice-btn').classList.add('recording');
    document.getElementById('chat-input').placeholder = '正在聆听...';
  };
  
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('chat-input').value = transcript;
    document.getElementById('chat-input').style.height = 'auto';
    document.getElementById('chat-input').style.height = Math.min(document.getElementById('chat-input').scrollHeight, 100) + 'px';
  };
  
  recognition.onend = function() {
    isRecording = false;
    document.getElementById('voice-btn').classList.remove('recording');
    document.getElementById('chat-input').placeholder = '说点什么...';
  };
  
  recognition.onerror = function(event) {
    console.log('Voice error:', event.error);
    isRecording = false;
    document.getElementById('voice-btn').classList.remove('recording');
    document.getElementById('chat-input').placeholder = '说点什么...';
  };
}

function toggleVoiceInput() {
  if(!recognition) {
    alert('您的浏览器不支持语音输入，请使用Chrome或Edge浏览器');
    return;
  }
  if(isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

// Initialize voice on load
initVoiceRecognition();

// ===== Scene Selection =====
async function selectScene(sceneId) {
  const scene = scenes.find(s => s.id === sceneId);
  if(!scene) return;
  currentRole = scene.name;
  sessionId = null;
  document.getElementById('chat-role-name').textContent = scene.name;
  document.getElementById('chat-role-status').textContent = scene.desc;
  switchTab('chat');
  setTimeout(() => {
    showTyping();
    setTimeout(() => { removeTyping(); addMessage(scene.opening, false); }, 600);
  }, 300);
}

async function resetChat() {
  currentRole = '松果'; messageCount = 0; sessionId = null;
  document.getElementById('chat-role-name').textContent = '松果';
  document.getElementById('chat-role-status').textContent = '在线 · 你的解压伙伴';
  const container = document.getElementById('chat-messages');
  container.innerHTML = '';
  try {
    await fetch(API_URL + '/api/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId || 'session_' + Date.now(), target_role: '松果' })
    });
  } catch (e) {}
  addMessage('嘿，你又来啦~ 今天想聊点什么？', false);
}
