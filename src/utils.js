// ── Date & status utilities ──────────────────────────────

export const STORAGE_KEY = 'compleros-staff-credential-tracker';

export function emptyRow() {
  return {
    id: Date.now() + Math.random(),
    name: '', role: '', hireDate: '',
    screenDate: '', cprDate: '', cprExp: '',
    faDate: '', faExp: '', training45: '',
    inServiceHrs: '', dirCred: '', notes: '',
  };
}

export function calcScreenExp(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear() + 5}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function calcDateStatus(expStr) {
  if (!expStr) return { label: '—', cls: 'empty' };
  const exp = new Date(expStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = (exp - today) / 86400000;
  if (diff < 0)  return { label: 'EXPIRED',  cls: 'expired' };
  if (diff < 30) return { label: 'EXPIRING', cls: 'expiring' };
  return { label: 'CURRENT', cls: 'current' };
}

export function calcInService(hrs) {
  if (hrs === '' || hrs === undefined || hrs === null) return { label: '—', cls: 'empty' };
  const h = parseFloat(hrs);
  if (isNaN(h)) return { label: '—', cls: 'empty' };
  if (h >= 10) return { label: 'COMPLETE', cls: 'complete' };
  if (h > 0)   return { label: 'IN PROG',  cls: 'in-progress' };
  return { label: '—', cls: 'empty' };
}

export function fmtDate(d) {
  if (!d) return '';
  const p = d.split('-');
  if (p.length !== 3) return '';
  const [yr, mo, day] = p;
  if (yr.length !== 4 || parseInt(yr) < 1900 || parseInt(yr) > 2200) return '';
  return `${mo}/${day}/${yr}`;
}

export function loadRows() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    if (d) return JSON.parse(d);
  } catch (e) {}
  return [emptyRow(), emptyRow(), emptyRow()];
}

export function saveRows(rows) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch (e) {}
}

export function getSummary(rows) {
  const filled = rows.filter(r => r.name.trim());
  let current = 0, expiring = 0, expired = 0;
  filled.forEach(r => {
    const screenExp = calcScreenExp(r.screenDate);
    [calcDateStatus(screenExp), calcDateStatus(r.cprExp), calcDateStatus(r.faExp)].forEach(s => {
      if (s.cls === 'current')  current++;
      if (s.cls === 'expiring') expiring++;
      if (s.cls === 'expired')  expired++;
    });
  });
  return { total: filled.length, current, expiring, expired };
}
