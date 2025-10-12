// ClinConnect — Supabase Auth edition (email/password), deployable on GitHub Pages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CLINCONNECT_SUPABASE;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const state = { me: null, session: null, doctorRegistry: [] };
let heroIntervalId = null;
const THEME_STORAGE_KEY = 'clinconnect-theme';



// Utilities
function normalizePhone(p){ return (p||'').replace(/\D/g,'').slice(-15); }
function normalizeId(id){ return (id || '').trim().toUpperCase(); }
function sanitizeStorageKey(value){
  return (value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'patient';
}
function patientStorageFolder(me){
  return sanitizeStorageKey(me.patient_id || me.id);
}

function esc(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function resolveInitialTheme(){
  try{
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark'){ return stored; }
  } catch(_e){}
  if (window.matchMedia){
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}
function applyTheme(theme){
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  const toggle = document.getElementById('theme-toggle');
  const iconUse = toggle?.querySelector('.theme-icon use');
  if (iconUse){
    iconUse.setAttribute('href', theme === 'dark' ? '#icon-sun' : '#icon-moon');
  }
  if (toggle){
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

function populateDoctorSelect(){
  const select = document.getElementById('su-assigned-doctor');
  if (!select){ return; }
  const current = normalizeId(select.value || '');
  select.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = state.doctorRegistry.length ? 'Select doctor' : 'No doctors available';
  select.appendChild(placeholder);
  let found = false;
  for (const doc of state.doctorRegistry){
    const option = document.createElement('option');
    option.value = doc.employee_id;
    option.textContent = doc.full_name;
    if (doc.employee_id === current){ option.selected = true; found = true; }
    select.appendChild(option);
  }
  if (!found){ select.value = ''; }
  select.disabled = state.doctorRegistry.length === 0;
}
async function loadDoctorRegistry(){
  try{
    const { data, error } = await supabase
      .from('doctor_registry')
      .select('employee_id, full_name')
      .order('full_name', { ascending: true });
    if (error){ console.error(error); return; }
    state.doctorRegistry = (data || []).map((doc)=>({
      employee_id: normalizeId(doc.employee_id || ''),
      full_name: (doc.full_name || '').trim()
    })).filter((doc)=> doc.employee_id && doc.full_name);
    populateDoctorSelect();
  } catch(err){
    console.error(err);
  }
}


function initHeroSlider(){
  const slider = document.getElementById('hero-slider');
  if (!slider){ return; }
  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  if (slides.length === 0){ return; }
  const dotsContainer = document.getElementById('hero-dots');
  if (slides.length === 1){
    slides[0].classList.add('active');
    if (dotsContainer){ dotsContainer.innerHTML = ''; }
    return;
  }
  const dots = [];
  if (dotsContainer){ dotsContainer.innerHTML = ''; }
  slides.forEach((_slide, idx)=>{
    if (!dotsContainer){ return; }
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot';
    dot.setAttribute('aria-label', `Slide ${idx + 1}`);
    dot.addEventListener('click', ()=>{
      goTo(idx);
      start();
    });
    dotsContainer.appendChild(dot);
    dots.push(dot);
  });
  let activeIndex = 0;
  function goTo(index){
    slides[activeIndex].classList.remove('active');
    if (dots.length){ dots[activeIndex].classList.remove('active'); }
    activeIndex = index;
    slides[activeIndex].classList.add('active');
    if (dots.length){ dots[activeIndex].classList.add('active'); }
  }
  function next(){ goTo((activeIndex + 1) % slides.length); }
  function stop(){ if (heroIntervalId){ window.clearInterval(heroIntervalId); heroIntervalId = null; } }
  function start(){
    stop();
    heroIntervalId = window.setInterval(next, 6000);
  }
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  goTo(0);
  start();
}


document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();

    // Theme
  let currentTheme = resolveInitialTheme();
  applyTheme(currentTheme);
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const syncThemeToSystem = (event) => {
    try{
      if (localStorage.getItem(THEME_STORAGE_KEY)){ return; }
    } catch(_e){}
    currentTheme = event.matches ? 'dark' : 'light';
    applyTheme(currentTheme);
  };
  themeToggle?.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    try{
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    } catch(_e){}
  });
  if (prefersDark){
    if (prefersDark.addEventListener){
      prefersDark.addEventListener('change', syncThemeToSystem);
    } else if (prefersDark.addListener){
      prefersDark.addListener(syncThemeToSystem);
    }
  }


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
  const navLinks = topNav ? Array.from(topNav.querySelectorAll('a')) : [];
  const closeNav = () => topNav?.classList.remove('open');

  const setActiveNav = (targetId) => {
    navLinks.forEach((link)=> link.classList.toggle('active', link.id === targetId));
  };

  menuBtn.addEventListener('click', ()=> topNav.classList.toggle('open'));
  const goToHome = ({ focus } = {})=>{
    showOnly('#auth-section');
        if (focus === 'login'){ tabLogin.click(); }

    setActiveNav('nav-home');
    closeNav();
  };
    const goToLogin = ()=> goToHome({ focus: 'login' });

  const goToAbout = ()=>{
    showOnly('#about');
    setActiveNav('nav-about');
    closeNav();
  };
  document.getElementById('nav-home').addEventListener('click', (e)=>{ e.preventDefault(); goToHome({ focus: 'login' }); });
  document.getElementById('nav-about').addEventListener('click', (e)=>{ e.preventDefault(); goToAbout(); });
  document.getElementById('hero-login')?.addEventListener('click', (e)=>{ e.preventDefault(); goToLogin(); });
  document.getElementById('hero-learn')?.addEventListener('click', (e)=>{ e.preventDefault(); goToAbout(); });
  document.getElementById('about-login')?.addEventListener('click', (e)=>{ e.preventDefault(); goToLogin(); });
  document.getElementById('about-overview')?.addEventListener('click', (e)=>{
    e.preventDefault();
    goToHome();
    requestAnimationFrame(()=>{
      const hero = document.getElementById('hero-section');
      if (hero){ hero.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

    const triggerPasswordReset = async () => {
    if (!state.me){ alert('You must be logged in to change your password.'); return; }
    const email = state.me.email;
    try{
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
      if (error){ throw error; }
      alert('Check your inbox for a password reset email.');
    } catch(err){
      console.error(err);
      alert('Unable to send password reset email right now.');
    }
  };
  document.getElementById('pt-change-password')?.addEventListener('click', triggerPasswordReset);
  document.getElementById('doc-change-password')?.addEventListener('click', triggerPasswordReset);


  initHeroSlider();
  setActiveNav('nav-home');

  // Forms
  document.getElementById('signup-form').addEventListener('submit', handleSignup);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
    const categorySelect = document.getElementById('su-category');
  const doctorFields = document.getElementById('doctor-fields');
  const patientFields = document.getElementById('patient-fields');
  const doctorInputs = doctorFields ? doctorFields.querySelectorAll('input') : [];
  const patientInputs = patientFields ? patientFields.querySelectorAll('input, select') : [];
  const assignedDoctorInput = document.getElementById('su-assigned-doctor');
  const doctorEmployeeIdInput = document.getElementById('su-doctor-employee-id');
  function toggleCategoryFields(){
    const category = categorySelect?.value || '';
    if (doctorFields){
      const showDoctor = category === 'doctor';
      doctorFields.classList.toggle('hidden', !showDoctor);
      doctorInputs.forEach((input)=>{
        input.disabled = !showDoctor;
        if (!showDoctor){ input.value = ''; }
      });
    }
    if (patientFields){
      const showPatient = category === 'patient';
      patientFields.classList.toggle('hidden', !showPatient);
      patientInputs.forEach((input)=>{
        input.disabled = !showPatient;
        if (!showPatient){ input.value = ''; }
      });
      if (showPatient){
        populateDoctorSelect();
      } else {
        if (assignedDoctorInput){ assignedDoctorInput.value = ''; }
        if (doctorEmployeeIdInput){ doctorEmployeeIdInput.value = ''; }
      }

    }
  }
  categorySelect?.addEventListener('change', toggleCategoryFields);
  await loadDoctorRegistry();

  toggleCategoryFields();


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
  const sectionIds = ['auth-section','about','patient-page','doctor-page'];
  for (const id of sectionIds){
    const node = document.getElementById(id);
    if (node){ node.classList.add('hidden'); }
  }
  const target = document.querySelector(sel);
  if (target){ target.classList.remove('hidden'); }
  const hero = document.getElementById('hero-section');
  if (hero){ hero.classList.toggle('hidden', sel !== '#auth-section'); }
}

// Data helpers
async function profileByIdentifier(identifier){
  const raw = (identifier || '').trim();
  if (!raw){ return null; }
  if (raw.includes('@')){
    const email = raw.toLowerCase();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, category, employee_id, patient_id')
      .eq('email', email)
      .maybeSingle();
    if (error){ console.error(error); return null; }
    return data || null;
  }
  const normalized = normalizeId(raw);  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, category, employee_id, patient_id')
    .or(`employee_id.eq.${normalized},patient_id.eq.${normalized}`)
    .maybeSingle();
  if (error){ console.error(error); return null; }
  return data || null;
}

async function handleSignup(e){
  e.preventDefault();
  const category = document.getElementById('su-category').value;
  const fullname = document.getElementById('su-fullname').value.trim();
  const employeeId = normalizeId(document.getElementById('su-employee-id')?.value || '');
  const assignedDoctorSelect = document.getElementById('su-assigned-doctor');
  const selectedDoctorEmployeeId = normalizeId(assignedDoctorSelect?.value || '');
  const selectedDoctorEntry = state.doctorRegistry.find((doc)=> doc.employee_id === selectedDoctorEmployeeId);
  const assignedDoctor = selectedDoctorEntry?.full_name || '';
  const doctorEmployeeId = normalizeId(document.getElementById('su-doctor-employee-id')?.value || '');
  const patientId = normalizeId(document.getElementById('su-patient-id')?.value || '');
  const phone = normalizePhone(document.getElementById('su-phone').value.trim());
  const email = (document.getElementById('su-email').value || '').trim().toLowerCase();
  const pass = document.getElementById('su-pass').value;
  const pass2 = document.getElementById('su-pass2').value;

  if (!category || !fullname || !phone || !email || !pass || !pass2){
    alert('Please complete all required fields.'); return;
  }
    if (category === 'doctor' && !employeeId){
    alert('Employee ID is required for doctors.');
    return;
  }
  if (category === 'patient'){
    if (!selectedDoctorEmployeeId || !assignedDoctor || !doctorEmployeeId || !patientId){
      alert('Choose an assigned doctor, provide their employee ID, and enter your patient ID.');
      return;
    }
    if (doctorEmployeeId !== selectedDoctorEmployeeId){
      alert('Doctor employee ID does not match the selected doctor.');
      return;
    }
    const { data: registryDoc, error: registryDocErr } = await supabase
      .from('doctor_registry')
      .select('full_name')
      .eq('employee_id', doctorEmployeeId)
      .maybeSingle();
    if (registryDocErr){ console.error(registryDocErr); alert('Could not verify assigned doctor. Try again later.'); return; }
    const registryName = registryDoc?.full_name?.trim().toLowerCase() || '';
    if (!registryName || registryName !== assignedDoctor.toLowerCase()){
      alert('Assigned doctor name and employee ID do not match our records.');
      return;
    }
  }

  if (pass !== pass2){ alert('Passwords do not match.'); return; }
    if (category === 'doctor'){
    const { data: registry, error: registryErr } = await supabase
      .from('doctor_registry')
      .select('full_name')
      .eq('employee_id', employeeId)
      .maybeSingle();
    if (registryErr){ console.error(registryErr); alert('Could not verify doctor. Try again later.'); return; }
    const registryName = registry?.full_name?.trim().toLowerCase() || '';
    if (!registryName || registryName !== fullname.toLowerCase()){
      alert('Doctor not enrolled in the database. Contact admin.');
      return;
    }
  }


  // Pre-check uniqueness (demo: public select)
  const checks = [
    supabase.from('profiles').select('id').eq('phone', phone).maybeSingle(),
    supabase.from('profiles').select('id').eq('email', email).maybeSingle()
  ];
  if (category === 'doctor'){
    checks.push(supabase.from('profiles').select('id').eq('employee_id', employeeId).maybeSingle());
  } else {
    checks.push(supabase.from('profiles').select('id').eq('patient_id', patientId).maybeSingle());
  }
  const exists = await Promise.all(checks);
  if (exists[0].data) return alert('Phone already used.');
  if (exists[1].data) return alert('Email already used.');
  const idCheck = exists[2];
  if (category === 'doctor' && idCheck?.data) return alert('Employee ID already registered.');
  if (category === 'patient' && idCheck?.data) return alert('Patient ID already registered.');

  // Auth sign up
  const { data: sign, error: signErr } = await supabase.auth.signUp({ email, password: pass });
  if (signErr){ console.error(signErr); return alert('Signup failed: ' + signErr.message); }
  const authUser = sign.user;
  if (!authUser){
    alert('Check your email to confirm your account, then log in.');
    return;
  }

  // Insert profile
  const profile = {
    id: authUser.id,
    category,
    fullname,
    phone,
    email,
    employee_id: category === 'doctor' ? employeeId : null,
    patient_id: category === 'patient' ? patientId : null,
    assigned_doctor: category === 'patient' ? assignedDoctor : null,
    assigned_doctor_employee_id: category === 'patient' ? doctorEmployeeId : null
  };
  const { error: profErr } = await supabase.from('profiles').insert(profile);
  if (profErr){ console.error(profErr); return alert('Profile create failed.'); }

  // Seed medical for patient
  if (category === 'patient'){
    const { error: medErr } = await supabase.from('medical').insert({ user_id: authUser.id, history: '' });
    if (medErr) console.error(medErr);
  }

  alert('Signup successful! You can now log in.');
  e.target.reset();
    const catSelect = document.getElementById('su-category');
  if (catSelect){
    catSelect.value = '';
    catSelect.dispatchEvent(new Event('change'));
  }

  document.getElementById('tab-login').click();
}

async function handleLogin(e){
  e.preventDefault();
  const rawIdentifier = (document.getElementById('login-identifier').value || '').trim();
  const pass = document.getElementById('login-password').value;
  if (!rawIdentifier){ alert('Enter your patient ID, employee ID, or email.'); return; }
  if (!pass){ alert('Enter your password.'); return; }
  let email = null;
  if (rawIdentifier.includes('@')){
    email = rawIdentifier.toLowerCase();
  } else {
    const prof = await profileByIdentifier(rawIdentifier);
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
    const assigned = me.assigned_doctor
    ? `${esc(me.assigned_doctor)}${me.assigned_doctor_employee_id ? ` (${esc(me.assigned_doctor_employee_id)})` : ''}`
    : '-';

  det.innerHTML = `
    <div><strong>Name:</strong> ${esc(me.fullname)}</div>
    <div><strong>Patient ID:</strong> ${esc(me.patient_id || '-')}</div>
    <div><strong>Assigned Doctor:</strong> ${assigned}</div>
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
      const folder = patientStorageFolder(me);
      const path = `${folder}/fb_${crypto.randomUUID?.() || Date.now()}.${ext}`;
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
    .select('id, fullname, patient_id')
    .eq('category', 'patient')
    .order('fullname', { ascending: true });
  if (error){ console.error(error); return; }

  const ul = document.getElementById('doc-patient-list');
  ul.innerHTML = "";
  for (const p of patients){
    const li = document.createElement('li');
    const pid = p.patient_id ? `Patient ID: ${esc(p.patient_id)}` : 'Patient ID: -';
    li.innerHTML = `<span>${esc(p.fullname)} <small>${pid}</small></span>`;
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
  title.textContent = `Patient Data — ${p.patient_id || p.fullname || ''}`;
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
      <div><strong>Patient ID:</strong> ${esc(profile?.patient_id || '-')}</div>
      <div><strong>Assigned Doctor:</strong> ${profile?.assigned_doctor ? `${esc(profile.assigned_doctor)}${profile?.assigned_doctor_employee_id ? ` (${esc(profile.assigned_doctor_employee_id)})` : ''}` : '-'}</div>
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