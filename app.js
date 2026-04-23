/**
 * 恋爱记录网站 - 主逻辑
 * Love Journal App.js
 */

/* =============================================
   数据存储（localStorage）
   ============================================= */
const STORAGE_KEY = 'love_journal_data';

const defaultData = {
  password: '2025',         // 暗号密码
  nameA: '你',
  nameB: 'TA',
  anniversaryDate: '',         // 格式 'YYYY-MM-DD'
  diaries: [],                 // 初始空，启动时从 diaries.json 加载
  wishes: [
    { id: 'w1', text: '一起去看一次极光 🌌', done: false },
    { id: 'w2', text: '一起吃遍10家网红餐厅 🍜', done: false },
    { id: 'w3', text: '一起拍一组情侣照 📸', done: true },
    { id: 'w4', text: '一起看日出 🌅', done: false },
    { id: 'w5', text: '一起养一盆花 🌷', done: true },
  ],
  didaToken: '',
  didaProjectId: '',
  theme: 'light',
  unlocked: false,
};

async function loadData() {
  // 同步加载 localStorage
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {}

  const base = { ...defaultData };
  if (stored) {
    Object.assign(base, stored);
  }

  // 异步加载 diaries.json（真实日记数据）
  try {
    const resp = await fetch('diaries.json?t=' + Date.now());
    if (resp.ok) {
      const json = await resp.json();
      // 合并：diaries.json 优先级更高（最新数据）
      base.diaries = json;
    }
  } catch {}

  return base;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = null;

/* =============================================
   主题切换
   ============================================= */
function initTheme() {
  const theme = appData.theme || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  appData.theme = next;
  saveData(appData);
});

/* =============================================
   密码解锁
   ============================================= */
function tryUnlock() {
  const input = document.getElementById('password-input');
  const hint  = document.getElementById('lock-hint');
  const val   = input.value.trim();

  if (!val) {
    hint.textContent = '暗号不能为空哦 💕';
    shakeInput(input);
    return;
  }

  if (val === (appData.password || defaultData.password)) {
    const lockScreen = document.getElementById('lock-screen');
    const mainSite   = document.getElementById('main-site');

    lockScreen.classList.add('fade-out');
    setTimeout(() => {
      lockScreen.style.display = 'none';
      mainSite.classList.remove('hidden');
      mainSite.classList.add('show');
      initMainSite();
    }, 600);
  } else {
    hint.textContent = '暗号好像不对，再想想 💭';
    shakeInput(input);
    input.value = '';
    setTimeout(() => { hint.textContent = ''; }, 3000);
  }
}

function shakeInput(el) {
  el.style.animation = 'none';
  el.style.borderColor = '#ef4444';
  el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.2)';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  }, 1500);
}

// 回车键解锁
document.getElementById('password-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryUnlock();
});

/* =============================================
   主站初始化
   ============================================= */
function initMainSite() {
  // 首次使用弹设置面板
  if (!appData.anniversaryDate && !appData._settingsDone) {
    setTimeout(() => openSettings(), 800);
  }

  initTimer();
  initAnniversaries();
  renderDiaries();
  renderWishes();
  initNavScroll();
  initMobileMenu();
}

/* =============================================
   恋爱计时器
   ============================================= */
let timerInterval = null;

function initTimer() {
  if (appData.anniversaryDate) {
    startTimer(appData.anniversaryDate);
  } else {
    // 占位显示
    document.getElementById('timer-days').textContent = '---';
    document.getElementById('timer-hours').textContent = '--';
    document.getElementById('timer-mins').textContent = '--';
    document.getElementById('timer-secs').textContent = '--';
    document.getElementById('timer-since').textContent = '请先在设置里填写纪念日 ⚙️';
  }
}

