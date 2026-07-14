// ===== Compliance Module =====
// Handles: age verification, usage timer, crisis detection, legal pages, data management

// ===== Usage Timer =====
let usageStartTime = Date.now();
let restReminderShown = false;
const REST_REMINDER_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

// ===== Crisis Keywords =====
const crisisKeywords = ['自杀','自残','不想活','想死','去死','活着没意思','没有意义','结束生命','跳楼','割腕','了结','解脱','没人会在意','世界没有我会更好','拖累','负担'];

// ===== Init Compliance =====
function initCompliance() {
  const select = document.getElementById('birth-year-select');
  const currentYear = new Date().getFullYear();
  for(let y = currentYear - 18; y >= currentYear - 100; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y + '年';
    select.appendChild(opt);
  }
  select.addEventListener('change', checkWelcomeReady);
  
  const hasAgreed = localStorage.getItem('songguo_agreed');
  if(hasAgreed) {
    usageStartTime = Date.now();
    startUsageTimer();
    return;
  }
  document.getElementById('welcome-modal').classList.add('show');
}

function toggleAgreement() {
  document.getElementById('agreement-checkbox').classList.toggle('checked');
  checkWelcomeReady();
}

function checkWelcomeReady() {
  const year = document.getElementById('birth-year-select').value;
  const agreed = document.getElementById('agreement-checkbox').classList.contains('checked');
  const btn = document.getElementById('welcome-enter-btn');
  if(year && agreed) { btn.classList.remove('disabled'); } else { btn.classList.add('disabled'); }
}

function enterApp() {
  const btn = document.getElementById('welcome-enter-btn');
  if(btn.classList.contains('disabled')) return;
  const year = parseInt(document.getElementById('birth-year-select').value);
  const age = new Date().getFullYear() - year;
  if(age < 18) {
    document.getElementById('welcome-modal').classList.remove('show');
    document.getElementById('minor-modal').classList.add('show');
    return;
  }
  localStorage.setItem('songguo_agreed', 'true');
  localStorage.setItem('songguo_birth_year', year.toString());
  localStorage.setItem('songguo_first_visit', Date.now().toString());
  usageStartTime = Date.now();
  startUsageTimer();
  document.getElementById('welcome-modal').classList.remove('show');
}

function closeMinorModal() {
  document.getElementById('minor-modal').classList.remove('show');
}

// ===== Usage Timer =====
function startUsageTimer() {
  setInterval(() => {
    const elapsed = Date.now() - usageStartTime;
    if(elapsed >= REST_REMINDER_INTERVAL && !restReminderShown) { showRestReminder(); }
  }, 60000);
}

function showRestReminder() {
  restReminderShown = true;
  const hours = Math.floor((Date.now() - usageStartTime) / (60 * 60 * 1000));
  document.getElementById('rest-hours').textContent = hours;
  document.getElementById('rest-modal').classList.add('show');
  let countdown = 30;
  const timerEl = document.getElementById('rest-timer');
  const interval = setInterval(() => {
    countdown--;
    timerEl.textContent = countdown + '秒后自动关闭';
    if(countdown <= 0) { clearInterval(interval); closeRestModal(); }
  }, 1000);
}

function closeRestModal() {
  document.getElementById('rest-modal').classList.remove('show');
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
  if(type === 'terms') document.getElementById('terms-page').classList.add('show');
  else if(type === 'privacy') document.getElementById('privacy-page').classList.add('show');
}
function closeLegalPage() {
  document.getElementById('terms-page').classList.remove('show');
  document.getElementById('privacy-page').classList.remove('show');
}

// ===== Data Management =====
function exportChatData() {
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

function deleteAllData() { document.getElementById('delete-modal').classList.add('show'); }
function closeDeleteModal() { document.getElementById('delete-modal').classList.remove('show'); }

function confirmDeleteAll() {
  localStorage.clear();
  document.getElementById('chat-messages').innerHTML = '';
  sessionId = null; currentRole = '松果'; messageCount = 0;
  closeDeleteModal();
  alert('所有数据已删除');
  document.getElementById('welcome-modal').classList.add('show');
  document.getElementById('agreement-checkbox').classList.remove('checked');
  document.getElementById('birth-year-select').value = '';
  checkWelcomeReady();
}

// ===== Exit =====
function showExitConfirm() { document.getElementById('exit-modal').classList.add('show'); }
function closeExitModal() { document.getElementById('exit-modal').classList.remove('show'); }
function confirmExit() {
  localStorage.removeItem('songguo_agreed');
  closeExitModal();
  document.getElementById('welcome-modal').classList.add('show');
  document.getElementById('agreement-checkbox').classList.remove('checked');
  document.getElementById('birth-year-select').value = '';
  checkWelcomeReady();
}
