// ===== App Module =====
// Main entry: tab switching, home page, dimensions, records, initialization

// ===== Tab Switching =====
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-bar-item').forEach(el => el.classList.remove('active'));
  document.getElementById(tab + '-tab').classList.add('active');
  const tabBar = document.querySelector('.tab-bar');
  if(tab === 'chat') {
    tabBar.style.display = 'none';
    document.body.classList.add('chat-active');
  } else {
    tabBar.style.display = 'flex';
    document.body.classList.remove('chat-active');
    document.querySelectorAll('.tab-bar-item')[['home','records','my'].indexOf(tab)].classList.add('active');
  }
  if(tab === 'my') setTimeout(animateDimensions, 300);
  if(tab === 'records') renderRecords();
}

// ===== 松松客服引导话术 =====
const songSongGuides = {
  opening: '嗨，我是松松，你的解压向导~ ️\n\n我可以帮你：\n\n🔥 <b>情绪解压</b>\n• 吐槽大会（免费）— 找个AI一起痛快吐槽\n• 治愈聊天（会员）— 温柔陪伴，被接住的感觉\n• 吵架模拟器（会员）— 把憋着的话甩出来\n• 树洞（会员）— 什么都可以说，说完就删\n• 人生模拟器（免费）— 如果人生可以重来\n\n👥 <b>社交训练</b>\n• 约会模拟（会员）— 练完更敢去爱\n• 聚会破冰（会员）— 再也不怕尴尬\n• 冲突处理（会员）— 学会化解冲突\n• 演讲陪练（会员）— 上台不再腿软\n• 面试轻松版（会员）— 面试不再紧张\n\n👨‍👩‍👧 <b>亲子互动</b>\n• 亲子对话（会员）— 和孩子好好说话\n• 冒险故事（免费）— 一起创造冒险\n• 家庭桌游（会员）— 全家一起玩\n• 作业伙伴（会员）— 陪孩子写作业\n• 睡前故事（免费）— 哄孩子入睡\n\n你想试试哪个？或者直接跟我说说你的心情~',
  
  recommend: {
    '生气': '听起来你现在有点火大~ 推荐你去<b>吐槽大会</b>发泄一下，或者去<b>吵架模拟器</b>把憋着的话甩出来！👇点击下方直接进入：',
    '累': '感觉你今天挺累的~ 推荐去<b>治愈聊天</b>让松果陪陪你，或者去<b>放松舱</b>做个深呼吸~ 👇点击下方直接进入：',
    '焦虑': '焦虑的时候，可以先去<b>放松舱</b>把呼吸慢下来，或者去<b>复盘引导</b>看看焦虑的来源~ 👇点击下方直接进入：',
    '难过': '难过的时候，去<b>治愈聊天</b>吧，松果会温柔地接住你~ 或者去<b>树洞</b>把情绪倒出来~ 👇点击下方直接进入：',
    '压力': '压力大的话，推荐<b>吐槽大会</b>先发泄一下，或者去<b>树洞</b>把压力倒出来~ 👇点击下方直接进入：',
    'default': '我理解你的感受~ 要不要试试我们的场景？👇点击下方直接进入：'
  },
  
  membership: {
    '会员': '这个场景需要<b>会员</b>才能使用哦~ 开通会员后可以无限使用所有会员场景，还能解锁更多专属功能！\n\n现在开通会员，立享：\n✅ 15大场景无限畅聊\n✅ 专属角色皮肤\n✅ 优先客服支持\n\n💰 会员价格：\n• 月卡：¥39\n• 年卡：¥299\n\n点击这里开通会员 →',
    'VIP': '这个场景需要<b>VIP</b>才能使用哦~ VIP是我们的最高等级，包含所有会员权益，还能解锁：\n\n✅ 深度情绪分析\n✅ 专属心理报告\n✅ 1对1专家咨询\n\n💎 VIP价格：\n• 月卡：¥69\n• 年卡：¥599\n\n点击这里开通VIP →'
  },
  
  fallback: ['我理解你的感受~ 要不要选一个场景聊聊？', '听起来你今天有些心事，选个场景跟我说说吧~', '没关系，慢慢来。选一个场景，我们开始解压~', '我在听呢~ 选一个场景，让我更好地帮助你~']
};

