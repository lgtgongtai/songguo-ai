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
  
  // 意图识别 - 理解用户在说什么
  const intents = {
    // 情绪表达
    angry: /生气|愤怒|火大|烦死了|气死|讨厌|恨|不爽|恼火/i.test(text),
    sad: /难过|伤心|哭|流泪|悲痛|心酸|委屈|想哭|流泪/i.test(text),
    tired: /累|疲惫|疲倦|好累|太累|累死了|撑不住|扛不住/i.test(text),
    anxious: /焦虑|担心|害怕|紧张|不安|慌|忐忑|七上八下/i.test(text),
    lonely: /孤独|寂寞|孤单|一个人|没人陪|没人懂|没人理解/i.test(text),
    stressed: /压力|压力大|压垮|喘不过气|受不了|崩溃|快疯了/i.test(text),
    confused: /迷茫|困惑|不知道|怎么办|如何选择|纠结|犹豫/i.test(text),
    happy: /开心|高兴|快乐|幸福|棒|太好了|不错|满意|满足/i.test(text),
    grateful: /谢谢|感谢|感激|感恩|谢谢你|太感谢/i.test(text),
    
    // 具体话题
    work: /工作|上班|老板|同事|加班|辞职|跳槽|职场|项目|任务/i.test(text),
    relationship: /恋爱|分手|失恋|对象|男朋友|女朋友|老公|老婆|婚姻|相亲|表白/i.test(text),
    family: |父母|妈妈|爸爸|家庭|家人|孩子|儿子|女儿|婆媳|亲戚/i.test(text),
    money: |钱|没钱|穷|工资|房贷|车贷|信用卡|债务|理财|投资/i.test(text),
    health: |生病|身体|健康|医院|医生|药|失眠|头痛|不舒服/i.test(text),
    future: |未来|以后|将来|前途|规划|目标|梦想|理想|人生/i.test(text),
    self: |自己|自我|自卑|自信|性格|内向|外向|缺点|优点/i.test(text),
    
    // 互动意图
    greeting: |你好|嗨|hi|hello|在吗|喂|哈喽/i.test(text),
    question: |怎么办|为什么|怎么|如何|什么|哪里|谁|何时|多少|能|可以|会|吗|呢|吧/i.test(text),
    short: text.length <= 5,
    long: text.length > 50
  };
  
  // 智能回复库 - 根据意图匹配
  const replyDB = {
    // 愤怒情绪
    angry: [
      `谁惹你生气了？跟我说说，我帮你一起骂！`,
      `火气这么大，看来是真被气到了。来，深呼吸，慢慢说怎么回事。`,
      `生气是正常的，别憋着。说出来，心里会好受点。`,
      `我懂这种感觉，换谁都会生气。但生气归生气，别气坏了自己。`
    ],
    // 悲伤情绪
    sad: [
      `想哭就哭出来吧，我在这儿陪着你。哭完了，咱们再想办法。`,
      `心里难受是吧？没关系，这种时候不用强撑。我听着呢。`,
      `抱抱你。虽然我不能替你难过，但我可以陪你一起面对。`,
      `难过的时候，就让自己安静一会儿。不用急着好起来。`
    ],
    // 疲惫
    tired: [
      `累了就歇会儿，不用一直撑着。你已经做得很好了。`,
      `感觉被掏空了是吧？这种时候，什么都别想，先好好休息。`,
      `你太拼了。记住，身体比什么都重要，先照顾好自己。`,
      `累了就说出来，别一个人扛。我在这儿，你想说什么都可以。`
    ],
    // 焦虑
    anxious: [
      `别慌，慢慢说。焦虑的时候，把担心的事一件件列出来，会发现没那么可怕。`,
      `我理解这种忐忑的感觉。但你想过没有，最坏的结果是什么？往往没你想的那么糟。`,
      `焦虑是因为在乎。但过度担心解决不了问题，咱们一步步来。`,
      `深呼吸，跟我一起：吸气——呼气——。好点了吗？`
    ],
    // 孤独
    lonely: [
      `一个人确实不好受。但你知道吗，此刻有很多人和你一样。你并不孤单。`,
      `没人懂你的感觉我理解。但有时候，说出来就会好很多。我在听。`,
      `孤独是人生的常态，但不用一直习惯它。想聊天，随时找我。`,
      `就算全世界都不理解你，至少此刻，我在这儿陪着你。`
    ],
    // 压力
    stressed: [
      `压力大到喘不过气了？先停下来，深呼吸。天塌不下来。`,
      `你扛了太多了。记住，不用什么都自己扛，可以求助的。`,
      `压力大的时候，把任务拆小，一件一件做。别想太多，先行动。`,
      `你已经很努力了。别对自己太苛刻，适当放松一下。`
    ],
    // 迷茫
    confused: [
      `迷茫是因为你在思考，这是好事。慢慢想，答案会出来的。`,
      `不知道怎么办的时候，就选那个让你心里更踏实的。`,
      `人生没有标准答案。跟着自己的心走，错了也是经历。`,
      `纠结的时候，问问自己：一年后回头看，哪个选择更重要？`
    ],
    // 开心
    happy: [
      `看你这么开心，我也高兴！什么事让你这么乐呵？`,
      `太好了！这种好心情要记住，以后难过的时候拿出来想想。`,
      `哈哈，你这状态真不错！继续保持～`,
      `开心就对了！生活就该这样，多笑笑。`
    ],
    // 感谢
    grateful: [
      `不用谢，能帮到你就好。`,
      `客气啥，咱们这关系。有事随时找我。`,
      `哈哈，你开心我就开心。`,
      `应该的。记住，你不是一个人。`
    ],
    // 工作问题
    work: [
      `工作不顺心？是人际关系还是工作内容？说说具体情况。`,
      `职场确实复杂。但记住，工作只是生活的一部分，别让它定义你。`,
      `加班太多？该休息就休息，身体比KPI重要。`,
      `想辞职？先想清楚：是暂时的情绪，还是真的不适合？`
    ],
    // 感情问题
    relationship: [
      `感情的事最让人纠结。你现在是什么情况？`,
      `失恋了？难过是正常的。但时间会治愈一切，真的。`,
      `恋爱中的问题，沟通最重要。别猜，直接说。`,
      `感情没有对错，只有合不合适。别委屈自己。`
    ],
    // 家庭问题
    family: [
      `家庭关系确实复杂。但家人之间，爱是真的，矛盾也是真的。`,
      `和父母有代沟？试着理解他们的出发点，但也坚持自己的底线。`,
      `家里的事，有时候需要时间。别急，慢慢沟通。`,
      `家人之间，有时候退一步不是认输，是珍惜。`
    ],
    // 金钱问题
    money: [
      `钱的问题确实让人焦虑。但记住，钱是工具，不是目的。`,
      `经济压力大？先理清收支，看看哪里能调整。`,
      `没钱的时候最难，但这也是成长的机会。慢慢来。`,
      `别拿自己和别人比。每个人节奏不同，你的路你自己走。`
    ],
    // 健康问题
    health: [
      `身体不舒服？先去看医生，别拖着。`,
      `健康是第一位的。其他都可以放一放，先照顾好自己。`,
      `失眠？试试睡前放松，别想太多。实在不行就起来坐会儿。`,
      `生病了就好好休息，别硬撑。身体会告诉你需要什么。`
    ],
    // 未来迷茫
    future: [
      `未来谁都说不准。但你可以决定现在做什么。`,
      `别想太远，先把眼前的事做好。路是一步步走出来的。`,
      `梦想可以有，但也要脚踏实地。先定个小目标？`,
      `人生没有白走的路，每一步都算数。别太焦虑未来。`
    ],
    // 自我认知
    self: [
      `每个人都有自己的优缺点。接受不完美的自己，才是成熟的开始。`,
      `自卑？想想你做成过的事。你能行，只是暂时没看到。`,
      `性格没有好坏，内向外向各有优势。做真实的自己就好。`,
      `别总盯着自己的缺点。你身上有很多闪光点，只是你没发现。`
    ],
    // 打招呼
    greeting: [
      `嗨！我在呢。今天想聊点什么？`,
      `你好啊～有什么想说的，尽管说。`,
      `在呢！看你来了，有什么心事吗？`,
      `哈喽～我在这儿，你想聊什么都可以。`
    ],
    // 通用回复（无法识别意图时）
    default: [
      `嗯，我听着呢。你继续说～`,
      `我明白了。然后呢？`,
      `嗯嗯，我在。你想说什么都可以。`,
      `我懂你的感受。慢慢说，我认真听着。`,
      `这事儿确实值得想想。你是怎么考虑的？`,
      `嗯，我理解。换作是我，可能也会这样想。`,
      `你说的有道理。不过，有没有想过另一种可能？`,
      `嗯嗯，继续。我在这儿陪着你。`
    ]
  };
  
  // 根据意图选择回复
  let intentKey = 'default';
  
  // 优先匹配具体话题
  if (intents.work) intentKey = 'work';
  else if (intents.relationship) intentKey = 'relationship';
  else if (intents.family) intentKey = 'family';
  else if (intents.money) intentKey = 'money';
  else if (intents.health) intentKey = 'health';
  else if (intents.future) intentKey = 'future';
  else if (intents.self) intentKey = 'self';
  // 然后匹配情绪
  else if (intents.angry) intentKey = 'angry';
  else if (intents.sad) intentKey = 'sad';
  else if (intents.tired) intentKey = 'tired';
  else if (intents.anxious) intentKey = 'anxious';
  else if (intents.lonely) intentKey = 'lonely';
  else if (intents.stressed) intentKey = 'stressed';
  else if (intents.confused) intentKey = 'confused';
  else if (intents.happy) intentKey = 'happy';
  else if (intents.grateful) intentKey = 'grateful';
  else if (intents.greeting) intentKey = 'greeting';
  
  // 从对应意图的回复库中随机选择
  const replies = replyDB[intentKey] || replyDB.default;
  return replies[Math.floor(Math.random() * replies.length)];
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
