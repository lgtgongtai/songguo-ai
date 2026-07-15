// ===== Compliance Module =====
// Handles: age verification, usage timer, crisis detection, legal pages, data management

// ===== Usage Timer =====
let usageStartTime = Date.now();
let restReminderShown = false;
const REST_REMINDER_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

// ===== Crisis Keyword =====
const crisisKeywords = ['自杀','自残','不想活','想死','去死','活着没意思','没有意义','结束生命','跳楼','割腕','了结','解脱','没人会在意','世界没有我会更好','拖累','负担'];

// ===== Init Compliance =====
function initCompliance() {
  const hasAgreed = localStorage.getItem('songguo_agreed');
  if(hasAgreed) {
    usageStartTime = Date.now();
    startUsageTimer();
    return;
  }
  document.getElementById('welcome-modal').classList.add('show');
}

function acceptWelcome() {
  const ageConfirm = document.getElementById('age-confirm');
  const termsAgree = document.getElementById('terms-agree');
  
  if(!ageConfirm.checked) {
    alert('请确认您已满18周岁');
    return;
  }
  if(!termsAgree.checked) {
    alert('请阅读并同意用户协议和隐私政策');
    return;
  }
  
  localStorage.setItem('songguo_agreed', 'true');
  localStorage.setItem('songguo_first_visit', Date.now().toString());
  usageStartTime = Date.now();
  startUsageTimer();
  document.getElementById('welcome-modal').classList.remove('show');
}

// ===== Usage Timer =====
function startUsageTimer() {
  setInterval(() => {
    const elapsed = Date.now() - usageStartTime;
    if(elapsed >= REST_REMINDER_INTERVAL && !restReminderShown) { showAddictionModal(); }
  }, 60000);
}

function showAddictionModal() {
  restReminderShown = true;
  document.getElementById('addiction-modal').classList.add('show');
}

function closeAddictionModal() {
  document.getElementById('addiction-modal').classList.remove('show');
  usageStartTime = Date.now();
  restReminderShown = false;
}

// ===== Crisis Detection =====
function checkCrisisKeywords(text) {
  const lowerText = text.toLowerCase();
  for(const keyword of crisisKeywords) {
    if(lowerText.includes(keyword.toLowerCase())) return true;
  }
  return false;
}

let crisisShownThisSession = false;
function showCrisisModal() {
  if(crisisShownThisSession) return;
  crisisShownThisSession = true;
  document.getElementById('crisis-modal').classList.add('show');
}
function closeCrisisModal() { document.getElementById('crisis-modal').classList.remove('show'); }

// ===== Legal Pages =====
function showLegalPage(type) {
  const modal = document.getElementById('legal-modal');
  const title = document.getElementById('legal-title');
  const body = document.getElementById('legal-body');
  
  if(type === 'terms') {
    title.textContent = '用户协议';
    body.innerHTML = `
      <h3>松果AI用户协议</h3>
      <p>欢迎使用松果AI角色扮演解压互动游戏平台。</p>
      <h4>1. 服务说明</h4>
      <p>松果AI提供AI角色扮演解压互动服务，不是心理咨询的替代品，不参与任何医疗诊断的最终决策。</p>
      <h4>2. 用户责任</h4>
      <p>用户应确保已满18周岁，或在监护人指导下使用。用户应遵守相关法律法规，不得利用本服务从事违法活动。</p>
      <h4>3. 隐私保护</h4>
      <p>我们重视用户隐私，对话内容去标识化存储，详见隐私政策。</p>
      <h4>4. 免责声明</h4>
      <p>本服务由AI提供，内容仅供参考。如有严重心理问题，请咨询专业心理咨询师。</p>
    `;
  } else if(type === 'privacy') {
    title.textContent = '隐私政策';
    body.innerHTML = `
      <h3>松果AI隐私政策</h3>
      <p>我们重视您的隐私保护。</p>
      <h4>1. 信息收集</h4>
      <p>我们收集对话内容用于提供服务和改进产品，对话内容去标识化存储。</p>
      <h4>2. 信息使用</h4>
      <p>您的对话内容仅用于提供解压服务和生成松劲报告，不会用于其他商业目的。</p>
      <h4>3. 信息保护</h4>
      <p>我们采用加密存储和访问控制，保护您的对话内容安全。</p>
      <h4>4. 信息共享</h4>
      <p>除法律要求外，我们不会向第三方共享您的个人信息。</p>
      <h4>5. 您的权利</h4>
      <p>您可以随时查看、复制或删除您的对话记录。</p>
    `;
  }
  
  modal.classList.add('show');
}

function closeLegalPage() {
  document.getElementById('legal-modal').classList.remove('show');
}

// ===== Data Management =====
function copyChatRecords() {
  const messages = document.getElementById('chat-messages');
  const rows = messages.querySelectorAll('.msg-row');
  let text = '松果AI 对话记录\n';
  text += '导出时间：' + new Date().toLocaleString() + '\n';
  text += '================================\n\n';
  rows.forEach(row => {
    const isUser = row.classList.contains('user');
    const bubble = row.querySelector('.msg-bubble');
    if(bubble) text += (isUser ? '我：' : '松果：') + bubble.textContent + '\n\n';
  });
  if(navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => alert('对话记录已复制到剪贴板')).catch(() => fallbackCopy(text));
  } else { fallbackCopy(text); }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); alert('对话记录已复制到剪贴板'); } catch(e) { alert('复制失败，请手动选择复制'); }
  document.body.removeChild(ta);
}

function clearChatRecords() {
  if(!confirm('确定要清空所有对话记录吗？此操作不可恢复。')) return;
  localStorage.removeItem('songguo_chat_history');
  document.getElementById('chat-messages').innerHTML = '';
  sessionId = null; currentRole = '松果'; messageCount = 0;
  alert('对话记录已清空');
}

// ===== Logout =====
function logout() {
  if(!confirm('确定要退出登录吗？')) return;
  localStorage.removeItem('songguo_agreed');
  location.reload();
}

export { checkCrisisKeywords };
