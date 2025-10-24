
// pwa.js: high-contrast mode, text-size, offline queue
(function(){
  const root = document.documentElement;
  const settingsKey = 'cc_settings';
  const queueKey = 'cc_offline_queue_v1';

  function loadSettings(){
    try { return JSON.parse(localStorage.getItem(settingsKey)) || {}; } catch(e){ return {}; }
  }
  function saveSettings(s){ localStorage.setItem(settingsKey, JSON.stringify(s)); }
  function applySettings(){
    const s = loadSettings();
    root.dataset.contrast = s.highContrast ? 'high' : 'normal';
    root.style.setProperty('--base-font-scale', (s.fontScale || 1).toString());
  }

  function addSettingsUI(){
    const bar = document.createElement('div');
    bar.className = 'uxbar';
    bar.innerHTML = `
      <button class="btn tiny" id="toggle-contrast" aria-pressed="false">A11y</button>
      <button class="btn tiny" id="increase-text" aria-label="Increase text size">A+</button>
      <button class="btn tiny" id="decrease-text" aria-label="Decrease text size">A-</button>
    `;
    document.body.appendChild(bar);
    const s = loadSettings();
    const toggle = bar.querySelector('#toggle-contrast');
    toggle.setAttribute('aria-pressed', !!s.highContrast);
    toggle.addEventListener('click', ()=>{
      const s = loadSettings(); s.highContrast = !s.highContrast; saveSettings(s); applySettings();
      toggle.setAttribute('aria-pressed', s.highContrast);
    });
    bar.querySelector('#increase-text').addEventListener('click', ()=>{
      const s = loadSettings(); s.fontScale = Math.min(1.6, (s.fontScale||1)+0.1); saveSettings(s); applySettings();
    });
    bar.querySelector('#decrease-text').addEventListener('click', ()=>{
      const s = loadSettings(); s.fontScale = Math.max(0.9, (s.fontScale||1)-0.1); saveSettings(s); applySettings();
    });
  }

  // Offline queue helpers
  function getQueue(){
    try { return JSON.parse(localStorage.getItem(queueKey)) || []; } catch(e){ return []; }
  }
  function setQueue(arr){ localStorage.setItem(queueKey, JSON.stringify(arr)); }
  async function replayQueue(sendFn){
    const q = getQueue();
    const remain = [];
    for (const item of q){
      try { await sendFn(item); } catch(e){ remain.push(item); }
    }
    setQueue(remain);
  }
  // Expose a small API
  window.CC_PWA = {
    enqueue: (payload)=>{ const q=getQueue(); q.push(payload); setQueue(q); },
    replayQueue
  };

  window.addEventListener('online', ()=>{
    document.body.classList.remove('offline');
    if (window.CC_Checkins && window.CC_Checkins.sendPayload){
      replayQueue(window.CC_Checkins.sendPayload);
    }
  });
  window.addEventListener('offline', ()=> document.body.classList.add('offline'));

  applySettings();
  addSettingsUI();
})();