// ===== Home Page Functions =====
function enterScene(sceneId) {
  const scene = scenes.find(s => s.id === sceneId);
  if(!scene) return;
  currentRole = scene.name;
  sessionId = null;
  messageCount = 0;
  document.getElementById('chat-role-name').textContent = scene.name;
  document.getElementById('chat-role-status').textContent = scene.desc;
  document.getElementById('chat-avatar').textContent = scene.emoji;
  document.getElementById('chat-messages').innerHTML = '';
  switchTab('chat');
  setTimeout(() => {
    showTyping();
    setTimeout(() => { removeTyping(); addMessage(scene.opening, false); }, 600);
  }, 300);
}

function chatWithSongSong() {
  currentRole = '松松';
  sessionId = null;
  messageCount = 0;
  document.getElementById('chat-role-name').textContent = '松松';
  document.getElementById('chat-role-status').textContent = '系统客服 · 在线';
  document.getElementById('chat-avatar').textContent = '🐿';
  document.getElementById('chat-messages').innerHTML = '';
  switchTab('chat');
  setTimeout(() => {
    showTyping();
    setTimeout(() => { removeTyping(); addMessage(songSongGuides.opening, false); }, 600);
  }, 300);
}

function backToHome() { switchTab('home'); }

// ===== Dimensions =====
function renderDimensions() {
  const container = document.getElementById('dimensions');
  container.innerHTML = '';
  dimensions.forEach(d => {
    const item = document.createElement('div');
    item.className = 'dim-item';
    item.innerHTML = '<div class="dim-item-header"><span>' + d.name + '</span><span>' + d.value + '%</span></div><div class="dim-bar"><div class="dim-bar-fill" data-width="' + d.value + '"></div></div>';
    container.appendChild(item);
  });
}

function animateDimensions() {
  document.querySelectorAll('.dim-bar-fill').forEach(el => { el.style.width = el.dataset.width + '%'; });
}

// ===== Records =====
const mockRecords = [
  {scene:'吐槽大会',emoji:'',date:'今天 14:30',dims:['情绪识别 4','共情接纳 5','压力释放 5','放松深度 3','自我觉察 2'],gains:'把对甲方的火气全倒出来了，骂完真的舒服多了',action:'今晚做个小事：喝杯温水，伸个懒腰'},
  {scene:'治愈聊天',emoji:'',date:'昨天 22:15',dims:['情绪识别 5','共情接纳 5','压力释放 3','放松深度 4','自我觉察 3'],gains:'原来累是说不清的，但有人陪着就不那么怕了',action:'今晚早点睡，明天又是新的一天'},
  {scene:'吵架模拟器',emoji:'💢',date:'3天前',dims:['情绪识别 4','共情接纳 4','压力释放 5','放松深度 3','自我觉察 3'],gains:'把憋了很久的话说出来了，发现说出来也没那么可怕',action:'下次遇到类似情况，试试直接表达'},
  {scene:'安全宣泄',emoji:'🕳',date:'1周前',dims:['情绪识别 3','共情接纳 4','压力释放 5','放松深度 2','自我觉察 2'],gains:'什么都不用想，把情绪倒空就好',action:'允许自己有情绪，不用急着好起来'},
  {scene:'复盘引导',emoji:'🧭',date:'2周前',dims:['情绪识别 4','共情接纳 4','压力释放 2','放松深度 2','自我觉察 5'],gains:'原来我一直在意的是被认可，不是事情本身',action:'下次焦虑时，问问自己真正在意的是什么'},
  {scene:'放松舱',emoji:'',date:'2周前',dims:['情绪识别 3','共情接纳 4','压力释放 2','放松深度 5','自我觉察 1'],gains:'跟着呼吸慢慢放松，身体真的轻了',action:'睡前做一次呼吸练习'}
];

