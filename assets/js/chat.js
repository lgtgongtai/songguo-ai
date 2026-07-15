// ===== Chat Module =====
// Handles: message rendering, API calls, scene selection

// ===== API Configuration =====
const API_URL = 'https://songguo-backend-tyuawuehjq.cn-hangzhou.fcapp.run';
let sessionId = null;
let currentRole = '松果';
let messageCount = 0;

// ===== Message Rendering =====
function addMessage(text, isUser, scenes = null) {
  const container = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = 'msg-row ' + (isUser ? 'user' : 'bot');
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  if(isUser) {
    const userAvatar = localStorage.getItem('user_avatar') || '';
    if(userAvatar.startsWith('data:image')) {
      avatar.style.backgroundImage = 'url(' + userAvatar + ')';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    } else if(userAvatar) {
      avatar.style.backgroundImage = 'url(assets/avatars/' + userAvatar + '.svg)';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    } else {
      avatar.style.backgroundImage = 'url(assets/avatars/user-default.svg)';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    }
  } else {
    if(currentRole === '松松') {
      avatar.style.backgroundImage = 'url(assets/avatars/songguo-default.svg)';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    } else if(currentRole === '松果') {
      avatar.style.backgroundImage = 'url(assets/avatars/pinecone.svg)';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    } else if(scenes) {
      const scene = scenes.find(s => s.name === currentRole);
      if(scene) {
        const emojiMap = {'🔥':'songguo-angry','🌿':'songguo-gentle','💢':'songguo-angry','':'songguo-think','🧭':'songguo-think','🫧':'songguo-relax'};
        const svgName = emojiMap[scene.emoji] || 'songguo-default';
        avatar.style.backgroundImage = 'url(assets/avatars/' + svgName + '.svg)';
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
      } else {
        avatar.style.backgroundImage = 'url(assets/avatars/songguo-default.svg)';
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
      }
    } else {
      avatar.style.backgroundImage = 'url(assets/avatars/songguo-default.svg)';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    }
  }
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  
  // 添加场景卡片
  if(scenes && scenes.length > 0) {
    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'scene-cards-inline';
    scenes.forEach(sceneName => {
      const sceneData = getSceneData(sceneName);
      const card = document.createElement('div');
      card.className = 'scene-card-inline';
      card.onclick = () => selectScene(sceneName);
      card.innerHTML = `
        <div class="scene-card-icon">${sceneData.icon}</div>
        <div class="scene-card-info">
          <div class="scene-card-name">${sceneName}</div>
          <div class="scene-card-desc">${sceneData.desc}</div>
        </div>
        ${sceneData.vip ? `<span class="scene-card-tag ${sceneData.vipLevel === 'VIP' ? 'vip' : 'member'}">${sceneData.vipLevel === 'VIP' ? 'VIP' : '会员'}</span>` : '<span class="scene-card-tag free">免费</span>'}
      `;
      cardsDiv.appendChild(card);
    });
    bubble.appendChild(cardsDiv);
  }
  
  row.appendChild(avatar); row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function getSceneData(sceneName) {
  const data = {
    '吐槽大会': { icon: '', desc: '找个AI一起痛快吐槽', vip: false },
    '治愈聊天': { icon: '', desc: '温柔陪伴，被接住的感觉', vip: true },
    '吵架模拟器': { icon: '', desc: '把憋着的话甩出来', vip: true },
    '树洞': { icon: '', desc: '什么都可以说，说完就删', vip: true },
    '复盘引导': { icon: '', desc: '陪你看清情绪的来源', vip: true, vipLevel: 'VIP' },
    '放松舱': { icon: '', desc: '跟着松果一起深呼吸', vip: false }
  };
  return data[sceneName] || { icon: '', desc: '', vip: false };
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = 'msg-row bot'; row.id = 'typing-row';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = currentRole === '松果' ? '' : (scenes.find(s => s.name === currentRole)?.emoji || '');
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
      addMessage(reply.text, false, reply.scenes);
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
    const reply = getSmartFallback(text);
    addMessage(reply, false);
  }
}

