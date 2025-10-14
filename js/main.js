// ClinConnect — Supabase Auth edition (email/password), deployable on GitHub Pages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CLINCONNECT_SUPABASE;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const state = { me: null, session: null, doctorRegistry: [], doctorProfiles: [], appointments: [] };
let heroIntervalId = null;
const THEME_STORAGE_KEY = 'clinconnect-theme';
const COUNTRY_CODES = [
  { name: 'Afghanistan', dial_code: '93', iso2: 'AF' },
  { name: 'Albania', dial_code: '355', iso2: 'AL' },
  { name: 'Algeria', dial_code: '213', iso2: 'DZ' },
  { name: 'American Samoa', dial_code: '1684', iso2: 'AS' },
  { name: 'Andorra', dial_code: '376', iso2: 'AD' },
  { name: 'Angola', dial_code: '244', iso2: 'AO' },
  { name: 'Anguilla', dial_code: '1264', iso2: 'AI' },
  { name: 'Antarctica', dial_code: '672', iso2: 'AQ' },
  { name: 'Antigua and Barbuda', dial_code: '1268', iso2: 'AG' },
  { name: 'Argentina', dial_code: '54', iso2: 'AR' },
  { name: 'Armenia', dial_code: '374', iso2: 'AM' },
  { name: 'Aruba', dial_code: '297', iso2: 'AW' },
  { name: 'Australia', dial_code: '61', iso2: 'AU' },
  { name: 'Austria', dial_code: '43', iso2: 'AT' },
  { name: 'Azerbaijan', dial_code: '994', iso2: 'AZ' },
  { name: 'Bahamas', dial_code: '1242', iso2: 'BS' },
  { name: 'Bahrain', dial_code: '973', iso2: 'BH' },
  { name: 'Bangladesh', dial_code: '880', iso2: 'BD' },
  { name: 'Barbados', dial_code: '1246', iso2: 'BB' },
  { name: 'Belarus', dial_code: '375', iso2: 'BY' },
  { name: 'Belgium', dial_code: '32', iso2: 'BE' },
  { name: 'Belize', dial_code: '501', iso2: 'BZ' },
  { name: 'Benin', dial_code: '229', iso2: 'BJ' },
  { name: 'Bermuda', dial_code: '1441', iso2: 'BM' },
  { name: 'Bhutan', dial_code: '975', iso2: 'BT' },
  { name: 'Bolivia', dial_code: '591', iso2: 'BO' },
  { name: 'Bosnia and Herzegovina', dial_code: '387', iso2: 'BA' },
  { name: 'Botswana', dial_code: '267', iso2: 'BW' },
  { name: 'Brazil', dial_code: '55', iso2: 'BR' },
  { name: 'British Indian Ocean Territory', dial_code: '246', iso2: 'IO' },
  { name: 'British Virgin Islands', dial_code: '1284', iso2: 'VG' },
  { name: 'Brunei', dial_code: '673', iso2: 'BN' },
  { name: 'Bulgaria', dial_code: '359', iso2: 'BG' },
  { name: 'Burkina Faso', dial_code: '226', iso2: 'BF' },
  { name: 'Burundi', dial_code: '257', iso2: 'BI' },
  { name: 'Cabo Verde', dial_code: '238', iso2: 'CV' },
  { name: 'Cambodia', dial_code: '855', iso2: 'KH' },
  { name: 'Cameroon', dial_code: '237', iso2: 'CM' },
  { name: 'Canada', dial_code: '1', iso2: 'CA' },
  { name: 'Caribbean Netherlands', dial_code: '599', iso2: 'BQ' },
  { name: 'Cayman Islands', dial_code: '1345', iso2: 'KY' },
  { name: 'Central African Republic', dial_code: '236', iso2: 'CF' },
  { name: 'Chad', dial_code: '235', iso2: 'TD' },
  { name: 'Chile', dial_code: '56', iso2: 'CL' },
  { name: 'China', dial_code: '86', iso2: 'CN' },
  { name: 'Christmas Island', dial_code: '61', iso2: 'CX' },
  { name: 'Cocos (Keeling) Islands', dial_code: '61', iso2: 'CC' },
  { name: 'Colombia', dial_code: '57', iso2: 'CO' },
  { name: 'Comoros', dial_code: '269', iso2: 'KM' },
  { name: 'Congo (DRC)', dial_code: '243', iso2: 'CD' },
  { name: 'Congo (Republic)', dial_code: '242', iso2: 'CG' },
  { name: 'Cook Islands', dial_code: '682', iso2: 'CK' },
  { name: 'Costa Rica', dial_code: '506', iso2: 'CR' },
  { name: "Côte d’Ivoire", dial_code: '225', iso2: 'CI' },
  { name: 'Croatia', dial_code: '385', iso2: 'HR' },
  { name: 'Cuba', dial_code: '53', iso2: 'CU' },
  { name: 'Curaçao', dial_code: '599', iso2: 'CW' },
  { name: 'Cyprus', dial_code: '357', iso2: 'CY' },
  { name: 'Czechia', dial_code: '420', iso2: 'CZ' },
  { name: 'Denmark', dial_code: '45', iso2: 'DK' },
  { name: 'Djibouti', dial_code: '253', iso2: 'DJ' },
  { name: 'Dominica', dial_code: '1767', iso2: 'DM' },
  { name: 'Dominican Republic', dial_code: '1', iso2: 'DO' },
  { name: 'Ecuador', dial_code: '593', iso2: 'EC' },
  { name: 'Egypt', dial_code: '20', iso2: 'EG' },
  { name: 'El Salvador', dial_code: '503', iso2: 'SV' },
  { name: 'Equatorial Guinea', dial_code: '240', iso2: 'GQ' },
  { name: 'Eritrea', dial_code: '291', iso2: 'ER' },
  { name: 'Estonia', dial_code: '372', iso2: 'EE' },
  { name: 'Eswatini', dial_code: '268', iso2: 'SZ' },
  { name: 'Ethiopia', dial_code: '251', iso2: 'ET' },
  { name: 'Falkland Islands', dial_code: '500', iso2: 'FK' },
  { name: 'Faroe Islands', dial_code: '298', iso2: 'FO' },
  { name: 'Fiji', dial_code: '679', iso2: 'FJ' },
  { name: 'Finland', dial_code: '358', iso2: 'FI' },
  { name: 'France', dial_code: '33', iso2: 'FR' },
  { name: 'French Guiana', dial_code: '594', iso2: 'GF' },
  { name: 'French Polynesia', dial_code: '689', iso2: 'PF' },
  { name: 'Gabon', dial_code: '241', iso2: 'GA' },
  { name: 'Gambia', dial_code: '220', iso2: 'GM' },
  { name: 'Georgia', dial_code: '995', iso2: 'GE' },
  { name: 'Germany', dial_code: '49', iso2: 'DE' },
  { name: 'Ghana', dial_code: '233', iso2: 'GH' },
  { name: 'Gibraltar', dial_code: '350', iso2: 'GI' },
  { name: 'Greece', dial_code: '30', iso2: 'GR' },
  { name: 'Greenland', dial_code: '299', iso2: 'GL' },
  { name: 'Grenada', dial_code: '1473', iso2: 'GD' },
  { name: 'Guadeloupe', dial_code: '590', iso2: 'GP' },
  { name: 'Guam', dial_code: '1671', iso2: 'GU' },
  { name: 'Guatemala', dial_code: '502', iso2: 'GT' },
  { name: 'Guernsey', dial_code: '44', iso2: 'GG' },
  { name: 'Guinea', dial_code: '224', iso2: 'GN' },
  { name: 'Guinea-Bissau', dial_code: '245', iso2: 'GW' },
  { name: 'Guyana', dial_code: '592', iso2: 'GY' },
  { name: 'Haiti', dial_code: '509', iso2: 'HT' },
  { name: 'Honduras', dial_code: '504', iso2: 'HN' },
  { name: 'Hong Kong', dial_code: '852', iso2: 'HK' },
  { name: 'Hungary', dial_code: '36', iso2: 'HU' },
  { name: 'Iceland', dial_code: '354', iso2: 'IS' },
  { name: 'India', dial_code: '91', iso2: 'IN' },
  { name: 'Indonesia', dial_code: '62', iso2: 'ID' },
  { name: 'Iran', dial_code: '98', iso2: 'IR' },
  { name: 'Iraq', dial_code: '964', iso2: 'IQ' },
  { name: 'Ireland', dial_code: '353', iso2: 'IE' },
  { name: 'Isle of Man', dial_code: '44', iso2: 'IM' },
  { name: 'Israel', dial_code: '972', iso2: 'IL' },
  { name: 'Italy', dial_code: '39', iso2: 'IT' },
  { name: 'Jamaica', dial_code: '1876', iso2: 'JM' },
  { name: 'Japan', dial_code: '81', iso2: 'JP' },
  { name: 'Jersey', dial_code: '44', iso2: 'JE' },
  { name: 'Jordan', dial_code: '962', iso2: 'JO' },
  { name: 'Kazakhstan', dial_code: '7', iso2: 'KZ' },
  { name: 'Kenya', dial_code: '254', iso2: 'KE' },
  { name: 'Kiribati', dial_code: '686', iso2: 'KI' },
  { name: 'Kosovo', dial_code: '383', iso2: 'XK' },
  { name: 'Kuwait', dial_code: '965', iso2: 'KW' },
  { name: 'Kyrgyzstan', dial_code: '996', iso2: 'KG' },
  { name: 'Laos', dial_code: '856', iso2: 'LA' },
  { name: 'Latvia', dial_code: '371', iso2: 'LV' },
  { name: 'Lebanon', dial_code: '961', iso2: 'LB' },
  { name: 'Lesotho', dial_code: '266', iso2: 'LS' },
  { name: 'Liberia', dial_code: '231', iso2: 'LR' },
  { name: 'Libya', dial_code: '218', iso2: 'LY' },
  { name: 'Liechtenstein', dial_code: '423', iso2: 'LI' },
  { name: 'Lithuania', dial_code: '370', iso2: 'LT' },
  { name: 'Luxembourg', dial_code: '352', iso2: 'LU' },
  { name: 'Macao', dial_code: '853', iso2: 'MO' },
  { name: 'Madagascar', dial_code: '261', iso2: 'MG' },
  { name: 'Malawi', dial_code: '265', iso2: 'MW' },
  { name: 'Malaysia', dial_code: '60', iso2: 'MY' },
  { name: 'Maldives', dial_code: '960', iso2: 'MV' },
  { name: 'Mali', dial_code: '223', iso2: 'ML' },
  { name: 'Malta', dial_code: '356', iso2: 'MT' },
  { name: 'Marshall Islands', dial_code: '692', iso2: 'MH' },
  { name: 'Martinique', dial_code: '596', iso2: 'MQ' },
  { name: 'Mauritania', dial_code: '222', iso2: 'MR' },
  { name: 'Mauritius', dial_code: '230', iso2: 'MU' },
  { name: 'Mayotte', dial_code: '262', iso2: 'YT' },
  { name: 'Mexico', dial_code: '52', iso2: 'MX' },
  { name: 'Micronesia', dial_code: '691', iso2: 'FM' },
  { name: 'Moldova', dial_code: '373', iso2: 'MD' },
  { name: 'Monaco', dial_code: '377', iso2: 'MC' },
  { name: 'Mongolia', dial_code: '976', iso2: 'MN' },
  { name: 'Montenegro', dial_code: '382', iso2: 'ME' },
  { name: 'Montserrat', dial_code: '1664', iso2: 'MS' },
  { name: 'Morocco', dial_code: '212', iso2: 'MA' },
  { name: 'Mozambique', dial_code: '258', iso2: 'MZ' },
  { name: 'Myanmar', dial_code: '95', iso2: 'MM' },
  { name: 'Namibia', dial_code: '264', iso2: 'NA' },
  { name: 'Nauru', dial_code: '674', iso2: 'NR' },
  { name: 'Nepal', dial_code: '977', iso2: 'NP' },
  { name: 'Netherlands', dial_code: '31', iso2: 'NL' },
  { name: 'New Caledonia', dial_code: '687', iso2: 'NC' },
  { name: 'New Zealand', dial_code: '64', iso2: 'NZ' },
  { name: 'Nicaragua', dial_code: '505', iso2: 'NI' },
  { name: 'Niger', dial_code: '227', iso2: 'NE' },
  { name: 'Nigeria', dial_code: '234', iso2: 'NG' },
  { name: 'Niue', dial_code: '683', iso2: 'NU' },
  { name: 'Norfolk Island', dial_code: '672', iso2: 'NF' },
  { name: 'North Korea', dial_code: '850', iso2: 'KP' },
  { name: 'North Macedonia', dial_code: '389', iso2: 'MK' },
  { name: 'Northern Mariana Islands', dial_code: '1670', iso2: 'MP' },
  { name: 'Norway', dial_code: '47', iso2: 'NO' },
  { name: 'Oman', dial_code: '968', iso2: 'OM' },
  { name: 'Pakistan', dial_code: '92', iso2: 'PK' },
  { name: 'Palau', dial_code: '680', iso2: 'PW' },
  { name: 'Palestine', dial_code: '970', iso2: 'PS' },
  { name: 'Panama', dial_code: '507', iso2: 'PA' },
  { name: 'Papua New Guinea', dial_code: '675', iso2: 'PG' },
  { name: 'Paraguay', dial_code: '595', iso2: 'PY' },
  { name: 'Peru', dial_code: '51', iso2: 'PE' },
  { name: 'Philippines', dial_code: '63', iso2: 'PH' },
  { name: 'Pitcairn Islands', dial_code: '870', iso2: 'PN' },
  { name: 'Poland', dial_code: '48', iso2: 'PL' },
  { name: 'Portugal', dial_code: '351', iso2: 'PT' },
  { name: 'Puerto Rico', dial_code: '1', iso2: 'PR' },
  { name: 'Qatar', dial_code: '974', iso2: 'QA' },
  { name: 'Réunion', dial_code: '262', iso2: 'RE' },
  { name: 'Romania', dial_code: '40', iso2: 'RO' },
  { name: 'Russia', dial_code: '7', iso2: 'RU' },
  { name: 'Rwanda', dial_code: '250', iso2: 'RW' },
  { name: 'Saint Barthélemy', dial_code: '590', iso2: 'BL' },
  { name: 'Saint Helena', dial_code: '290', iso2: 'SH' },
  { name: 'Saint Kitts and Nevis', dial_code: '1869', iso2: 'KN' },
  { name: 'Saint Lucia', dial_code: '1758', iso2: 'LC' },
  { name: 'Saint Martin', dial_code: '590', iso2: 'MF' },
  { name: 'Saint Pierre and Miquelon', dial_code: '508', iso2: 'PM' },
  { name: 'Saint Vincent and the Grenadines', dial_code: '1784', iso2: 'VC' },
  { name: 'Samoa', dial_code: '685', iso2: 'WS' },
  { name: 'San Marino', dial_code: '378', iso2: 'SM' },
  { name: 'São Tomé and Príncipe', dial_code: '239', iso2: 'ST' },
  { name: 'Saudi Arabia', dial_code: '966', iso2: 'SA' },
  { name: 'Senegal', dial_code: '221', iso2: 'SN' },
  { name: 'Serbia', dial_code: '381', iso2: 'RS' },
  { name: 'Seychelles', dial_code: '248', iso2: 'SC' },
  { name: 'Sierra Leone', dial_code: '232', iso2: 'SL' },
  { name: 'Singapore', dial_code: '65', iso2: 'SG' },
  { name: 'Sint Maarten', dial_code: '1721', iso2: 'SX' },
  { name: 'Slovakia', dial_code: '421', iso2: 'SK' },
  { name: 'Slovenia', dial_code: '386', iso2: 'SI' },
  { name: 'Solomon Islands', dial_code: '677', iso2: 'SB' },
  { name: 'Somalia', dial_code: '252', iso2: 'SO' },
  { name: 'South Africa', dial_code: '27', iso2: 'ZA' },
  { name: 'South Georgia and the South Sandwich Islands', dial_code: '500', iso2: 'GS' },
  { name: 'South Korea', dial_code: '82', iso2: 'KR' },
  { name: 'South Sudan', dial_code: '211', iso2: 'SS' },
  { name: 'Spain', dial_code: '34', iso2: 'ES' },
  { name: 'Sri Lanka', dial_code: '94', iso2: 'LK' },
  { name: 'Sudan', dial_code: '249', iso2: 'SD' },
  { name: 'Suriname', dial_code: '597', iso2: 'SR' },
  { name: 'Svalbard and Jan Mayen', dial_code: '47', iso2: 'SJ' },
  { name: 'Sweden', dial_code: '46', iso2: 'SE' },
  { name: 'Switzerland', dial_code: '41', iso2: 'CH' },
  { name: 'Syria', dial_code: '963', iso2: 'SY' },
  { name: 'Taiwan', dial_code: '886', iso2: 'TW' },
  { name: 'Tajikistan', dial_code: '992', iso2: 'TJ' },
  { name: 'Tanzania', dial_code: '255', iso2: 'TZ' },
  { name: 'Thailand', dial_code: '66', iso2: 'TH' },
  { name: 'Timor-Leste', dial_code: '670', iso2: 'TL' },
  { name: 'Togo', dial_code: '228', iso2: 'TG' },
  { name: 'Tokelau', dial_code: '690', iso2: 'TK' },
  { name: 'Tonga', dial_code: '676', iso2: 'TO' },
  { name: 'Trinidad and Tobago', dial_code: '1868', iso2: 'TT' },
  { name: 'Tunisia', dial_code: '216', iso2: 'TN' },
  { name: 'Turkey', dial_code: '90', iso2: 'TR' },
  { name: 'Turkmenistan', dial_code: '993', iso2: 'TM' },
  { name: 'Turks and Caicos Islands', dial_code: '1649', iso2: 'TC' },
  { name: 'Tuvalu', dial_code: '688', iso2: 'TV' },
  { name: 'Uganda', dial_code: '256', iso2: 'UG' },
  { name: 'Ukraine', dial_code: '380', iso2: 'UA' },
  { name: 'United Arab Emirates', dial_code: '971', iso2: 'AE' },
  { name: 'United Kingdom', dial_code: '44', iso2: 'GB' },
  { name: 'United States', dial_code: '1', iso2: 'US' },
  { name: 'United States Virgin Islands', dial_code: '1340', iso2: 'VI' },
  { name: 'Uruguay', dial_code: '598', iso2: 'UY' },
  { name: 'Uzbekistan', dial_code: '998', iso2: 'UZ' },
  { name: 'Vanuatu', dial_code: '678', iso2: 'VU' },
  { name: 'Vatican City', dial_code: '379', iso2: 'VA' },
  { name: 'Venezuela', dial_code: '58', iso2: 'VE' },
  { name: 'Vietnam', dial_code: '84', iso2: 'VN' },
  { name: 'Wallis and Futuna', dial_code: '681', iso2: 'WF' },
  { name: 'Western Sahara', dial_code: '212', iso2: 'EH' },
  { name: 'Yemen', dial_code: '967', iso2: 'YE' },
  { name: 'Zambia', dial_code: '260', iso2: 'ZM' },
  { name: 'Zimbabwe', dial_code: '263', iso2: 'ZW' },
  { name: 'Åland Islands', dial_code: '358', iso2: 'AX' }
];


