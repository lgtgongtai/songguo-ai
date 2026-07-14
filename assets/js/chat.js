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
    const reply = getSmartFallback(text);
    addMessage(reply, false);
  }
}

// ===== 智能Fallback回复 =====
function getSmartFallback(userText) {
  const text = userText.trim();
  
  // 检测用户情绪
  const isNegative = /烦|累|哭|难过|痛苦|崩溃|绝望|生气|愤怒|焦虑|担心|害怕|孤独|寂寞|无聊|压力|郁闷|烦躁|抓狂|疯了/i.test(text);
  const isPositive = /开心|高兴|快乐|幸福|棒|好|谢谢|感谢|哈哈|嘻嘻|嗯嗯|好的|可以|不错/i.test(text);
  const isQuestion = /怎么办|为什么|怎么|如何|什么|哪里|谁|何时|多少|能|可以|会/i.test(text);
  const isShort = text.length <= 5;
  
  // 回复风格池
  const styles = {
    // 暖心安慰型（大哥哥/大姐姐）
    warm: [
      `嗯，我听着呢。${text.includes('烦') ? '烦心事说出来就好一半了。' : text.includes('累') ? '累了就歇会儿，不用一直撑着。' : text.includes('哭') ? '想哭就哭出来，我在这儿陪着你。' : '慢慢说，我在。'}`,
      `抱抱你～${isNegative ? '这种感觉确实不好受，但你不是一个人。' : '有什么想说的，我都听着。'}`,
      `我懂你的感受。${isNegative ? '有时候就是会觉得特别难，但熬过去就好了。' : '跟我说说，怎么了？'}`,
      `没事的，${isNegative ? '情绪来了就让它来，过去了就让它过去。' : '我在呢，你想说什么都可以。'}`,
      `嗯嗯，我理解。${isNegative ? '这种感觉我也经历过，确实挺难受的。' : '你继续说，我认真听着。'}`
    ],
    // 日常聊天型（家长里短）
    casual: [
      `诶，${isQuestion ? '这个嘛，我觉得可以这样想——' : '说起这个，我想起个事儿——'}${text.length > 10 ? '你刚才说的挺有道理的。' : '嗯嗯，继续说～'}`,
      `哈哈，${isPositive ? '看你这么开心我也高兴！' : isNegative ? '别太往心里去，事儿总会过去的。' : '你这话说得有意思～'}`,
      `哎，${isQuestion ? '这事儿吧，得慢慢来。' : '生活就是这样，起起落落的。'}${isNegative ? '不过你看，今天天气还不错对吧？' : '你说是不是这个理儿？'}`,
      `嗯，${isShort ? '然后呢？' : '我明白了。'}${isNegative ? '要不咱换个角度想想？' : '你继续，我听着。'}`,
      `对对对，${isPositive ? '就是这个劲儿！' : isNegative ? '我懂我懂，换谁都这样。' : '你说得对。'}`
    ],
    // 幽默调侃型
    humor: [
      `哎呀，${isNegative ? '这情绪来得比外卖还快！不过没事，我接住了～' : '你这是要跟我唠嗑啊，来来来，瓜子准备好了！'}`,
      `哈哈，${isShort ? '你这话说得，跟挤牙膏似的～多说点！' : isQuestion ? '你这问题问得，跟问我中午吃啥一样难回答！' : '你这状态，跟周一早上的我一模一样！'}`,
      `哟，${isNegative ? '这是谁惹咱们了？我去帮你出气！...算了，我还是在这儿陪你吧。' : '你这是要跟我谈心啊，那我可得认真了！'}`,
      `嘿，${isPositive ? '看你乐的，跟中了奖似的！' : isNegative ? '别愁眉苦脸的，笑一个嘛～不笑也行，我逗你笑！' : '你这话说得，我都想给你鼓掌了！'}`
    ],
    // 严肃建议型
    serious: [
      `我认真想了一下你说的话。${isNegative ? '首先，你的感受是合理的，不用否定自己。其次，试着把问题拆开看，一个一个解决。' : isQuestion ? '我的建议是：先冷静下来，理清思路，再行动。' : '我觉得你可以试试这样做：先把想法写下来，再慢慢整理。'}`,
      `说句实在话，${isNegative ? '情绪管理是个长期功夫，但每一步都算数。' : isQuestion ? '解决问题需要耐心和方法，急不来。' : '你能说出来，就已经是第一步了。'}`,
      `我直说了——${isNegative ? '一直陷在情绪里没用，得想办法走出来。' : isQuestion ? '别光想，去做。做了才知道行不行。' : '行动比空想有用，试试看。'}`
    ],
    // 诗意文艺型
    poetic: [
      `你知道吗，${isNegative ? '乌云再厚，也遮不住太阳。你的心情也是。' : isQuestion ? '人生就像一场旅行，不必在乎目的地，在乎的是沿途的风景。' : '生活就像一杯茶，不会苦一辈子，但总会苦一阵子。'}`,
      `有人说，${isNegative ? '每一个不曾起舞的日子，都是对生命的辜负。所以，开心点！' : '世界上只有一种英雄主义，就是认清生活真相后依然热爱生活。' : '你若安好，便是晴天。'}`,
      `想起一句话：${isNegative ? '"冬天来了，春天还会远吗？" 再坚持一下。' : '"生活不止眼前的苟且，还有诗和远方。"' : '"愿你被这世界温柔相待。"'}`
    ],
    // 名人名言型（偶尔用）
    quote: [
      `荣格说："没有一种觉醒是不带着痛苦的。"——但痛苦说出来，就轻了一半。`,
      `里尔克说："对你心里所有未解的问题保持耐心。"——咱不急，慢慢来。`,
      `泰戈尔说："世界以痛吻我，要我报之以歌。"——但咱先不唱歌，先哭一会儿也行。`,
      `老子说："大音希声。"——有时候不说话，比说什么都管用。我在这听着呢。`,
      `苏轼说："人生如逆旅，我亦是行人。"——大家都一样，都不容易。`
    ]
  };
  
  // 根据情绪和场景选择风格
  let stylePool;
  if (isNegative) {
    // 负面情绪：主要用暖心安慰，偶尔严肃建议
    const r = Math.random();
    if (r < 0.4) stylePool = styles.warm;
    else if (r < 0.7) stylePool = styles.casual;
    else if (r < 0.85) stylePool = styles.serious;
    else if (r < 0.95) stylePool = styles.poetic;
    else stylePool = styles.quote;
  } else if (isPositive) {
    // 正面情绪：主要用日常聊天和幽默
    const r = Math.random();
    if (r < 0.4) stylePool = styles.casual;
    else if (r < 0.7) stylePool = styles.humor;
    else if (r < 0.9) stylePool = styles.warm;
    else stylePool = styles.poetic;
  } else if (isQuestion) {
    // 问题型：主要用严肃建议和日常聊天
    const r = Math.random();
    if (r < 0.4) stylePool = styles.serious;
    else if (r < 0.7) stylePool = styles.casual;
    else if (r < 0.9) stylePool = styles.warm;
    else stylePool = styles.quote;
  } else {
    // 其他：混合使用
    const r = Math.random();
    if (r < 0.3) stylePool = styles.casual;
    else if (r < 0.5) stylePool = styles.warm;
    else if (r < 0.7) stylePool = styles.humor;
    else if (r < 0.85) stylePool = styles.serious;
    else if (r < 0.95) stylePool = styles.poetic;
    else stylePool = styles.quote;
  }
  
  return stylePool[Math.floor(Math.random() * stylePool.length)];
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
