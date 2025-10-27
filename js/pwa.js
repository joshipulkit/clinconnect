
// pwa.js: offline queue + basic connectivity helpers
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
    if (s.highContrast){
      delete s.highContrast;
      saveSettings(s);
    }
    if (s.fontScale && s.fontScale !== 1){
      delete s.fontScale;
      saveSettings(s);
    }
    if (root.dataset.contrast){ delete root.dataset.contrast; }
    root.style.setProperty('--base-font-scale','1');
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
  function flushQueueIfReady(){
    if (window.CC_Checkins && typeof window.CC_Checkins.sendPayload === 'function'){
      replayQueue(window.CC_Checkins.sendPayload);
    }
  }
  // Expose a small API
  window.CC_PWA = {
    enqueue: (payload)=>{
      const q = getQueue();
      q.push(payload);
      if (q.length > 10){ q.shift(); }
      setQueue(q);
    },
    replayQueue
  };

  window.addEventListener('online', ()=>{
    document.body.classList.remove('offline');
    flushQueueIfReady();
  });
  window.addEventListener('offline', ()=> document.body.classList.add('offline'));

  applySettings();
  if (!navigator.onLine){
    document.body.classList.add('offline');
  } else {
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', flushQueueIfReady, { once:true });
    } else {
      flushQueueIfReady();
    }
  }
})();
