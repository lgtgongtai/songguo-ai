// ===== Chat Module =====
// Handles: message rendering, API calls, scene selection

// ===== API Configuration =====
const API_URL = 'https://songguo-backend-tyuawuehjq.cn-hangzhou.fcapp.run';
let sessionId = null;
let currentRole = '松果';
let messageCount = 0;

// ===== 回复去重机制 =====
let recentReplies = []; // 最近使用的回复（最多保留15条）
const MAX_RECENT_REPLIES = 15;

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
    family: /父母|妈妈|爸爸|家庭|家人|孩子|儿子|女儿|婆媳|亲戚/i.test(text),
    money: /钱|没钱|穷|工资|房贷|车贷|信用卡|债务|理财|投资/i.test(text),
    health: /生病|身体|健康|医院|医生|药|失眠|头痛|不舒服/i.test(text),
    future: /未来|以后|将来|前途|规划|目标|梦想|理想|人生/i.test(text),
    self: /自己|自我|自卑|自信|性格|内向|外向|缺点|优点/i.test(text),
    
    // 互动意图
    greeting: /你好|嗨|hi|hello|在吗|喂|哈喽/i.test(text),
    question: /怎么办|为什么|怎么|如何|什么|哪里|谁|何时|多少|能|可以|会|吗|呢|吧/i.test(text),
    short: text.length <= 5,
    long: text.length > 50
  };
  
  // 智能回复库 - 根据意图匹配，提供具体建议
  const replyDB = {
    // 愤怒情绪 - 给出具体建议
    angry: [
      `谁惹你生气了？先别急着做决定。建议你：1）离开现场冷静10分钟 2）深呼吸5次 3）把想说的话写下来。等情绪平复了再处理，效果会更好。`,
      `火气这么大，看来是真被气到了。试试这个：找个没人的地方，大声喊出来，或者用力捶打枕头。把情绪释放出来，别憋在心里。`,
      `生气是正常的，但别让它控制你。建议你现在：喝杯冷水，听听音乐，或者出去走走。等冷静下来，咱们再想办法解决。`,
      `我懂这种感觉。但生气时做的决定往往会后悔。先做这三件事：1）暂停对话 2）深呼吸 3）想想你最想要的结果是什么。`
    ],
    // 悲伤情绪 - 给出具体建议
    sad: [
      `想哭就哭出来吧，这很正常。哭完之后，建议你：1）洗个热水澡 2）吃点喜欢的东西 3）早点休息。明天会好一点的。`,
      `心里难受是吧？没关系，这种时候不用强撑。建议你找个信任的人聊聊，或者写日记把感受记下来。说出来会好受很多。`,
      `抱抱你。难过的时候，试试这些方法：1）听舒缓的音乐 2）抱着抱枕 3）看一部温暖的电影。让自己被温柔包围。`,
      `难过的时候，就让自己安静一会儿。不用急着好起来。但记住：如果持续两周以上情绪低落，建议找专业心理咨询师聊聊。`
    ],
    // 疲惫 - 给出具体建议
    tired: [
      `累了就歇会儿，不用一直撑着。建议你：1）今晚早点睡 2）明天请个假 3）把不重要的事推掉。身体是革命的本钱。`,
      `感觉被掏空了是吧？这种时候，什么都别想，先好好休息。具体建议：关掉手机，泡个脚，听听白噪音，让自己彻底放松。`,
      `你太拼了。记住，身体比什么都重要。建议你制定一个休息计划：每工作1小时休息10分钟，每天保证7小时睡眠。`,
      `累了就说出来，别一个人扛。建议你：1）跟家人朋友说说 2）适当减少工作量 3）培养一个放松的爱好，比如瑜伽或冥想。`
    ],
    // 焦虑 - 给出具体建议
    anxious: [
      `别慌，慢慢说。焦虑的时候，建议你：1）把担心的事写下来 2）分清哪些能控制、哪些不能 3）专注于能控制的部分。`,
      `我理解这种忐忑的感觉。试试这个方法：深呼吸4-7-8（吸气4秒，憋气7秒，呼气8秒），重复4次。能有效缓解焦虑。`,
      `焦虑是因为在乎。但过度担心解决不了问题。建议你：1）列出最坏的情况 2）想想应对方案 3）你会发现没那么可怕。`,
      `深呼吸，跟我一起：吸气——呼气——。好点了吗？如果经常焦虑，建议每天冥想10分钟，或者试试运动，效果很好。`
    ],
    // 孤独 - 给出具体建议
    lonely: [
      `一个人确实不好受。建议你：1）主动联系一个朋友 2）参加兴趣小组 3）养个宠物。孤独感会慢慢减少的。`,
      `没人懂你的感觉我理解。但有时候，说出来就会好很多。建议你写日记、找心理咨询师，或者加入支持小组。`,
      `孤独是人生的常态，但不用一直习惯它。建议你：1）培养社交爱好 2）定期和朋友聚会 3）学会享受独处的时光。`,
      `就算全世界都不理解你，至少此刻，我在这儿陪着你。如果长期感到孤独，建议主动拓展社交圈，或者寻求专业帮助。`
    ],
    // 压力 - 给出具体建议
    stressed: [
      `压力大到喘不过气了？先停下来，深呼吸。建议你：1）把任务列清单 2）按优先级排序 3）一次只做一件事。`,
      `你扛了太多了。记住，不用什么都自己扛。建议你：1）学会说"不" 2）寻求他人帮助 3）适当降低对自己的要求。`,
      `压力大的时候，把任务拆小，一件一件做。具体方法：用番茄工作法（25分钟专注+5分钟休息），效率会提高很多。`,
      `你已经很努力了。别对自己太苛刻。建议你：1）每天给自己放个短假 2）培养放松习惯 3）必要时寻求专业帮助。`
    ],
    // 迷茫 - 给出具体建议
    confused: [
      `迷茫是因为你在思考，这是好事。建议你：1）列出所有选项 2）写下每个选项的利弊 3）听听信任的人的意见。`,
      `不知道怎么办的时候，就选那个让你心里更踏实的。具体方法：闭上眼睛，想象每个选择的结果，看哪个让你更安心。`,
      `人生没有标准答案。跟着自己的心走，错了也是经历。建议你：1）设定小目标 2）先行动再调整 3）别怕犯错。`,
      `纠结的时候，问问自己：一年后回头看，哪个选择更重要？这个方法能帮你跳出当下的纠结，看到更大的图景。`
    ],
    // 开心 - 给出具体建议
    happy: [
      `看你这么开心，我也高兴！建议你：1）把这份快乐记下来 2）和朋友分享 3）继续保持好心情！`,
      `太好了！这种好心情要记住，以后难过的时候拿出来想想。建议你写个"快乐日记"，记录每天开心的事。`,
      `哈哈，你这状态真不错！继续保持～建议你：1）多和让你开心的人在一起 2）做自己喜欢的事 3）保持积极心态。`,
      `开心就对了！生活就该这样，多笑笑。建议你：1）培养幽默感 2）学会感恩 3）把快乐传递给身边的人。`
    ],
    // 感谢 - 给出具体建议
    grateful: [
      `不用谢，能帮到你就好。如果以后还有问题，随时来找我。建议你：1）保持积极心态 2）学会自我调节 3）必要时寻求专业帮助。`,
      `客气啥，咱们这关系。有事随时找我。建议你：1）多和朋友交流 2）培养兴趣爱好 3）照顾好自己。`,
      `哈哈，你开心我就开心。记住，你不是一个人。建议你：1）建立支持系统 2）学会求助 3）相信自己能度过难关。`,
      `应该的。记住，你不是一个人。建议你：1）定期和朋友联系 2）参加社交活动 3）必要时寻求专业帮助。`
    ],
    // 工作问题 - 给出具体建议
    work: [
      `工作不顺心？建议你：1）先分析是人际关系还是工作内容的问题 2）和领导或HR沟通 3）如果实在不行，考虑换工作。`,
      `职场确实复杂。但记住，工作只是生活的一部分。建议你：1）设定工作与生活的边界 2）培养工作外的兴趣 3）别把工作情绪带回家。`,
      `加班太多？该休息就休息，身体比KPI重要。建议你：1）和领导沟通工作量 2）提高工作效率 3）学会拒绝不合理的要求。`,
      `想辞职？先想清楚：1）是暂时的情绪，还是真的不适合？2）有没有下家？3）经济上能否承受？想清楚再做决定。`
    ],
    // 感情问题 - 给出具体建议
    relationship: [
      `感情的事最让人纠结。建议你：1）先冷静下来 2）想想你们之间的问题是什么 3）找个合适的时机好好沟通。`,
      `失恋了？难过是正常的。建议你：1）允许自己难过 2）不要联系对方 3）把精力放在自己身上。时间会治愈一切。`,
      `恋爱中的问题，沟通最重要。建议你：1）别猜，直接说 2）用"我"开头表达感受 3）倾听对方的想法。`,
      `感情没有对错，只有合不合适。建议你：1）想清楚自己要什么 2）别委屈自己 3）如果实在不合适，勇敢放手。`
    ],
    // 家庭问题 - 给出具体建议
    family: [
      `家庭关系确实复杂。建议你：1）理解家人的出发点 2）但也坚持自己的底线 3）找个合适的时机好好沟通。`,
      `和父母有代沟？试着理解他们的出发点，但也坚持自己的底线。建议你：1）多倾听 2）少争辩 3）用行动证明自己的想法。`,
      `家里的事，有时候需要时间。别急，慢慢沟通。建议你：1）定期家庭聚会 2）主动关心家人 3）学会换位思考。`,
      `家人之间，有时候退一步不是认输，是珍惜。建议你：1）放下执念 2）关注感情本身 3）必要时寻求家庭咨询。`
    ],
    // 金钱问题 - 给出具体建议
    money: [
      `钱的问题确实让人焦虑。建议你：1）先理清收支情况 2）制定预算计划 3）减少不必要的开支。慢慢会好起来的。`,
      `经济压力大？建议你：1）列出所有债务 2）优先还高利息的 3）增加收入来源。一步步来，别着急。`,
      `没钱的时候最难，但这也是成长的机会。建议你：1）学习理财知识 2）培养赚钱技能 3）保持积极心态。`,
      `别拿自己和别人比。每个人节奏不同。建议你：1）专注于自己的目标 2）制定可行的计划 3）相信自己能改善现状。`
    ],
    // 健康问题 - 给出具体建议
    health: [
      `身体不舒服？建议你：1）先去看医生，别拖着 2）遵医嘱治疗 3）好好休息。健康是第一位的。`,
      `健康是第一位的。其他都可以放一放，先照顾好自己。建议你：1）规律作息 2）健康饮食 3）适量运动。`,
      `失眠？建议你：1）睡前1小时不看手机 2）试试冥想或深呼吸 3）实在不行就起来坐会儿，有困意再睡。`,
      `生病了就好好休息，别硬撑。建议你：1）按时吃药 2）多喝水 3）如果症状持续，及时就医。身体会告诉你需要什么。`
    ],
    // 未来迷茫 - 给出具体建议
    future: [
      `未来谁都说不准。但你可以决定现在做什么。建议你：1）设定短期目标 2）每天进步一点点 3）别想太远，先把眼前的事做好。`,
      `别想太远，先把眼前的事做好。路是一步步走出来的。建议你：1）列出想做的事 2）制定计划 3）立即行动。`,
      `梦想可以有，但也要脚踏实地。建议你：1）把大目标拆成小目标 2）设定时间节点 3）定期复盘调整。`,
      `人生没有白走的路，每一步都算数。建议你：1）接受不确定性 2）专注于当下 3）相信自己能创造未来。`
    ],
    // 自我认知 - 给出具体建议
    self: [
      `每个人都有自己的优缺点。建议你：1）接受不完美的自己 2）发挥自己的优势 3）慢慢改进不足。这才是成熟的开始。`,
      `自卑？建议你：1）想想你做成过的事 2）列出自己的优点 3）每天给自己积极的暗示。你能行，只是暂时没看到。`,
      `性格没有好坏，内向外向各有优势。建议你：1）做真实的自己 2）不要强行改变性格 3）找到适合自己的生活方式。`,
      `别总盯着自己的缺点。建议你：1）每天记录3件做得好的事 2）学会自我肯定 3）你身上有很多闪光点，只是你没发现。`
    ],
    // 打招呼
    greeting: [
      `嗨！我在呢。今天想聊点什么？有什么烦心事都可以跟我说。`,
      `你好啊～有什么想说的，尽管说。我在这儿听着。`,
      `在呢！看你来了，有什么心事吗？说说看，我帮你想想办法。`,
      `哈喽～我在这儿，你想聊什么都可以。工作、感情、生活，都可以聊。`
    ],
    // 通用回复（无法识别意图时）- 给出具体建议
    default: [
      `嗯，我听着呢。你继续说～把具体情况告诉我，我帮你想想办法。`,
      `我明白了。然后呢？多说一点，我才能给你更具体的建议。`,
      `嗯嗯，我在。你想说什么都可以。如果不知道从哪说起，可以先说说最让你困扰的是什么。`,
      `我懂你的感受。慢慢说，我认真听着。等你说完了，咱们一起想办法。`,
      `这事儿确实值得想想。你是怎么考虑的？说说你的想法，我帮你分析分析。`,
      `嗯，我理解。换作是我，可能也会这样想。不过，有没有想过另一种可能？`,
      `嗯嗯，继续。我在这儿陪着你。说完了，咱们一起找解决方案。`
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
  
  // 从对应意图的回复库中随机选择（避免重复）
  const replies = replyDB[intentKey] || replyDB.default;
  
  // 过滤掉最近使用过的回复
  const availableReplies = replies.filter(r => !recentReplies.includes(r));
  
  let selectedReply;
  if(availableReplies.length > 0) {
    // 从可用回复中随机选择
    selectedReply = availableReplies[Math.floor(Math.random() * availableReplies.length)];
  } else {
    // 如果所有回复都用过了，清空历史记录，重新选择
    recentReplies = [];
    selectedReply = replies[Math.floor(Math.random() * replies.length)];
  }
  
  // 记录到最近使用的回复
  recentReplies.push(selectedReply);
  if(recentReplies.length > MAX_RECENT_REPLIES) {
    recentReplies.shift(); // 移除最旧的
  }
  
  return selectedReply;
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
