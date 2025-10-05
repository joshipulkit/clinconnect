// ClinConnect — Supabase Auth edition (email/password), deployable on GitHub Pages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CLINCONNECT_SUPABASE;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const state = { me: null, session: null };

// Utilities
function normalizePhone(p){ return (p||'').replace(/\D/g,'').slice(-15); }
function esc(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Tabs
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginPanel = document.getElementById('login-panel');
  const signupPanel = document.getElementById('signup-panel');
  tabLogin.addEventListener('click', () => { tabLogin.classList.add('active'); tabSignup.classList.remove('active'); loginPanel.classList.add('active'); signupPanel.classList.remove('active'); });
  tabSignup.addEventListener('click', () => { tabSignup.classList.add('active'); tabLogin.classList.remove('active'); signupPanel.classList.add('active'); loginPanel.classList.remove('active'); });

  // Nav
  const menuBtn = document.getElementById('menu-toggle');
  const topNav = document.getElementById('top-nav');
  menuBtn.addEventListener('click', ()=> topNav.classList.toggle('open'));
  document.getElementById('nav-home').addEventListener('click', (e)=>{ e.preventDefault(); showOnly('#auth-section'); });
  document.getElementById('nav-about').addEventListener('click', (e)=>{ e.preventDefault(); showOnly('#about'); });

  // Forms
  document.getElementById('signup-form').addEventListener('submit', handleSignup);
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Restore session
  const { data: { session } } = await supabase.auth.getSession();
  state.session = session;
  if (session){
    const { data: { user } } = await supabase.auth.getUser();
    await hydrateUserAndRoute(user.id);
  }
  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;
  });
});

function showOnly(sel){
  for (const id of ['auth-section','about','patient-page','doctor-page']){
    document.getElementById(id).classList.add('hidden');
  }
  document.querySelector(sel).classList.remove('hidden');
}

// Data helpers
async function profileByIdentifier(identifier){
  const id = identifier.trim().toLowerCase();
  const phone = normalizePhone(identifier);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, username, phone')
    .or(`username.eq.${id},email.eq.${id},phone.eq.${phone}`)
    .limit(1);
  if (error){ console.error(error); return null; }
  return data && data[0] || null;
}

async function handleSignup(e){
  e.preventDefault();
  const category = document.getElementById('su-category').value;
  const fullname = document.getElementById('su-fullname').value.trim();
  const username = document.getElementById('su-username').value.trim().toLowerCase();
  const phone = normalizePhone(document.getElementById('su-phone').value.trim());
  const email = (document.getElementById('su-email').value || '').trim().toLowerCase();
  const pass = document.getElementById('su-pass').value;
  const pass2 = document.getElementById('su-pass2').value;

  if (!category || !fullname || !username || !phone || !email || !pass || !pass2){
    alert('Please complete all required fields.'); return;
  }
  if (pass !== pass2){ alert('Passwords do not match.'); return; }
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)){ alert('Username should be 3–30 chars: letters, numbers, _ . -'); return; }

  // Pre-check uniqueness (demo: public select)
  const exists = await Promise.all([
    supabase.from('profiles').select('id').eq('username', username).maybeSingle(),
    supabase.from('profiles').select('id').eq('phone', phone).maybeSingle(),
    supabase.from('profiles').select('id').eq('email', email).maybeSingle()
  ]);
  if (exists[0].data) return alert('Username already taken.');
  if (exists[1].data) return alert('Phone already used.');
  if (exists[2].data) return alert('Email already used.');

  // Auth sign up
  const { data: sign, error: signErr } = await supabase.auth.signUp({ email, password: pass });
  if (signErr){ console.error(signErr); return alert('Signup failed: ' + signErr.message); }
  const authUser = sign.user;
  if (!authUser){
    alert('Check your email to confirm your account, then log in.');
    return;
  }

  // Insert profile
  const profile = { id: authUser.id, category, fullname, username, phone, email };
  const { error: profErr } = await supabase.from('profiles').insert(profile);
  if (profErr){ console.error(profErr); return alert('Profile create failed.'); }

  // Seed medical for patient
  if (category === 'patient'){
    const { error: medErr } = await supabase.from('medical').insert({ user_id: authUser.id, history: '' });
    if (medErr) console.error(medErr);
  }

  alert('Signup successful! You can now log in.');
  e.target.reset();
  document.getElementById('tab-login').click();
}