function startTimer(dateStr) {
  if (timerInterval) clearInterval(timerInterval);

  const start = new Date(dateStr + 'T00:00:00');

  function update() {
    const now   = new Date();
    const diff  = now - start;
    if (diff < 0) {
      document.getElementById('timer-since').textContent = '你们的纪念日还没到呢 💕';
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    document.getElementById('timer-days').textContent  = String(days).padStart(3, '0');
    document.getElementById('timer-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('timer-mins').textContent  = String(mins).padStart(2, '0');
    document.getElementById('timer-secs').textContent  = String(secs).padStart(2, '0');

    const formatted = `${start.getFullYear()}年${start.getMonth()+1}月${start.getDate()}日`;
    document.getElementById('timer-since').textContent = `自 ${formatted} 起 💕`;
  }

  update();
  timerInterval = setInterval(update, 1000);
}

/* =============================================
   纪念日倒计时
   ============================================= */
function initAnniversaries() {
  const list = document.getElementById('anniversaries-list');
  list.innerHTML = '';

  if (!appData.anniversaryDate) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;text-align:center">设置纪念日后自动生成倒计时 ✨</p>';
    return;
  }

  const origin  = new Date(appData.anniversaryDate + 'T00:00:00');
  const now     = new Date();
  const nowYear = now.getFullYear();

  const milestones = [];

  // 每年纪念日
  for (let y = nowYear; y <= nowYear + 1; y++) {
    const d = new Date(y, origin.getMonth(), origin.getDate());
    if (d > now) {
      const diff = Math.ceil((d - now) / 86400000);
      milestones.push({ name: `${y}周年纪念日 🎂`, days: diff });
    }
  }

  // 整百天
  const totalDays = Math.floor((now - origin) / 86400000);
  const nextHundred = Math.ceil((totalDays + 1) / 100) * 100;
  const nextHundredDate = new Date(origin.getTime() + nextHundred * 86400000);
  const diffH = Math.ceil((nextHundredDate - now) / 86400000);
  if (diffH > 0 && diffH <= 365) {
    milestones.push({ name: `在一起第 ${nextHundred} 天 🎉`, days: diffH });
  }

  // 情人节、七夕
  const festivals = [
    { name: '情人节 💘',  month: 1,  day: 14 },
    { name: '白色情人节 🤍', month: 2, day: 14 },
    { name: '七夕 🥢',    month: 6,  day: 7 },
    { name: '圣诞节 🎄',  month: 11, day: 25 },
  ];
  for (const f of festivals) {
    let d = new Date(nowYear, f.month, f.day);
    if (d <= now) d = new Date(nowYear + 1, f.month, f.day);
    const diff = Math.ceil((d - now) / 86400000);
    if (diff <= 180) milestones.push({ name: f.name, days: diff });
  }

  milestones.sort((a, b) => a.days - b.days);
  milestones.slice(0, 4).forEach(m => {
    const el = document.createElement('div');
    el.className = 'anniversary-item';
    el.innerHTML = `
      <span class="anniversary-name">${m.name}</span>
      <span class="anniversary-countdown">${m.days === 0 ? '就是今天！🎊' : `还有 ${m.days} 天`}</span>
    `;
    list.appendChild(el);
  });

  if (milestones.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;text-align:center">每天都是最好的纪念日 💕</p>';
  }
}

/* =============================================
   日记渲染
   ============================================= */
function renderDiaries() {
  const grid = document.getElementById('diary-grid');
  grid.innerHTML = '';

  if (!appData.diaries || appData.diaries.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px">还没有日记，快去写第一篇吧 💌</p>';
    return;
  }

  const sorted = [...appData.diaries].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((diary, idx) => {
    const dateObj = new Date(diary.date + 'T00:00:00');
    const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth()+1}月${dateObj.getDate()}日`;

    const article = document.createElement('article');
    article.className = 'diary-card';
    article.dataset.index = idx;
    article.innerHTML = `
      <div class="diary-card-inner">
        <div class="diary-meta">
          <span class="diary-date">${dateStr}</span>
          <span class="diary-tag">${diary.tag || '💌'}</span>
        </div>
        <h3 class="diary-title">${escapeHtml(diary.title)}</h3>
        <p class="diary-excerpt">${escapeHtml(diary.content.slice(0, 100))}${diary.content.length > 100 ? '…' : ''}</p>
        <button class="diary-read-more">读全文 →</button>
      </div>
    `;
    article.querySelector('.diary-read-more').addEventListener('click', () => openDiaryById(diary.id));
    article.addEventListener('click', () => openDiaryById(diary.id));
    grid.appendChild(article);
  });
}

/* =============================================
   日记弹窗
   ============================================= */
function openDiaryById(id) {
  const diary = appData.diaries.find(d => d.id === id);
  if (!diary) return;

  const dateObj = new Date(diary.date + 'T00:00:00');
  const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth()+1}月${dateObj.getDate()}日`;

  document.getElementById('modal-meta').textContent = `${dateStr}  ${diary.tag || '💌'}`;
  document.getElementById('modal-title').textContent = diary.title;
  document.getElementById('modal-body').textContent  = diary.content;

  document.getElementById('diary-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// 兼容 HTML 的 onclick
window.openDiary = function(btn) {
  const card = btn.closest('.diary-card');
  if (!card) return;
  const idx = parseInt(card.dataset.index);
  if (!isNaN(idx)) {
    const sorted = [...appData.diaries].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sorted[idx]) openDiaryById(sorted[idx].id);
  }
};

function closeDiaryModal(event) {
  if (event && event.target !== document.getElementById('diary-modal') && !event.target.closest('.modal-close')) return;
  document.getElementById('diary-modal').classList.remove('open');
  document.body.style.overflow = '';
}
window.closeDiaryModal = closeDiaryModal;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDiaryModal({ target: document.getElementById('diary-modal') });
    document.getElementById('settings-overlay').classList.add('hidden');
  }
});