function renderRecords() {
  const container = document.getElementById('records-list');
  if(!container) return;
  container.innerHTML = mockRecords.map(r => '<div class="record-card"><div class="record-card-header"><div class="record-card-scene"><div class="record-card-scene-icon">' + r.emoji + '</div><div class="record-card-scene-name">' + r.scene + '</div></div><div class="record-card-date">' + r.date + '</div></div><div class="record-card-dimensions">' + r.dims.map(d => '<span class="record-dim">' + d + '</span>').join('') + '</div><div class="record-card-gains"><strong>新看见：</strong>' + r.gains + '</div><div class="record-card-action">💡 ' + r.action + '</div></div>').join('');
}

// ===== Scene Modal =====
function openSceneModal(scene) {
  document.getElementById('modal-title').textContent = scene.id;
  document.getElementById('modal-body').innerHTML = '<div class="scene-meta"><span> ' + scene.name + '</span><span>难度 ' + scene.difficulty + '</span><span>💬 ' + scene.rounds + '</span><span>' + (scene.tag === '免费' ? ' 免费' : '💎 ' + scene.tag) + '</span></div><p>' + scene.detail + '</p><p style="font-size:13px;color:var(--brown);background:var(--cream);padding:10px 14px;border-radius:10px;margin-top:8px"> 开场白：「' + scene.opening + '」</p><button class="scene-modal-start" onclick="startScene(\'' + scene.id + '\')">开始对话</button>';
  document.getElementById('scene-modal').classList.add('show');
}
function closeModal() { document.getElementById('scene-modal').classList.remove('show'); }
function startScene(sceneId) { closeModal(); selectScene(sceneId); }

// ===== Initialization =====
renderDimensions();
initCompliance();

document.getElementById('scene-modal').addEventListener('click', function(e) { if(e.target === this) closeModal(); });
document.getElementById('chat-input').addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 100) + 'px'; });

// ===== Avatar Functions =====
let currentAvatar = localStorage.getItem('user_avatar') || 'user-default';

function selectAvatar(avatarName) {
  currentAvatar = avatarName;
  localStorage.setItem('user_avatar', avatarName);
  const userAvatarEl = document.getElementById('user-avatar');
  if(avatarName.startsWith('data:image')) {
    userAvatarEl.textContent = '';
    userAvatarEl.style.backgroundImage = 'url(' + avatarName + ')';
  } else {
    userAvatarEl.textContent = '';
    userAvatarEl.style.backgroundImage = 'url(assets/avatars/' + avatarName + '.svg)';
  }
  userAvatarEl.style.backgroundSize = 'cover';
  userAvatarEl.style.backgroundPosition = 'center';
  document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
  event.target.closest('.avatar-option').classList.add('selected');
}

function uploadAvatar(event) {
  const file = event.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')) {
    alert('请选择图片文件');
    return;
  }
  if(file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    currentAvatar = e.target.result;
    localStorage.setItem('user_avatar', currentAvatar);
    document.getElementById('user-avatar').textContent = '';
    document.getElementById('user-avatar').style.backgroundImage = 'url(' + currentAvatar + ')';
    document.getElementById('user-avatar').style.backgroundSize = 'cover';
    document.getElementById('user-avatar').style.backgroundPosition = 'center';
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
  };
  reader.readAsDataURL(file);
}

function showAvatarSelector() {
  const selector = document.getElementById('avatar-selector');
  selector.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Load saved avatar on init
if(currentAvatar) {
  if(currentAvatar.startsWith('data:image')) {
    document.getElementById('user-avatar').textContent = '';
    document.getElementById('user-avatar').style.backgroundImage = 'url(' + currentAvatar + ')';
    document.getElementById('user-avatar').style.backgroundSize = 'cover';
    document.getElementById('user-avatar').style.backgroundPosition = 'center';
  } else {
    document.getElementById('user-avatar').textContent = currentAvatar;
  }
}

// Expose avatar functions
window.selectAvatar = selectAvatar;
window.uploadAvatar = uploadAvatar;
window.showAvatarSelector = showAvatarSelector;