async function handleLogin(e){
  e.preventDefault();
  const id = document.getElementById('login-identifier').value;
  const pass = document.getElementById('login-password').value;
  let email = id.trim().toLowerCase();
  if (!email.includes('@')){
    const prof = await profileByIdentifier(id);
    if (!prof || !prof.email){ alert('No matching user found.'); return; }
    email = prof.email;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error){ console.error(error); alert('Login failed.'); return; }
  await hydrateUserAndRoute(data.user.id);
}

async function hydrateUserAndRoute(user_id){
  const { data: me, error } = await supabase.from('profiles').select('*').eq('id', user_id).single();
  if (error){ console.error(error); return; }
  state.me = me;
  if (me.category === 'patient'){ await showPatientPage(me); } else { await showDoctorPage(me); }
}

// PATIENT PAGE
async function showPatientPage(me){
  showOnly('#patient-page');
  const det = document.getElementById('pt-details');
  det.innerHTML = `
    <div><strong>Name:</strong> ${esc(me.fullname)}</div>
    <div><strong>Username:</strong> ${esc(me.username)}</div>
    <div><strong>Phone:</strong> +${esc(me.phone)}</div>
    <div><strong>Email:</strong> ${esc(me.email || '-')}</div>
    <div><strong>Since:</strong> ${new Date(me.created_at || Date.now()).toLocaleString()}</div>
  `;

  // Load medical
  const { data: med } = await supabase.from('medical').select('*').eq('user_id', me.id).maybeSingle();
  document.getElementById('pt-history').value = med?.history || '';

  document.getElementById('save-history').onclick = async () => {
    const body = { user_id: me.id, history: document.getElementById('pt-history').value.trim() };
    // upsert emulation: try update, if 0 rows then insert
    const { data: upd, error: updErr } = await supabase.from('medical').update({ history: body.history }).eq('user_id', me.id).select('user_id').maybeSingle();
    if (updErr){ console.error(updErr); alert('Save failed'); return; }
    if (!upd){
      const { error: insErr } = await supabase.from('medical').insert(body);
      if (insErr){ console.error(insErr); alert('Save failed'); return; }
    }
    alert('History saved.');
  };

  document.getElementById('send-feedback').onclick = async () => {
    const text = document.getElementById('pt-feedback-text').value.trim();
    const files = document.getElementById('pt-feedback-file').files;
    if (!text && (!files || files.length === 0)){ alert('Write feedback or choose a photo.'); return; }
    let image_path = null;
    if (files && files.length > 0){
      const file = files[0];
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${me.username}/fb_${crypto.randomUUID?.() || Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('media').upload(path, file, { upsert: false });
      if (upErr){ console.error(upErr); alert('Upload failed'); return; }
      image_path = path;
    }
    const row = { user_id: me.id, author: 'patient', type: image_path ? 'image' : 'text', text: text || null, image_path, reply_to: null };
    const { error: insErr } = await supabase.from('feedback').insert(row);
    if (insErr){ console.error(insErr); alert('Could not submit'); return; }
    document.getElementById('pt-feedback-text').value = ''; document.getElementById('pt-feedback-file').value='';
    await renderPatientTimeline(me);
  };

  document.getElementById('logout-pt').onclick = async () => {
    await supabase.auth.signOut(); state.me = null; showOnly('#auth-section');
  };

  await renderPatientTimeline(me);
}

async function renderPatientTimeline(me){
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false });
  if (error){ console.error(error); return; }
  const wrap = document.getElementById('pt-timeline');
  wrap.innerHTML = "";
  for (const item of data){
    const div = document.createElement('div');
    div.className = 'item';
    let html = `<div><strong>${item.author === 'doctor' ? 'Doctor Comment' : 'Patient Feedback'}</strong></div>`;
    html += `<div class="meta">On ${new Date(item.created_at).toLocaleString()}</div>`;
    if (item.text){ html += `<p>${esc(item.text)}</p>`; }
    if (item.image_path){
      const { data: pub } = supabase.storage.from('media').getPublicUrl(item.image_path);
      html += `<img class="thumb" src="${pub.publicUrl}" alt="feedback image"/>`;
    }
    wrap.appendChild(div);
    div.innerHTML = html;
  }
}