/* =============================================
   心愿清单
   ============================================= */
function renderWishes() {
  const list = document.getElementById('wishes-list');
  list.innerHTML = '';

  appData.wishes.forEach((wish, i) => {
    const li = document.createElement('li');
    li.className = `wish-item${wish.done ? ' done' : ''}`;
    li.innerHTML = `
      <div class="wish-checkbox${wish.done ? ' checked' : ''}" onclick="toggleWish(${i})"></div>
      <span class="wish-text">${escapeHtml(wish.text)}</span>
      <button class="wish-delete" onclick="deleteWish(${i}, event)">×</button>
    `;
    list.appendChild(li);
  });

  updateWishProgress();
}

function updateWishProgress() {
  const total = appData.wishes.length;
  const done  = appData.wishes.filter(w => w.done).length;
  document.getElementById('wishes-done-count').textContent  = done;
  document.getElementById('wishes-total-count').textContent = total;
  const pct = total > 0 ? (done / total) * 100 : 0;
  document.getElementById('wishes-progress-fill').style.width = pct + '%';
}

window.toggleWish = function(i) {
  appData.wishes[i].done = !appData.wishes[i].done;
  saveData(appData);
  renderWishes();
};

window.deleteWish = function(i, event) {
  event.stopPropagation();
  appData.wishes.splice(i, 1);
  saveData(appData);
  renderWishes();
};

window.addWish = function() {
  const input = document.getElementById('wish-input');
  const text  = input.value.trim();
  if (!text) return;

  appData.wishes.push({
    id: 'w' + Date.now(),
    text,
    done: false,
  });
  saveData(appData);
  renderWishes();
  input.value = '';
  input.focus();
};

document.getElementById('wish-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.addWish();
});

/* =============================================
   滴答清单同步
   ============================================= */
