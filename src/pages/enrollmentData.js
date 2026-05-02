export const STORAGE_KEY = 'compleros-enrollment-checklist';

export const COLS = [
  { key:'ecf',       label:'Emergency\nContact',  group:'COMPLEROS TEMPLATES' },
  { key:'paf',       label:'Parent\nAuth',        group:'COMPLEROS TEMPLATES' },
  { key:'imm',       label:'Immunization\n(DH 680)', group:'STATE FORMS' },
  { key:'health',    label:'Health Exam\n(DH 3040)', group:'STATE FORMS' },
  { key:'birth',     label:'Birth\nCertificate',  group:'SUPPORTING DOCS' },
  { key:'residency', label:'Proof of\nResidency', group:'SUPPORTING DOCS' },
  { key:'custody',   label:'Custody /\nCourt Orders', group:'SUPPORTING DOCS' },
];

export const DOC_KEYS = COLS.map(c => c.key);

export const STATES = ['', 'on-file', 'missing', 'na'];
export const STATE_LABELS = { '':'—', 'on-file':'On File', 'missing':'Missing', 'na':'N/A' };

export function emptyRow() {
  return { id: Date.now() + Math.random(), name:'', enrolled:'',
    ecf:'', paf:'', imm:'', health:'', birth:'', residency:'', custody:'' };
}

export function getOverall(r) {
  if (!r.name.trim()) return '';
  const vals = DOC_KEYS.map(k => r[k]);
  if (vals.some(v => v === 'missing')) return 'incomplete';
  if (vals.filter(v => v === 'on-file').length >= 1) return 'complete';
  return '';
}

export function getSummary(rows) {
  const named = rows.filter(r => r.name.trim());
  return {
    total: named.length,
    complete: named.filter(r => getOverall(r) === 'complete').length,
    incomplete: named.filter(r => getOverall(r) === 'incomplete').length,
  };
}

export function loadRows() {
  try { const d = localStorage.getItem(STORAGE_KEY); if (d) return JSON.parse(d); } catch(e){}
  return [emptyRow(), emptyRow(), emptyRow()];
}

export function saveRows(rows) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch(e){}
}