// DOCTOR PAGE
async function showDoctorPage(me){
  showOnly('#doctor-page');
  document.getElementById('logout-doc').onclick = async () => {
    await supabase.auth.signOut(); state.me = null; showOnly('#auth-section');
  };

  // List patients
  const { data: patients, error } = await supabase
    .from('profiles')
    .select('id, fullname, username')
    .eq('category', 'patient')
    .order('fullname', { ascending: true });
  if (error){ console.error(error); return; }

  const ul = document.getElementById('doc-patient-list');
  ul.innerHTML = "";
  for (const p of patients){
    const li = document.createElement('li');
    li.innerHTML = `<span>${esc(p.fullname)} <small>@${esc(p.username)}</small></span>`;
    const btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'btn';
    btn.textContent = 'Open';
    btn.addEventListener('click', async (e)=>{ e.preventDefault(); await openPatientAsDoctor(p); });
    li.appendChild(btn);
    ul.appendChild(li);
  }
}

async function openPatientAsDoctor(p){
  const title = document.getElementById('doc-current-title');
  title.textContent = `Patient Data — @${p.username}`;
  const view = document.getElementById('doc-patient-view');
  view.innerHTML = "Loading...";

  const [{ data: profile }, { data: med }, { data: fb }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', p.id).single(),
    supabase.from('medical').select('*').eq('user_id', p.id).maybeSingle(),
    supabase.from('feedback').select('*').eq('user_id', p.id).order('created_at', { ascending: false })
  ]);

  const profHTML = `
    <div class="details">
      <div><strong>Name:</strong> ${esc(profile?.fullname||'')}</div>
      <div><strong>Username:</strong> ${esc(profile?.username||'')}</div>
      <div><strong>Phone:</strong> +${esc(profile?.phone||'')}</div>
      <div><strong>Email:</strong> ${esc(profile?.email||'-')}</div>
      <div><strong>Since:</strong> ${profile?.created_at ? new Date(profile.created_at).toLocaleString() : '-'}</div>
    </div>`;
  const medHTML = `
    <div class="details" style="margin-top:10px">
      <div><strong>Medical History:</strong></div>
      <div>${esc(med?.history||'')}</div>
    </div>`;

  let fbHTML = `<div class="timeline" id="doc-timeline">`;
  for (const item of (fb || [])){
    let media = '';
    if (item.image_path){
      const { data: pub } = supabase.storage.from('media').getPublicUrl(item.image_path);
      media = `<img class="thumb" src="${pub.publicUrl}" alt="feedback image"/>`;
    }
    fbHTML += `<div class="item" data-id="${item.id}">
      <div><strong>${item.author === 'doctor' ? 'Doctor Comment' : 'Patient Feedback'}</strong></div>
      <div class="meta">On ${new Date(item.created_at).toLocaleString()}</div>
      ${item.text ? `<p>${esc(item.text)}</p>` : ''}
      ${media}
      <div class="reply">
        <label class="lbl">Add a doctor comment</label>
        <textarea rows="3" placeholder="Type a reply..."></textarea>
        <div class="row"><button class="btn primary">Comment</button></div>
      </div>
    </div>`;
  }
  fbHTML += `</div>`;

  view.innerHTML = profHTML + medHTML + fbHTML;

  const timeline = view.querySelector('#doc-timeline');
  timeline.querySelectorAll('.item').forEach((node)=>{
    const id = node.getAttribute('data-id');
    const ta = node.querySelector('textarea');
    const btn = node.querySelector('button');
    btn.addEventListener('click', async ()=>{
      const text = (ta.value || '').trim();
      if (!text){ alert('Write a comment.'); return; }
      const row = { user_id: p.id, author: 'doctor', type:'text', text, reply_to: id };
      const { error } = await supabase.from('feedback').insert(row);
      if (error){ console.error(error); alert('Could not comment'); return; }
      await openPatientAsDoctor(p);
    });
  });
}