// ===== 松松客服回复逻辑 =====
function getSongSongReply(userText) {
  const text = userText.toLowerCase();
  
  // 检测会员/VIP意图
  if(text.includes('会员') || text.includes('vip') || text.includes('付费') || text.includes('开通')) {
    return { text: songSongGuides.membership['会员'], scenes: [] };
  }
  if(text.includes('复盘') || text.includes('深度')) {
    return { text: songSongGuides.membership['VIP'], scenes: [] };
  }
  
  // 检测场景选择意图
  if(text.includes('吐槽') || text.includes('发泄') || text.includes('骂')) {
    return { text: '好的！<b>吐槽大会</b>是免费的，现在就可以去~ 点击下方直接进入👇', scenes: ['吐槽大会'] };
  }
  if(text.includes('治愈') || text.includes('陪伴') || text.includes('温柔')) {
    return { text: '<b>治愈聊天</b>需要会员哦~ 开通会员后可以无限使用，还有专属角色皮肤和优先客服支持！点击下方直接进入👇', scenes: ['治愈聊天'], needVip: true };
  }
  if(text.includes('吵架') || text.includes('模拟') || text.includes('')) {
    return { text: '<b>吵架模拟器</b>需要会员哦~ 把憋着的话甩出来，超解压！点击下方直接进入👇', scenes: ['吵架模拟器'], needVip: true };
  }
  if(text.includes('树洞') || text.includes('秘密') || text.includes('删除')) {
    return { text: '<b>树洞</b>需要会员哦~ 什么都可以说，说完就删，绝对安全！点击下方直接进入👇', scenes: ['树洞'], needVip: true };
  }
  if(text.includes('复盘') || text.includes('分析') || text.includes('看清')) {
    return { text: '<b>复盘引导</b>是VIP专属场景哦~ 包含深度情绪分析和专属心理报告！点击下方直接进入👇', scenes: ['复盘引导'], needVip: true, needVipLevel: 'VIP' };
  }
  if(text.includes('放松') || text.includes('呼吸') || text.includes('深呼吸')) {
    return { text: '好的！<b>放松舱</b>是免费的，跟着松果一起深呼吸~ 点击下方直接进入', scenes: ['放松舱'] };
  }
  
  // 检测情绪关键词，推荐场景
  let emotion = null;
  for(const keyword in songSongGuides.recommend) {
    if(keyword !== 'default' && text.includes(keyword)) {
      emotion = keyword;
      break;
    }
  }
  
  if(emotion) {
    const guide = songSongGuides.recommend[emotion];
    let scenes = [];
    if(emotion === '生气') scenes = ['吐槽大会', '吵架模拟器'];
    else if(emotion === '累') scenes = ['治愈聊天', '放松舱'];
    else if(emotion === '焦虑') scenes = ['放松舱', '复盘引导'];
    else if(emotion === '难过') scenes = ['治愈聊天', '树洞'];
    else if(emotion === '压力') scenes = ['吐槽大会', '树洞'];
    return { text: guide, scenes: scenes, needVip: scenes.some(s => ['治愈聊天','吵架模拟器','树洞'].includes(s)) };
  }
  
  // 检测场景选择
  if(text.includes('场景') || text.includes('哪个') || text.includes('试试') || text.includes('选择')) {
    return { text: songSongGuides.opening, scenes: ['吐槽大会', '治愈聊天', '吵架模拟器', '树洞', '复盘引导', '放松舱'] };
  }
  
  // 打招呼
  if(text.includes('你好') || text.includes('嗨') || text.includes('hi') || text.includes('在吗')) {
    return { text: '嗨！我在呢~ 今天想聊点什么？或者选一个场景开始解压？👇', scenes: ['吐槽大会', '治愈聊天', '吵架模拟器', '树洞', '复盘引导', '放松舱'] };
  }
  
  // 感谢
  if(text.includes('谢谢') || text.includes('感谢') || text.includes('thanks')) {
    return { text: '不用谢~ 能帮到你就好！还想继续聊吗？👇', scenes: ['吐槽大会', '治愈聊天', '吵架模拟器', '树洞', '复盘引导', '放松舱'] };
  }
  
  // 默认回复（避免重复）
  const availableFallbacks = songSongGuides.fallback.filter(r => !recentReplies.includes(r));
  let fallback;
  if(availableFallbacks.length > 0) {
    fallback = availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)];
  } else {
    recentReplies = [];
    fallback = songSongGuides.fallback[Math.floor(Math.random() * songSongGuides.fallback.length)];
  }
  recentReplies.push(fallback);
  if(recentReplies.length > MAX_RECENT_REPLIES) {
    recentReplies.shift();
  }
  return { text: fallback + ' 👇', scenes: ['吐槽大会', '治愈聊天', '吵架模拟器', '树洞', '复盘引导', '放松舱'] };
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

// ===== Expose functions to global scope =====
window.sendMessage = sendMessage;
window.handleKeyDown = handleKeyDown;
window.toggleVoiceInput = toggleVoiceInput;
window.selectScene = selectScene;
window.resetChat = resetChat;
window.showTyping = showTyping;
window.removeTyping = removeTyping;