// Utilities
function normalizeId(id){ return (id || '').trim().toUpperCase(); }
function digitsOnly(value){ return (value || '').replace(/\D/g, ''); }
function normalizePhone(countryCodeValue, localValue){
  const cc = digitsOnly(countryCodeValue);
  const national = digitsOnly(localValue);
  if (!cc){ return { error: 'Select a country code.' }; }
  if (!national){ return { error: 'Enter a phone number.' }; }
  if (national.length < 4 || national.length > 15){ return { error: 'Phone number must be between 4 and 15 digits.' }; }
  if (cc.length + national.length > 15){ return { error: 'Phone number exceeds the international length limit of 15 digits.' }; }
  return { value: `+${cc} ${national}` };
}
function formatPhoneDisplay(phone){
  if (!phone){ return '-'; }
  const trimmed = String(phone).trim();
  if (trimmed.startsWith('+')){ return trimmed; }
  const digits = digitsOnly(trimmed);
  return digits ? `+${digits}` : '-';
}
function populatePhoneCountrySelect(){
  const select = document.getElementById('su-phone-country');
  if (!select){ return; }
  select.innerHTML = '';
  COUNTRY_CODES
    .slice()
    .sort((a, b)=> a.name.localeCompare(b.name))
    .forEach((country)=>{
      const option = document.createElement('option');
      option.value = country.dial_code;
      option.textContent = `${country.name} (+${country.dial_code})`;
      if (country.dial_code === '91'){ option.selected = true; }
      select.appendChild(option);
    });
}
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

