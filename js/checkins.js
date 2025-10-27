
// checkins.js: guided check-ins + triage rules + offline queue
(function(){
  const TRIAGE_RULES = [
    // fever + discharge urgent
    { test: a => (a.temp_c >= 38.3) && (a.wound_discharge === 'purulent'), score: 90, tag: 'fever+discharge', level: 'urgent' },
    // uncontrolled pain > 48h
    { test: a => (a.pain_nrs >= 7) && (a.pain_duration_h >= 48), score: 70, tag: 'high_pain', level: 'priority' },
    // poor elastics compliance
    { test: a => (a.elastics_hours || 0) < 8, score: 30, tag: 'elastics_low', level: 'routine' }
  ];

  let currentUserId = null;
  let currentDoctorEmployeeId = null;

  function scoreAnswers(ans){
    let score = 0, flags = [];
    for (const rule of TRIAGE_RULES){
      if (rule.test(ans)){ score += rule.score; flags.push(rule.tag); }
    }
    return { score: Math.min(100, score), flags };
  }

  async function sendPayload(payload){
    // Try Supabase direct; fall back to queue
    const url = window.OMFS_PGIMER_SUPABASE && window.OMFS_PGIMER_SUPABASE.SUPABASE_URL;
    const anon = window.OMFS_PGIMER_SUPABASE && window.OMFS_PGIMER_SUPABASE.SUPABASE_ANON_KEY;
    if (!url || !anon) throw new Error('Supabase config missing');
    // Example: post to an Edge Function endpoint (recommended) or a table insert via REST
    const endpoint = url.replace(/\/+$/,'') + "/rest/v1/checkins";
    const body = { ...payload };
    if (!body.user_id && currentUserId){ body.user_id = currentUserId; }
    if (!body.created_at){ body.created_at = new Date().toISOString(); }
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': anon,
        'Authorization': 'Bearer ' + anon,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok){ throw new Error('Network/REST error'); }
    return await resp.json();
  }

  function initCheckin(){
    const btn = document.getElementById('btn-start-checkin');
    if (!btn) return;
    btn.addEventListener('click', ()=> openCheckinModal());
  }

  function openCheckinModal(){
    if (!currentUserId){
      alert(window.translate ? window.translate('checkin.error.authRequired') : 'Please sign in to submit a check-in.');
      return;
    }
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="ck-title">
        <h4 id="ck-title" data-i18n="checkin.title">Guided Check-in</h4>
        <form id="ck-form">
          <label> <span data-i18n="checkin.pain">Pain (0-10)</span>
            <input type="number" min="0" max="10" name="pain_nrs" required />
          </label>
          <label> <span data-i18n="checkin.painDuration">Total hours of pain at this level</span>
            <input type="number" min="0" max="168" name="pain_duration_h" required />
          </label>
          <label> <span data-i18n="checkin.temp">Temperature (°C)</span>
            <input type="number" step="0.1" min="34" max="43" name="temp_c" required />
          </label>
          <label> <span data-i18n="checkin.discharge">Wound discharge</span>
            <select name="wound_discharge">
              <option value="none" data-i18n="checkin.discharge.none">None</option>
              <option value="serous" data-i18n="checkin.discharge.serous">Serous</option>
              <option value="purulent" data-i18n="checkin.discharge.purulent">Purulent</option>
            </select>
          </label>
          <label> <span data-i18n="checkin.mouthOpening">Mouth opening (mm)</span>
            <input type="number" min="0" max="80" name="mouth_opening_mm" required />
          </label>
          <label> <span data-i18n="checkin.elastics">Elastics wear today (hours)</span>
            <input type="number" min="0" max="24" name="elastics_hours" />
          </label>
          <div class="modal-actions">
            <button type="button" class="btn" id="ck-cancel" data-i18n="checkin.cancel">Cancel</button>
            <button type="submit" class="btn primary" data-i18n="checkin.submit">Submit</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#ck-cancel').addEventListener('click', ()=> modal.remove());
    modal.querySelector('#ck-form').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const ans = Object.fromEntries(fd.entries());
      for (const k of ['pain_nrs','pain_duration_h','temp_c','mouth_opening_mm','elastics_hours']){
        if (k in ans && ans[k] !== '') ans[k] = Number(ans[k]);
      }
      const triage = scoreAnswers(ans);
      const payload = {
        ...ans,
        triage_score: triage.score,
        triage_flags: triage.flags,
        user_id: currentUserId,
        doctor_employee_id: currentDoctorEmployeeId || null,
        created_at: new Date().toISOString()
      };

      const status = document.getElementById('checkin-status');
      try {
        await sendPayload(payload);
        if (status){ status.textContent = (window.translate ? window.translate('checkin.status.sent') : 'Submitted'); }
      } catch(e){
        // offline: queue it
        if (window.CC_PWA) window.CC_PWA.enqueue(payload);
        if (status){ status.textContent = (window.translate ? window.translate('checkin.status.queued') : 'Saved offline, will send when online'); }
      } finally {
        modal.remove();
      }
    });
  }

  async function uploadPhoto(file){
    // Placeholder: integrate Supabase Storage via Edge Function; for now, show in strip
    const strip = document.getElementById('photo-strip');
    if (!strip){ return; }
    const url = URL.createObjectURL(file);
    const img = document.createElement('img'); img.src = url; img.alt = 'Healing photo';
    strip.prepend(img);
  }

  function setContext(ctx){
    if (ctx && typeof ctx === 'object'){
      currentUserId = ctx.userId || null;
      currentDoctorEmployeeId = ctx.doctorEmployeeId || null;
    } else {
      currentUserId = null;
      currentDoctorEmployeeId = null;
    }
  }

  window.CC_Checkins = { sendPayload, uploadPhoto, setContext };
  window.addEventListener('DOMContentLoaded', initCheckin);
})();