window.syncFromDida = async function() {
  const token     = appData.didaToken;
  const projectId = appData.didaProjectId;

  if (!token) {
    updateSyncStatus('请先在设置里填写滴答清单 Token ⚙️', 'warn');
    openSettings();
    return;
  }
  if (!projectId) {
    updateSyncStatus('请先在设置里填写清单 ID ⚙️', 'warn');
    openSettings();
    return;
  }

  updateSyncStatus('同步中…', 'loading');

  try {
    // 滴答清单 Open API：获取项目下的任务
    const resp = await fetch(`https://api.dida365.com/open/v1/project/${projectId}/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      throw new Error(`API 返回 ${resp.status}：${resp.statusText}`);
    }

    const data  = await resp.json();
    const tasks = data.tasks || [];

    if (tasks.length === 0) {
      updateSyncStatus('该清单暂无任务', 'warn');
      return;
    }

    // 将任务转换为日记格式
    let added = 0;
    tasks.forEach(task => {
      const existing = appData.diaries.find(d => d.id === `dida-${task.id}`);
      if (!existing) {
        const content = task.content || task.desc || task.title || '（无内容）';
        const rawDate = task.modifiedTime || task.createdTime || new Date().toISOString();
        const dateStr = rawDate.slice(0, 10);

        appData.diaries.push({
          id:      `dida-${task.id}`,
          date:    dateStr,
          title:   task.title || '来自滴答清单',
          tag:     '📝',
          content: content,
          source:  'dida',
        });
        added++;
      }
    });

    saveData(appData);
    renderDiaries();
    updateSyncStatus(`✅ 同步成功，新增 ${added} 篇`, 'ok');
  } catch (err) {
    console.error('同步失败', err);
    updateSyncStatus(`同步失败：${err.message}`, 'err');
  }
};

function updateSyncStatus(msg, type) {
  const el = document.getElementById('sync-status-text');
  el.textContent = msg;
  el.style.color = type === 'err'  ? '#ef4444'
                 : type === 'warn' ? '#f59e0b'
                 : type === 'ok'   ? '#10b981'
                 : 'var(--text-muted)';

  if (type === 'loading') {
    const icon = document.querySelector('.sync-icon');
    icon.style.animation = 'spin 1s linear infinite';
  } else {
    document.querySelector('.sync-icon').style.animation = '';
  }
}

/* =============================================
   设置面板
   ============================================= */
window.openSettings = function() {
  const overlay = document.getElementById('settings-overlay');
  overlay.classList.remove('hidden');

  // 填入当前值
  document.getElementById('name-a').value          = appData.nameA || '';
  document.getElementById('name-b').value          = appData.nameB || '';
  document.getElementById('anniversary-date').value = appData.anniversaryDate || '';
  document.getElementById('new-password').value    = '';
  document.getElementById('dida-token').value      = appData.didaToken || '';
  document.getElementById('dida-project-id').value = appData.didaProjectId || '';
};

window.saveSettings = function() {
  const newPwd   = document.getElementById('new-password').value.trim();
  const nameA    = document.getElementById('name-a').value.trim();
  const nameB    = document.getElementById('name-b').value.trim();
  const annDate  = document.getElementById('anniversary-date').value;
  const token    = document.getElementById('dida-token').value.trim();
  const projId   = document.getElementById('dida-project-id').value.trim();

  if (newPwd) appData.password = newPwd;
  if (nameA)  appData.nameA   = nameA;
  if (nameB)  appData.nameB   = nameB;
  if (annDate) appData.anniversaryDate = annDate;
  appData.didaToken     = token;
  appData.didaProjectId = projId;
  appData._settingsDone = true;

  saveData(appData);

  // 重新初始化计时器和纪念日
  if (timerInterval) clearInterval(timerInterval);
  initTimer();
  initAnniversaries();

  document.getElementById('settings-overlay').classList.add('hidden');

  // 更新 nav 标题
  if (nameA && nameB) {
    document.querySelector('.nav-logo span:last-child').textContent = `${nameA} & ${nameB}`;
  }

  showToast('设置已保存 ✨');
};

/* =============================================
   Toast 提示
   ============================================= */
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:80px; left:50%; transform:translateX(-50%) translateY(0);
    background: linear-gradient(135deg,#C4A8A2,#D4B5B5);
    color:white; padding:12px 24px; border-radius:50px;
    font-size:0.9rem; z-index:9999; box-shadow:0 8px 24px rgba(196,168,162,0.4);
    animation:toastIn 0.4s cubic-bezier(0.16,1,0.3,1);
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* =============================================
   导航滚动 & 激活
   ============================================= */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);

    // 激活对应导航项
    const sections = ['home', 'diary', 'album', 'wishes'];
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.section === current);
    });
  });
}

/* =============================================
   移动菜单
   ============================================= */
function initMobileMenu() {
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('open');
  });
}

window.closeMobileMenu = function() {
  document.getElementById('mobile-menu').classList.remove('open');
};

/* =============================================
   照片上传（拖拽 / 点击）
   ============================================= */
function initAlbum() {
  document.querySelectorAll('.album-item').forEach(item => {
    item.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          let img = item.querySelector('img');
          if (!img) {
            img = document.createElement('img');
            item.insertBefore(img, item.firstChild);
            item.querySelector('.album-placeholder').style.display = 'none';
          }
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });

    // 拖拽
    item.addEventListener('dragover', (e) => { e.preventDefault(); item.style.outline = '2px dashed var(--accent)'; });
    item.addEventListener('dragleave', () => { item.style.outline = ''; });
    item.addEventListener('drop', (e) => {
      e.preventDefault(); item.style.outline = '';
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        let img = item.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          item.insertBefore(img, item.firstChild);
          item.querySelector('.album-placeholder').style.display = 'none';
        }
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  });
}

/* =============================================
   工具函数
   ============================================= */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* =============================================
   启动（用 IIFE 包装以便使用 async/await）
   ============================================= */
(async () => {
  appData = await loadData();

  initTheme();               // 等 appData 加载完再初始化主题
  initAlbum();
})();