async function loadDoctorProfiles(){
  try{
    const { data, error } = await supabase
      .from('profiles')
      .select('id, fullname, employee_id')
      .eq('category', 'doctor')
      .order('fullname', { ascending: true });
    if (error){ console.error(error); return; }
    const normalized = (data || []).map((doc)=>({
      id: doc.id,
      employee_id: normalizeId(doc.employee_id || ''),
      full_name: (doc.fullname || '').trim()
    })).filter((doc)=> doc.employee_id && doc.full_name);
    const seen = new Set();
    state.doctorProfiles = normalized.filter((doc)=>{
      if (seen.has(doc.employee_id)){ return false; }
      seen.add(doc.employee_id);
      return true;
    });
  } catch(err){
    console.error(err);
  }
}

async function loadDoctorAppointments(doctorId){
  try{
    const { data, error } = await supabase
      .from('appointments')
      .select('id, doctor_id, patient_id, scheduled_at, notes, patient:patient_id(fullname, patient_id)')
      .eq('doctor_id', doctorId)
      .order('scheduled_at', { ascending: true });
    if (error){ console.error(error); return []; }
    return (data || []).map((row)=>({
      ...row,
      patient: row.patient || null
    }));
  } catch(err){
    console.error(err);
    return [];
  }
}

async function loadPatientAppointments(patientId){
  try{
    const { data, error } = await supabase
      .from('appointments')
      .select('id, doctor_id, patient_id, scheduled_at, notes, doctor:doctor_id(fullname, employee_id)')
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: true });
    if (error){ console.error(error); return []; }
    return (data || []).map((row)=>({
      ...row,
      doctor: row.doctor || null
    }));
  } catch(err){
    console.error(err);
    return [];
  }
}

