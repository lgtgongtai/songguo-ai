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
  } else {
    tabBar.style.display = 'flex';
    document.querySelectorAll('.tab-bar-item')[['home','records','my'].indexOf(tab)].classList.add('active');
  }
  if(tab === 'my') setTimeout(animateDimensions, 300);
  if(tab === 'records') renderRecords();
}

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
  {scene:'吐槽大会',emoji:'🔥',date:'今天 14:30',dims:['情绪识别 4','共情接纳 5','压力释放 5','放松深度 3','自我觉察 2'],gains:'把对甲方的火气全倒出来了，骂完真的舒服多了',action:'今晚做个小事：喝杯温水，伸个懒腰'},
  {scene:'治愈聊天',emoji:'🌿',date:'昨天 22:15',dims:['情绪识别 5','共情接纳 5','压力释放 3','放松深度 4','自我觉察 3'],gains:'原来累是说不清的，但有人陪着就不那么怕了',action:'今晚早点睡，明天又是新的一天'},
  {scene:'吵架模拟器',emoji:'💢',date:'3天前',dims:['情绪识别 4','共情接纳 4','压力释放 5','放松深度 3','自我觉察 3'],gains:'把憋了很久的话说出来了，发现说出来也没那么可怕',action:'下次遇到类似情况，试试直接表达'},
  {scene:'安全宣泄',emoji:'🕳',date:'1周前',dims:['情绪识别 3','共情接纳 4','压力释放 5','放松深度 2','自我觉察 2'],gains:'什么都不用想，把情绪倒空就好',action:'允许自己有情绪，不用急着好起来'},
  {scene:'复盘引导',emoji:'🧭',date:'2周前',dims:['情绪识别 4','共情接纳 4','压力释放 2','放松深度 2','自我觉察 5'],gains:'原来我一直在意的是被认可，不是事情本身',action:'下次焦虑时，问问自己真正在意的是什么'},
  {scene:'放松舱',emoji:'🫧',date:'2周前',dims:['情绪识别 3','共情接纳 4','压力释放 2','放松深度 5','自我觉察 1'],gains:'跟着呼吸慢慢放松，身体真的轻了',action:'睡前做一次呼吸练习'}
];

function renderRecords() {
  const container = document.getElementById('records-list');
  if(!container) return;
  container.innerHTML = mockRecords.map(r => '<div class="record-card"><div class="record-card-header"><div class="record-card-scene"><div class="record-card-scene-icon">' + r.emoji + '</div><div class="record-card-scene-name">' + r.scene + '</div></div><div class="record-card-date">' + r.date + '</div></div><div class="record-card-dimensions">' + r.dims.map(d => '<span class="record-dim">' + d + '</span>').join('') + '</div><div class="record-card-gains"><strong>新看见：</strong>' + r.gains + '</div><div class="record-card-action">💡 ' + r.action + '</div></div>').join('');
}

// ===== Scene Modal =====
function openSceneModal(scene) {
  document.getElementById('modal-title').textContent = scene.id;
  document.getElementById('modal-body').innerHTML = '<div class="scene-meta"><span>🎭 ' + scene.name + '</span><span>难度 ' + scene.difficulty + '</span><span>💬 ' + scene.rounds + '</span><span>' + (scene.tag === '免费' ? '🆓 免费' : '💎 ' + scene.tag) + '</span></div><p>' + scene.detail + '</p><p style="font-size:13px;color:var(--brown);background:var(--cream);padding:10px 14px;border-radius:10px;margin-top:8px">💬 开场白：「' + scene.opening + '」</p><button class="scene-modal-start" onclick="startScene(\'' + scene.id + '\')">开始对话</button>';
  document.getElementById('scene-modal').classList.add('show');
}
function closeModal() { document.getElementById('scene-modal').classList.remove('show'); }
function startScene(sceneId) { closeModal(); selectScene(sceneId); }

// ===== Initialization =====
renderDimensions();
initCompliance();

document.getElementById('scene-modal').addEventListener('click', function(e) { if(e.target === this) closeModal(); });
document.getElementById('chat-input').addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 100) + 'px'; });
