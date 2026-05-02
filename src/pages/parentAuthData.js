export const STORAGE_KEY = 'compleros-template-parent-auth-form';

export const FORM = [
  { id:'info', num:1, title:'Child & Parent Information', type:'fields', fields:[
    {id:'childName', label:"Child's Full Name",           col:6, type:'text',  req:true},
    {id:'dob',       label:'Date of Birth',               col:3, type:'date',  req:true},
    {id:'classroom', label:'Classroom',                   col:3, type:'text'},
    {id:'p1Name',    label:'Parent/Guardian 1 Name',      col:6, type:'text',  req:true},
    {id:'p1Phone',   label:'Phone',                       col:3, type:'tel',   req:true},
    {id:'p1Email',   label:'Email',                       col:3, type:'email'},
    {id:'p2Name',    label:'Parent/Guardian 2 Name',      col:6, type:'text'},
    {id:'p2Phone',   label:'Phone',                       col:3, type:'tel'},
    {id:'p2Email',   label:'Email',                       col:3, type:'email'},
    {id:'enrollPeriod', label:'Program Year / Enrollment Period', col:6, type:'text'},
    {id:'formDate',  label:'Date',                        col:6, type:'date'},
  ]},
  { id:'photo', num:2, title:'Photo & Video Release', type:'auth', auths:[
    {id:'authPhoto', label:'Photograph and Video Consent', hasConditions:true,
     desc:'I grant permission for this program to photograph and/or video record my child during program activities. Images may be used for internal documentation, classroom displays, social media, marketing materials, and the program website. My child will not be identified by full name without separate written consent.'},
  ]},
  { id:'fieldtrip', num:3, title:'Field Trip Authorization', type:'auth', auths:[
    {id:'authFieldTrip', label:'Off-Site Field Trips and Excursions',
     desc:'I grant permission for my child to participate in supervised off-site field trips and excursions organized by the program. I understand that I will be notified in advance of each trip, including destination, date, and transportation method.'},
  ]},
  { id:'sunscreen', num:4, title:'Sunscreen & Insect Repellent', type:'auth', auths:[
    {id:'authSunscreen', label:'Application of Sunscreen',
     desc:'I grant permission for program staff to apply sunscreen (SPF 30 or higher) to my child before outdoor activities. I will provide sunscreen for my child, or authorize the program to use its supply.'},
    {id:'authInsect', label:'Application of Insect Repellent',
     desc:'I grant permission for program staff to apply insect repellent to my child when outdoor conditions warrant it. I will provide insect repellent for my child, or authorize the program to use its supply.'},
  ]},
  { id:'transport', num:5, title:'Transportation Authorization', type:'auth', auths:[
    {id:'authTransport', label:'Program-Provided Transportation',
     desc:'I grant permission for my child to be transported in program-operated or program-contracted vehicles for field trips, between program sites, or for other program-related purposes. All drivers meet DCF background screening requirements and vehicles are properly insured.'},
  ]},
  { id:'water', num:6, title:'Water Activities', type:'auth', auths:[
    {id:'authWater', label:'Supervised Water Activities',
     desc:'I grant permission for my child to participate in supervised water activities, including sprinkler play, water tables, and splash pads. Swimming pools require separate written authorization per DCF Rule 65C-22.008.'},
  ]},
  { id:'walking', num:7, title:'Walking Trips', type:'auth', auths:[
    {id:'authWalking', label:'Neighborhood Walking Trips',
     desc:'I grant permission for my child to participate in supervised walking trips in the immediate neighborhood of the program facility (e.g., walks to a nearby park, library, or nature area). Staff-to-child ratios will be maintained.'},
  ]},
  { id:'conditions', num:8, title:'Additional Conditions or Restrictions', type:'fields', fields:[
    {id:'addlConditions', label:'', col:12, type:'textarea',
     hint:'List any conditions, restrictions, or information the program should know about regarding these authorizations.'},
  ]},
];

// All auth IDs for completion calc
export const ALL_AUTH_IDS = FORM
  .filter(s => s.type === 'auth')
  .flatMap(s => s.auths.map(a => a.id));

export function calcCompletion(state) {
  const requiredFields = FORM.filter(s=>s.type==='fields')
    .flatMap(s=>s.fields.filter(f=>f.req).map(f=>f.id));
  const filledFields = requiredFields.filter(id => state[id] && String(state[id]).trim());
  const answeredAuths = ALL_AUTH_IDS.filter(id => state[id] === 'yes' || state[id] === 'no');
  const total = requiredFields.length + ALL_AUTH_IDS.length;
  const done  = filledFields.length + answeredAuths.length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function loadState() {
  try { const d = localStorage.getItem(STORAGE_KEY); if(d) return JSON.parse(d); } catch(e){}
  return {};
}

export function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e){}
}