function upcomingAppointments(appointments){
  const now = Date.now();
  return (appointments || []).filter((appt)=> new Date(appt.scheduled_at).getTime() >= now);
}

function toISTDate(value){
  const dt = value instanceof Date ? value : new Date(value);
  const utcMillis = dt.getTime() + dt.getTimezoneOffset() * 60000;
  return new Date(utcMillis + 19800000); // +05:30 offset
}

function formatAppointmentDateTime(value){
  const dt = toISTDate(value);
  const day = dt.toLocaleDateString('en-IN', { weekday:'long' });
  const date = dt.toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });
  const time = dt.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
  return { day, date, time, label: `${day}, ${date} at ${time} IST` };
}

function renderAppointmentsSummary(appointments){
  const list = appointments || [];
  if (!list.length){
    return `<h5>Scheduled appointments</h5><p class="muted">No appointments have been scheduled yet.</p>`;
  }
  const items = list.map((appt)=>{
    const info = formatAppointmentDateTime(appt.scheduled_at);
    const patientName = appt.patient?.fullname || 'Patient';
    const patientCode = appt.patient?.patient_id ? ` • ${esc(appt.patient.patient_id)}` : '';
    const noteHtml = appt.notes ? `<div class="meta">${esc(appt.notes)}</div>` : '';
    return `<li class="appointment-item">
      <strong>${esc(patientName)}${patientCode}</strong>
      <div class="meta">${esc(info.day)}, ${esc(info.date)} at ${esc(info.time)} IST</div>
      ${noteHtml}
    </li>`;
  }).join('');
  return `<h5>Scheduled appointments</h5><ul class="appointment-list">${items}</ul>`;
}

function renderPatientNextAppointmentBanner(container, appointment){
  if (!container){ return; }
  if (!appointment){
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  const info = formatAppointmentDateTime(appointment.scheduled_at);
  const doctorRaw = (appointment.doctor?.fullname || '').trim();
  const doctorLabel = doctorRaw
    ? (/^dr\b/i.test(doctorRaw) ? doctorRaw : `Dr. ${doctorRaw}`)
    : 'your doctor';
  const doctorName = esc(doctorLabel);
  const noteSuffix = appointment.notes ? ` — ${esc(appointment.notes)}` : '';
  container.innerHTML = `
    <div class="banner-icon" aria-hidden="true">
      <svg class="ico" aria-hidden="true"><use href="#icon-calendar"/></svg>
    </div>
    <div class="banner-content">
      <p class="banner-title">Next appointment confirmed</p>
      <p class="banner-meta"><small>${esc(info.day)}</small>${esc(info.date)} · ${esc(info.time)} IST</p>
      <p class="banner-note">With ${doctorName}${noteSuffix}</p>
    </div>
  `;
  container.classList.remove('hidden');
}

function renderPatientAppointmentsList(container, appointments){
  if (!container){ return; }
  const list = appointments || [];
  if (!list.length){
    container.innerHTML = `<div class="placeholder muted">No appointments scheduled yet.</div>`;
    return;
  }
  container.innerHTML = list.map((appt)=>{
    const info = formatAppointmentDateTime(appt.scheduled_at);
    const doctorName = appt.doctor?.fullname ? esc(appt.doctor.fullname) : 'Doctor';
    const noteHtml = appt.notes ? `<p>${esc(appt.notes)}</p>` : '';
    return `<div class="item">
      <div><strong>${doctorName}</strong></div>
      <div class="meta">${esc(info.day)}, ${esc(info.date)} at ${esc(info.time)} IST</div>
      ${noteHtml}
    </div>`;
  }).join('');
}

function buildFeedbackThreads(entries){
  const items = (entries || []).map((entry)=>({ ...entry, replies: [] }));
  const byId = new Map();
  items.forEach((item)=> byId.set(item.id, item));
  const roots = [];
  for (const item of items){
    if (item.reply_to && byId.has(item.reply_to)){
      byId.get(item.reply_to).replies.push(item);
    } else {
      roots.push(item);
    }
  }
  const sortRecursive = (list)=>{
    list.sort((a, b)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    list.forEach((child)=> sortRecursive(child.replies));
  };
  sortRecursive(roots);
  return roots;
}

function renderConversationThreads(threads, { viewer }){
  if (!threads || threads.length === 0){ return ''; }
  return threads.map((thread)=> renderConversationMessage(thread, viewer)).join('');
}

function renderConversationMessage(message, viewer){
  const isMine = viewer === 'patient'
    ? message.author === 'patient'
    : message.author === 'doctor';
  const canReply = viewer === 'patient'
    ? message.author === 'doctor'
    : message.author === 'patient';
  const senderLabel = message.author === 'doctor' ? 'Doctor' : 'Patient';
  const metaLabel = isMine ? 'You' : senderLabel;
  const timestamp = message.created_at ? formatAppointmentDateTime(message.created_at).label : '';
  const bodyParts = [];
  if (message.text){
    bodyParts.push(`<div class="chat-text">${esc(message.text).replace(/\n/g, '<br/>')}</div>`);
  }
  if (message.image_path){
    const { data: pub } = supabase.storage.from('media').getPublicUrl(message.image_path);
    if (pub?.publicUrl){
      bodyParts.push(`<img src="${esc(pub.publicUrl)}" alt="attachment"/>`);
    }
  }
  const bodyHtml = bodyParts.length ? `<div class="chat-body">${bodyParts.join('')}</div>` : '';
  const actionsHtml = canReply
    ? `<div class="chat-actions"><button type="button" class="chat-reply-toggle" data-id="${message.id}">Reply</button></div>`
    : '';
  const replyFormHtml = canReply
    ? `<div class="chat-reply-form hidden" data-parent="${message.id}">
        <textarea rows="3" placeholder="Type your reply..."></textarea>
        <div class="chat-reply-buttons">
          <button type="button" class="btn primary small chat-reply-submit" data-id="${message.id}">Send</button>
          <button type="button" class="btn ghost small chat-reply-cancel">Cancel</button>
        </div>
      </div>`
    : '';
  const childrenHtml = message.replies.length
    ? `<div class="chat-thread-children">${message.replies.map((child)=> renderConversationMessage(child, viewer)).join('')}</div>`
    : '';
  return `<div class="chat-thread">
    <div class="chat-message${isMine ? ' mine' : ''}" data-id="${message.id}">
      <div class="chat-meta">${esc(metaLabel)} · ${esc(timestamp)}</div>
      ${bodyHtml}
      ${actionsHtml}
      ${replyFormHtml}
    </div>
    ${childrenHtml}
  </div>`;
}

function wireReplyHandlers(container, { viewer, targetUserId, refresh }){
  container.querySelectorAll('.chat-reply-toggle').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
      const message = btn.closest('.chat-message');
      const form = message?.querySelector('.chat-reply-form');
      if (!form){ return; }
      const currentlyHidden = form.classList.contains('hidden');
      container.querySelectorAll('.chat-reply-form').forEach((other)=>{
        if (other !== form){ other.classList.add('hidden'); }
      });
      form.classList.toggle('hidden', !currentlyHidden);
      if (currentlyHidden){
        form.querySelector('textarea')?.focus();
      }
    });
  });
  container.querySelectorAll('.chat-reply-cancel').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
      const form = btn.closest('.chat-reply-form');
      if (!form){ return; }
      const textarea = form.querySelector('textarea');
      if (textarea){ textarea.value = ''; }
      form.classList.add('hidden');
    });
  });
  container.querySelectorAll('.chat-reply-submit').forEach((btn)=>{
    btn.addEventListener('click', async ()=>{
      const form = btn.closest('.chat-reply-form');
      if (!form){ return; }
      const textarea = form.querySelector('textarea');
      const text = (textarea?.value || '').trim();
      if (!text){ alert('Write a reply.'); return; }
      const parentId = btn.dataset.id;
      const row = {
        user_id: targetUserId,
        author: viewer,
        type: 'text',
        text,
        reply_to: parentId
      };
      btn.disabled = true;
      try{
        const { error } = await supabase.from('feedback').insert(row);
        if (error){ throw error; }
        if (textarea){ textarea.value = ''; }
        form.classList.add('hidden');
        await refresh();
      } catch(err){
        console.error(err);
        alert('Could not send reply.');
      } finally {
        btn.disabled = false;
      }
    });
  });
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
  populatePhoneCountrySelect();

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
  const phoneCountry = document.getElementById('su-phone-country').value;
  const rawPhone = document.getElementById('su-phone').value.trim();
  const phoneResult = normalizePhone(phoneCountry, rawPhone);
  if (phoneResult.error){ alert(phoneResult.error); return; }
  const phone = phoneResult.value;
  const email = (document.getElementById('su-email').value || '').trim().toLowerCase();
  const pass = document.getElementById('su-pass').value;
  const pass2 = document.getElementById('su-pass2').value;

  if (!category || !fullname || !email || !pass || !pass2){
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
  const assignedDisplay = me.assigned_doctor ? esc(me.assigned_doctor) : '-';
  const phoneFormatted = formatPhoneDisplay(me.phone);
  const sinceIST = formatAppointmentDateTime(me.created_at || Date.now());
  const welcomeTitle = document.getElementById('pt-welcome-title');
  if (welcomeTitle){
    const name = (me.fullname || '').trim();
    welcomeTitle.textContent = name ? `Welcome back, ${esc(name)}` : 'Welcome back';
  }
  const welcomeSubtitle = document.getElementById('pt-welcome-subtitle');
  if (welcomeSubtitle){
    welcomeSubtitle.textContent = assignedDisplay !== '-'
      ? `Your primary doctor is ${assignedDisplay}. Share updates and track guidance in one place.`
      : 'You are not yet assigned to a doctor. Contact the care team to get connected.';
  }
  det.innerHTML = `
    <div><strong>Name:</strong> ${esc(me.fullname)}</div>
    <div><strong>Patient ID:</strong> ${esc(me.patient_id || '-')}</div>
    <div><strong>Assigned Doctor:</strong> ${assignedDisplay}</div>
    <div><strong>Phone:</strong> ${esc(phoneFormatted)}</div>
    <div><strong>Email:</strong> ${esc(me.email || '-')}</div>
    <div><strong>Since:</strong> ${esc(sinceIST.label)}</div>
  `;

  // Load medical
  const { data: med } = await supabase.from('medical').select('*').eq('user_id', me.id).maybeSingle();
  const historyWrap = document.getElementById('pt-history');
  const historyText = (med?.history || '').trim();
  if (historyText){
    historyWrap.innerHTML = esc(historyText).replace(/\n/g, '<br/>');
    historyWrap.classList.remove('empty');
  } else {
    historyWrap.textContent = 'Your doctor will add notes here after appointments.';
    historyWrap.classList.add('empty');
  }

  const feedbackForm = document.getElementById('pt-feedback-form');
  const feedbackText = document.getElementById('pt-feedback-text');
  const feedbackFile = document.getElementById('pt-feedback-file');
  const feedbackAttach = document.getElementById('pt-feedback-attach');
  const feedbackSend = document.getElementById('pt-feedback-send');

  const resetComposer = ()=>{
    if (feedbackText){ feedbackText.value = ''; }
    if (feedbackFile){ feedbackFile.value = ''; }
    if (feedbackAttach){
      feedbackAttach.classList.remove('has-file');
      feedbackAttach.setAttribute('aria-label', 'Upload a photo');
    }
  };

  const syncAttachState = ()=>{
    if (!feedbackAttach || !feedbackFile){ return; }
    const hasFile = feedbackFile.files && feedbackFile.files.length > 0;
    feedbackAttach.classList.toggle('has-file', !!hasFile);
    if (hasFile){
      feedbackAttach.setAttribute('aria-label', `Photo ready to send: ${feedbackFile.files[0].name}`);
    } else {
      feedbackAttach.setAttribute('aria-label', 'Upload a photo');
    }
  };

  if (feedbackAttach && feedbackFile){
    feedbackAttach.addEventListener('click', ()=>{
      feedbackFile.click();
    });
    feedbackFile.addEventListener('change', syncAttachState);
  }

  feedbackForm?.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const text = (feedbackText?.value || '').trim();
    const files = feedbackFile?.files;
    if (!text && (!files || files.length === 0)){
      alert('Write a message or choose a photo.');
      return;
    }
    let image_path = null;
    try{
      if (feedbackSend){ feedbackSend.disabled = true; }
      if (files && files.length > 0){
        const file = files[0];
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        const folder = patientStorageFolder(me);
        const path = `${folder}/fb_${crypto.randomUUID?.() || Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('media').upload(path, file, { upsert: false });
        if (upErr){ throw upErr; }
        image_path = path;
      }
      const row = { user_id: me.id, author: 'patient', type: image_path ? 'image' : 'text', text: text || null, image_path, reply_to: null };
      const { error: insErr } = await supabase.from('feedback').insert(row);
      if (insErr){ throw insErr; }
      resetComposer();
      await renderPatientTimeline(me);
    } catch(err){
      console.error(err);
      alert('Could not submit your message. Please try again.');
    } finally {
      if (feedbackSend){ feedbackSend.disabled = false; }
    }
  });

  document.getElementById('logout-pt').onclick = async () => {
    await supabase.auth.signOut(); state.me = null; showOnly('#auth-section');
  };

  await renderPatientTimeline(me);
  const patientAppointments = await loadPatientAppointments(me.id);
  const upcoming = upcomingAppointments(patientAppointments);
  renderPatientNextAppointmentBanner(document.getElementById('pt-next-appointment'), upcoming[0] || null);
  renderPatientAppointmentsList(document.getElementById('pt-appointments'), upcoming);
}

async function renderPatientTimeline(me){
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', me.id)
    .order('created_at', { ascending: true });
  if (error){ console.error(error); return; }
  const wrap = document.getElementById('pt-timeline');
  const threads = buildFeedbackThreads(data || []);
  if (!threads.length){
    wrap.innerHTML = `<div class="placeholder muted">No updates yet. Start the conversation above.</div>`;
    return;
  }
  wrap.innerHTML = renderConversationThreads(threads, { viewer: 'patient' });
  wireReplyHandlers(wrap, {
    viewer: 'patient',
    targetUserId: me.id,
    refresh: ()=> renderPatientTimeline(me)
  });
}

// DOCTOR PAGE
async function showDoctorPage(me){
  showOnly('#doctor-page');
  const placeholder = document.getElementById('doc-patient-placeholder');
  const view = document.getElementById('doc-patient-view');
  if (placeholder){ placeholder.classList.remove('hidden'); placeholder.textContent = 'Select a patient from the list to view their profile.'; }
  if (view){ view.classList.add('hidden'); view.innerHTML = ''; }
  document.getElementById('logout-doc').onclick = async () => {
    await supabase.auth.signOut(); state.me = null; showOnly('#auth-section');
  };

  const welcomeTitle = document.getElementById('doc-welcome-title');
  if (welcomeTitle){
    const name = (me.fullname || '').trim();
    welcomeTitle.textContent = name ? `Welcome back, Dr. ${name}` : 'Welcome back';
  }
  const docDetails = document.getElementById('doc-details-card');
  if (docDetails){
    const myPhoneFormatted = formatPhoneDisplay(me.phone);
    const sinceIST = formatAppointmentDateTime(me.created_at || Date.now());
    docDetails.innerHTML = `
      <div><strong>Name:</strong> ${esc(me.fullname || '-')}</div>
      <div><strong>Employee ID:</strong> ${esc(me.employee_id || '-')}</div>
      <div><strong>Email:</strong> ${esc(me.email || '-')}</div>
      <div><strong>Phone:</strong> ${esc(myPhoneFormatted)}</div>
      <div><strong>Member since:</strong> ${esc(sinceIST.label)}</div>
    `;
  }

  await loadDoctorProfiles();
  state.appointments = await loadDoctorAppointments(me.id);

  const { data: patientsData, error } = await supabase
    .from('profiles')
    .select('id, fullname, patient_id, phone, email, assigned_doctor, assigned_doctor_employee_id')
    .eq('category', 'patient')
    .order('fullname', { ascending: true });
  if (error){ console.error(error); return; }

  const normalizedEmployeeId = normalizeId(me.employee_id);
  const assignedPatients = (patientsData || []).filter((p)=>{
    const assignedId = normalizeId(p.assigned_doctor_employee_id);
    if (normalizedEmployeeId){ return assignedId === normalizedEmployeeId; }
    const docName = (me.fullname || '').trim().toLowerCase();
    return docName && (p.assigned_doctor || '').trim().toLowerCase() === docName;
  });

  const patientCount = assignedPatients.length;
  const upcomingDoctorAppointments = upcomingAppointments(state.appointments);
  const appointmentCount = upcomingDoctorAppointments.length;

  const patientCountBadge = document.getElementById('kpi-patient-count');
  if (patientCountBadge){ patientCountBadge.textContent = patientCount.toString(); }
  const appointmentBadge = document.getElementById('kpi-appointment-count');
  if (appointmentBadge){ appointmentBadge.textContent = appointmentCount.toString(); }

  const subtitle = document.getElementById('doc-welcome-subtitle');
  if (subtitle){
    subtitle.textContent = patientCount
      ? `You currently manage ${patientCount} patient${patientCount === 1 ? '' : 's'}.`
      : 'No patients are currently assigned to you.';
  }

  const summaryCard = document.getElementById('doc-appointments-summary');
  if (summaryCard){
    summaryCard.innerHTML = renderAppointmentsSummary(state.appointments);
    summaryCard.classList.add('hidden');
  }
  const viewAppointmentsBtn = document.getElementById('kpi-view-appointments');
  if (viewAppointmentsBtn){
    viewAppointmentsBtn.textContent = 'View details';
    viewAppointmentsBtn.onclick = ()=>{
      if (!summaryCard){ return; }
      const hidden = summaryCard.classList.toggle('hidden');
      viewAppointmentsBtn.textContent = hidden ? 'View details' : 'Hide details';
    };
  }

  const ul = document.getElementById('doc-patient-list');
  ul.innerHTML = "";
  if (assignedPatients.length === 0){
    const empty = document.createElement('li');
    empty.innerHTML = `<span class="muted small">No patients have been assigned yet.</span>`;
    ul.appendChild(empty);
    return;
  }
  assignedPatients.forEach((p)=>{
    const li = document.createElement('li');
    const pid = p.patient_id ? `Patient ID: ${esc(p.patient_id)}` : 'Patient ID not set';
    li.innerHTML = `<div><strong>${esc(p.fullname)}</strong><div class="muted small">${pid}</div></div>`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn primary small';
    btn.textContent = 'View';
    btn.addEventListener('click', async ()=>{
      const isCurrent = state.selectedPatientId === p.id && !document.getElementById('doc-patient-view').classList.contains('hidden');
      if (isCurrent){
        const view = document.getElementById('doc-patient-view');
        const placeholder = document.getElementById('doc-patient-placeholder');
        view?.classList.add('hidden');
        if (placeholder){ placeholder.classList.remove('hidden'); placeholder.textContent = 'Select a patient from the list to view their profile.'; }
        state.selectedPatientId = null;
        btn.textContent = 'View';
      } else {
        await openPatientAsDoctor(p);
        state.selectedPatientId = p.id;
        ul.querySelectorAll('button').forEach((other)=>{
          if (other !== btn){ other.textContent = 'View'; }
        });
        btn.textContent = 'Hide';
      }
    });
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

async function openPatientAsDoctor(p){
  const placeholder = document.getElementById('doc-patient-placeholder');
  const view = document.getElementById('doc-patient-view');
  if (!view){ return; }
  if (placeholder){ placeholder.classList.add('hidden'); }
  view.classList.remove('hidden');
  view.innerHTML = `<div class="muted small">Loading patient record…</div>`;

  try{
    const [{ data: profile, error: profileErr }, { data: med, error: medErr }, { data: fb, error: fbErr }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', p.id).single(),
      supabase.from('medical').select('*').eq('user_id', p.id).maybeSingle(),
      supabase.from('feedback').select('*').eq('user_id', p.id).order('created_at', { ascending: true })
    ]);
    if (profileErr){ throw profileErr; }
    if (fbErr){ throw fbErr; }
    if (medErr){ console.error(medErr); }

    const assignedDoctorDisplay = profile?.assigned_doctor
      ? `${esc(profile.assigned_doctor)}${profile?.assigned_doctor_employee_id ? ` (${esc(profile.assigned_doctor_employee_id)})` : ''}`
      : '-';

    if (!state.doctorProfiles || state.doctorProfiles.length === 0){
      await loadDoctorProfiles();
    }
    const doctors = state.doctorProfiles || [];
    const options = ['<option value="">Select doctor</option>'];
    const seen = new Set();
    for (const doc of doctors){
      if (!seen.has(doc.employee_id)){
        options.push(`<option value="${esc(doc.employee_id)}">${esc(doc.full_name)} (${esc(doc.employee_id)})</option>`);
        seen.add(doc.employee_id);
      }
    }
    const currentAssignedId = normalizeId(profile?.assigned_doctor_employee_id || '');
    if (currentAssignedId && !seen.has(currentAssignedId) && profile?.assigned_doctor){
      options.push(`<option value="${esc(currentAssignedId)}">${esc(profile.assigned_doctor)} (${esc(currentAssignedId)})</option>`);
    }

    const threads = buildFeedbackThreads(fb || []);
    const conversationHtml = threads.length
      ? renderConversationThreads(threads, { viewer: 'doctor' })
      : `<div class="placeholder muted">No conversation yet. Encourage the patient to share an update.</div>`;
    const composerHtml = `
      <div class="chat-composer">
        <label class="lbl">New doctor note</label>
        <textarea id="doc-new-note" rows="3" placeholder="Start a new guidance note for this patient..."></textarea>
        <div class="composer-actions">
          <button type="button" id="doc-new-note-send" class="btn primary small">Send</button>
        </div>
      </div>`;

    const patientPhoneFormatted = formatPhoneDisplay(profile?.phone);
    const patientSince = profile?.created_at ? formatAppointmentDateTime(profile.created_at).label : '-';
    view.innerHTML = `
      <div class="doc-profile">
        <div class="details">
          <div><strong>Name:</strong> ${esc(profile?.fullname || '')}</div>
          <div><strong>Patient ID:</strong> ${esc(profile?.patient_id || '-')}</div>
          <div><strong>Assigned Doctor:</strong> ${assignedDoctorDisplay}</div>
          <div><strong>Phone:</strong> ${esc(patientPhoneFormatted)}</div>
          <div><strong>Email:</strong> ${esc(profile?.email || '-')}</div>
          <div><strong>Since:</strong> ${esc(patientSince)}</div>
        </div>
        <div class="doc-notes">
          <h5>History &amp; Treatment Notes</h5>
          <p class="muted small">Keep running notes for this patient's plan. Patients can read these notes but cannot edit them.</p>
          <textarea id="doc-history-input" rows="6" placeholder="Add treatment notes for future visits..."></textarea>
          <div class="row"><button id="doc-save-history" class="btn primary small">Save notes</button></div>
        </div>
        <div class="doc-reassign">
          <div>
            <strong>Reassign doctor</strong>
            <p class="muted small">Transfer this patient to another doctor. All existing records will remain linked to the patient.</p>
          </div>
          <select id="doc-reassign-select">${options.join('')}</select>
          <div class="doc-reassign-actions">
            <button id="doc-transfer-care" class="btn secondary small">Transfer care</button>
          </div>
        </div>
      </div>
      <div>
        <h5>Conversation</h5>
        <div class="timeline" id="doc-timeline">${conversationHtml}${composerHtml}</div>
      </div>
      <div class="schedule-card">
        <h5>Schedule appointment</h5>
        <div class="grid-2">
          <div>
            <label class="lbl" for="doc-appt-date">Date</label>
            <input type="date" id="doc-appt-date"/>
          </div>
          <div>
            <label class="lbl" for="doc-appt-time">Time</label>
            <input type="time" id="doc-appt-time"/>
          </div>
        </div>
        <label class="lbl" for="doc-appt-notes">Notes (optional)</label>
        <textarea id="doc-appt-notes" rows="3" placeholder="Share visit details, location, or preparation notes..."></textarea>
        <div class="row">
          <button type="button" id="doc-appt-submit" class="btn primary small">Schedule appointment</button>
        </div>
      </div>
    `;

    const historyInput = view.querySelector('#doc-history-input');
    if (historyInput){ historyInput.value = med?.history || ''; }

    const select = view.querySelector('#doc-reassign-select');
    if (select && currentAssignedId){ select.value = currentAssignedId; }

    const saveBtn = view.querySelector('#doc-save-history');
    saveBtn?.addEventListener('click', async ()=>{
      const history = (historyInput?.value || '').trim();
      const { data: upd, error: updErr } = await supabase.from('medical').update({ history }).eq('user_id', p.id).select('user_id').maybeSingle();
      if (updErr){ console.error(updErr); alert('Could not save history.'); return; }
      if (!upd){
        const { error: insErr } = await supabase.from('medical').insert({ user_id: p.id, history });
        if (insErr){ console.error(insErr); alert('Could not save history.'); return; }
      }
      alert('Notes updated.');
    });

    const transferBtn = view.querySelector('#doc-transfer-care');
    transferBtn?.addEventListener('click', async ()=>{
      const chosen = normalizeId(select?.value || '');
      if (!chosen){ alert('Select a doctor to transfer this patient to.'); return; }
      if (chosen === currentAssignedId){ alert('Patient is already assigned to this doctor.'); return; }
      const targetDoc = (state.doctorProfiles || []).find((doc)=> doc.employee_id === chosen);
      if (!targetDoc){ alert('Selected doctor is not available.'); return; }
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ assigned_doctor: targetDoc.full_name, assigned_doctor_employee_id: targetDoc.employee_id })
        .eq('id', p.id);
      if (updateErr){ console.error(updateErr); alert('Could not transfer patient.'); return; }
      alert(`Patient reassigned to Dr. ${targetDoc.full_name}.`);
      await showDoctorPage(state.me);
    });

    const timeline = view.querySelector('#doc-timeline');
    if (timeline){
      wireReplyHandlers(timeline, {
        viewer: 'doctor',
        targetUserId: p.id,
        refresh: ()=> openPatientAsDoctor(p)
      });
    }

    const newNoteBtn = view.querySelector('#doc-new-note-send');
    const newNoteField = view.querySelector('#doc-new-note');
    newNoteBtn?.addEventListener('click', async ()=>{
      if (!newNoteField){ return; }
      const note = (newNoteField.value || '').trim();
      if (!note){ alert('Write a note before sending.'); return; }
      newNoteBtn.disabled = true;
      try{
        const { error: insertErr } = await supabase.from('feedback').insert({
          user_id: p.id,
          author: 'doctor',
          type: 'text',
          text: note,
          reply_to: null
        });
        if (insertErr){ throw insertErr; }
        newNoteField.value = '';
        await openPatientAsDoctor(p);
      } catch(err){
        console.error(err);
        alert('Could not send note.');
      } finally {
        newNoteBtn.disabled = false;
      }
    });

    const scheduleBtn = view.querySelector('#doc-appt-submit');
    const scheduleDate = view.querySelector('#doc-appt-date');
    const scheduleTime = view.querySelector('#doc-appt-time');
    const scheduleNotes = view.querySelector('#doc-appt-notes');
    if (scheduleDate){
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const local = new Date(today.getTime() - offset * 60000);
      const isoDate = local.toISOString().split('T')[0];
      if (!scheduleDate.value){ scheduleDate.value = isoDate; }
      if (!scheduleDate.min){ scheduleDate.min = isoDate; }
    }
    scheduleBtn?.addEventListener('click', async ()=>{
      const date = scheduleDate?.value;
      const time = scheduleTime?.value;
      if (!date || !time){
        alert('Choose both a date and a time.');
        return;
      }
      const scheduledAt = new Date(`${date}T${time}`);
      if (Number.isNaN(scheduledAt.getTime())){
        alert('Invalid date or time.');
        return;
      }
      if (scheduledAt.getTime() < Date.now()){
        alert('Choose a future date and time.');
        return;
      }
      scheduleBtn.disabled = true;
      try{
        const notes = (scheduleNotes?.value || '').trim();
        const { error: insertErr } = await supabase.from('appointments').insert({
          doctor_id: state.me.id,
          patient_id: p.id,
          scheduled_at: scheduledAt.toISOString(),
          notes: notes || null
        });
        if (insertErr){ throw insertErr; }
        if (scheduleDate){ scheduleDate.value = ''; }
        if (scheduleTime){ scheduleTime.value = ''; }
        if (scheduleNotes){ scheduleNotes.value = ''; }
        state.appointments = await loadDoctorAppointments(state.me.id);
        const appointmentBadge = document.getElementById('kpi-appointment-count');
        if (appointmentBadge){
          appointmentBadge.textContent = upcomingAppointments(state.appointments).length.toString();
        }
        const summaryCard = document.getElementById('doc-appointments-summary');
        if (summaryCard){
          summaryCard.innerHTML = renderAppointmentsSummary(state.appointments);
        }
        alert('Appointment scheduled.');
      } catch(err){
        console.error(err);
        alert('Could not schedule appointment. Please try again.');
      } finally {
        scheduleBtn.disabled = false;
      }
    });

    const summaryCard = document.getElementById('doc-appointments-summary');
    if (summaryCard){
      summaryCard.innerHTML = renderAppointmentsSummary(state.appointments);
    }
  } catch(err){
    console.error(err);
    view.innerHTML = `<div class="placeholder">Unable to load patient record at the moment.</div>`;
  }
}
