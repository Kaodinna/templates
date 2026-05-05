import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ResetModal from '../components/ResetModal';
import {
  COLS, DOC_KEYS, STATES, STATE_LABELS,
  emptyRow, getOverall, getSummary, loadRows, saveRows
} from './enrollmentData';

// ── Icons ──────────────────────────────────────────────────
const CheckIcon   = () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const BackIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const RefreshIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const XlsxIcon   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>;
const PdfIcon     = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const PlusIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const LockIcon    = () => <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const XIcon       = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ── Status toggle pill ─────────────────────────────────────
function StatusToggle({ value, onChange }) {
  const cycle = () => {
    const i = STATES.indexOf(value);
    onChange(STATES[(i + 1) % STATES.length]);
  };
  const cls = value === 'on-file'
    ? 'bg-green-50 border-green-200 text-green-700'
    : value === 'missing'
    ? 'bg-red-50 border-red-200 text-red-700'
    : value === 'na'
    ? 'bg-gray-100 border-gray-200 text-gray-400'
    : 'bg-white border-gray-200 text-gray-300 hover:border-gray-300';

  return (
    <button onClick={cycle}
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-all hover:scale-105 min-w-[64px] whitespace-nowrap ${cls}`}>
      {STATE_LABELS[value] || '—'}
    </button>
  );
}

// ── Overall badge ──────────────────────────────────────────
function OverallBadge({ status }) {
  if (!status) return <span className="text-gray-300 text-[11px]">—</span>;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap
      ${status === 'complete' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {status === 'complete' ? 'Complete' : 'Incomplete'}
    </span>
  );
}

// ── PDF generation ─────────────────────────────────────────
async function getJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

async function generatePDF(rows) {
  const filled = rows.filter(r => r.name.trim());
  if (!filled.length) { alert('Add at least one child before downloading the PDF.'); return; }
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation:'landscape', unit:'mm', format:'letter' });

  const PW=279, ML=8, MR=8, MT=10, CW=279-16;
  const NAVY=[27,77,107], GOLD=[196,152,90], WHITE=[255,255,255], LIGHT=[248,246,241], BORDER=[220,215,205];
  let y = MT;

  // Header
  doc.setFillColor(...NAVY); doc.rect(ML,y,CW,0.7,'F');
  y+=4;
  doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...NAVY);
  doc.text('Compleros', ML, y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...GOLD);
  doc.text('FAMILY & ENROLLMENT TEMPLATE', ML, y+9.5);
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...NAVY);
  doc.text('Child Enrollment Document Checklist', ML+CW, y+5, {align:'right'});
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(148,163,184);
  const today = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  doc.text(`Generated ${today} · ${filled.length} children`, ML+CW, y+9.5, {align:'right'});
  y+=15; doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(ML,y,ML+CW,y); y+=5;

  // Group headers
  const colW = [30, 16, ...COLS.map(() => 24), 18]; // name, enrolled, docs, overall
  const groups = [
    {label:'CHILD', span:2}, {label:'COMPLEROS TEMPLATES', span:2},
    {label:'STATE FORMS', span:2}, {label:'SUPPORTING DOCS', span:3}, {label:'OVERALL', span:1}
  ];
  let gx = ML;
  groups.forEach(g => {
    const gw = colW.slice(0, g.span).reduce((a,b)=>a+b,0);
    doc.setFillColor(...LIGHT); doc.rect(gx,y,gw,4,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(5.5); doc.setTextColor(...GOLD);
    doc.text(g.label, gx+gw/2, y+2.8, {align:'center'});
    gx += gw;
  });
  y += 4;

  // Column headers
  const allCols = ['Child Name','Enrolled',...COLS.map(c=>c.label.replace('\n',' ')),'Overall'];
  let cx = ML;
  allCols.forEach((h,i) => {
    doc.setFillColor(...NAVY); doc.rect(cx,y,colW[i],6,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(5.5); doc.setTextColor(...WHITE);
    doc.text(h, cx+colW[i]/2, y+3.8, {align:'center'});
    cx += colW[i];
  });
  y += 6;

  // Data rows
  const ROW_H = 8;
  filled.forEach((r, idx) => {
    const bg = idx % 2 === 0 ? WHITE : LIGHT;
    doc.setFillColor(...bg); doc.rect(ML,y,CW,ROW_H,'F');
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.12); doc.line(ML,y+ROW_H,ML+CW,y+ROW_H);

    const vals = [r.name, r.enrolled ? '✓' : '—', ...DOC_KEYS.map(k => STATE_LABELS[r[k]]||'—'), getOverall(r)||'—'];
    let cellX = ML;
    vals.forEach((v,i) => {
      const mid = cellX + colW[i]/2;
      const textY = y + ROW_H/2 + 1.5;
      doc.setFont('helvetica', i===0?'bold':'normal');
      doc.setFontSize(7);
      const color = v==='On File'?[46,125,50]:v==='Missing'||v==='Incomplete'?[185,28,28]:v==='Complete'?[46,125,50]:[45,55,72];
      doc.setTextColor(...color);
      doc.text(i===0 ? v.substring(0,22) : v, i===0 ? cellX+2 : mid, textY, i===0 ? {} : {align:'center'});
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.1);
      doc.line(cellX+colW[i],y,cellX+colW[i],y+ROW_H);
      cellX += colW[i];
    });
    y += ROW_H;
  });

  // Footer
  y += 6;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4); doc.line(ML,y,ML+CW,y); y+=4;
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(148,163,184);
  doc.text(`CMP-TMP-ECL-001 · Generated ${today} · Compleros`, ML, y);
  doc.setFont('helvetica','bold'); doc.setTextColor(...GOLD);
  doc.text('compleros.com', ML+CW, y, {align:'right'});

  doc.save(`Compleros_Enrollment_Checklist_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Main page ──────────────────────────────────────────────
export default function EnrollmentChecklist() {
  const [rows, setRows]         = useState(() => loadRows());
  const [saving, setSaving]     = useState(false);
  const [pdfLoading, setPdf]    = useState(false);
  const [resetOpen, setReset]   = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);
  const saveTimer = useRef(null);

  const summary = getSummary(rows);

  useEffect(() => {
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveRows(rows); setSaving(false); }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [rows]);

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? {...r, [field]: value} : r));
  }, []);

  const addRow = useCallback(() => setRows(prev => [...prev, emptyRow()]), []);
  const removeRow = useCallback((id) => {
    setRows(prev => prev.length <= 1 ? prev : prev.filter(r => r.id !== id));
  }, []);

  const handleReset = () => {
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    try { localStorage.removeItem('compleros-enrollment-checklist'); } catch(e){}
    setReset(false);
  };

  const handleXlsx = () => {
    const a = document.createElement('a');
    a.href = '/Compleros_Enrollment_Document_Checklist.xlsx';
    a.download = 'Compleros_Enrollment_Document_Checklist.xlsx';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebar(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeItem="templates" />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-cream-warm">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 lg:px-10 h-[56px] sm:h-[68px] flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebar(true)} className="lg:hidden p-2 -ml-1 rounded-lg flex-shrink-0 text-gray-400 hover:bg-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <a href="/" className="hidden sm:inline-flex items-center gap-1.5 text-gray-400 text-[13px] font-medium px-2.5 py-1.5 -ml-2.5 rounded-lg hover:text-navy hover:bg-cream-warm transition-all">
            <BackIcon /> Back
          </a>
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] text-gray-400 min-w-0">
            <span>Templates</span><span className="text-gray-300">/</span>
            <span className="text-navy font-semibold">Child Enrollment Document Checklist</span>
          </nav>
        </header>

        {/* Action bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 sm:gap-3 flex-wrap sticky top-0 z-10 shadow-sm">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition-all
            ${saving ? 'bg-amber-50 border-amber-200/60 text-amber-700' : 'bg-green-50 border-green-200/60 text-green-700'}`}>
            {saving
              ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <CheckIcon />}
            <span>{saving ? 'Saving…' : 'Saved'}</span>
          </div>

          {/* Summary pills */}
          <div className="flex gap-2 flex-wrap">
            {summary.total > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white">
                <span className="text-sm font-bold">{summary.total}</span> children
              </span>
            )}
            {summary.complete > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-200 bg-green-50 text-green-700">
                <span className="text-sm font-bold">{summary.complete}</span> complete
              </span>
            )}
            {summary.incomplete > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-red-200 bg-red-50 text-red-700">
                <span className="text-sm font-bold">{summary.incomplete}</span> incomplete
              </span>
            )}
          </div>

          <div className="flex-1" />
          <button onClick={() => setReset(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <RefreshIcon /><span className="hidden sm:inline">Start Over</span>
          </button>
          <button onClick={handleXlsx} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-navy border border-gray-200 bg-white hover:border-navy hover:bg-navy-soft transition-all">
            <XlsxIcon /><span className="hidden sm:inline">Blank XLSX</span>
          </button>
          <button onClick={() => generatePDF(rows).catch(console.error)} disabled={pdfLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-gold text-white hover:bg-[#B88A4E] disabled:opacity-60 transition-all">
            <PdfIcon /><span className="hidden sm:inline">{pdfLoading ? 'Generating…' : 'Download PDF'}</span><span className="sm:hidden">{pdfLoading ? '…' : 'PDF'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-9 max-w-[1400px] w-full mx-auto pb-safe">
          {/* Hero */}
          <div className="mb-8 pb-7 border-b border-gray-100">
            <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-gold mb-3.5">Family & Enrollment Template</span>
            <h1 className="font-serif text-[26px] sm:text-[34px] text-navy leading-tight mb-3">Child Enrollment Document Checklist</h1>
            <p className="text-[13.5px] sm:text-[15px] text-gray-400 leading-relaxed">
              Track enrollment document status for every child in your program. Click each status badge to cycle through: On File → Missing → N/A. The overall column reflects the worst-case status per child.
            </p>
            <div className="inline-flex items-center gap-2 mt-5 px-3.5 py-2 bg-cream-deep rounded-lg text-[11.5px] sm:text-[12.5px] text-gray-500 font-medium">
              <LockIcon />
              <span><strong className="text-navy font-semibold">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  {/* Group row */}
                  <tr>
                    <th colSpan={2} className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 text-center border-b border-gray-200">CHILD</th>
                    <th colSpan={2} className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 text-center border-b border-gray-200 border-l border-gray-100">COMPLEROS TEMPLATES</th>
                    <th colSpan={2} className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 text-center border-b border-gray-200 border-l border-gray-100">STATE FORMS</th>
                    <th colSpan={3} className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 text-center border-b border-gray-200 border-l border-gray-100">SUPPORTING DOCS</th>
                    <th className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 text-center border-b border-gray-200 border-l border-gray-100">OVERALL</th>
                    <th className="bg-cream border-b border-gray-200 w-8"></th>
                  </tr>
                  {/* Column headers */}
                  <tr className="bg-navy text-white">
                    <th className="py-2.5 px-3 font-semibold text-[11px] text-left min-w-[160px]">Child Name</th>
                    <th className="py-2.5 px-2 font-semibold text-[11px] text-center min-w-[70px]">Enrolled</th>
                    {COLS.map(c => (
                      <th key={c.key} className="py-2.5 px-2 font-semibold text-[10px] text-center min-w-[80px] leading-tight whitespace-pre-line">{c.label}</th>
                    ))}
                    <th className="py-2.5 px-2 font-semibold text-[11px] text-center min-w-[90px]">Status</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const overall = getOverall(row);
                    return (
                      <tr key={row.id} className="hover:bg-navy/[0.015] even:bg-cream/20 group">
                        <td className="p-1.5">
                          <input type="text" value={row.name}
                            onChange={e => updateRow(row.id, 'name', e.target.value)}
                            placeholder="Child's full name"
                            className="tracker-input font-medium min-w-[150px]" />
                        </td>
                        <td className="p-1.5 text-center">
                          <input type="checkbox" checked={!!row.enrolled}
                            onChange={e => updateRow(row.id, 'enrolled', e.target.checked)}
                            className="w-4 h-4 accent-gold cursor-pointer" />
                        </td>
                        {DOC_KEYS.map(key => (
                          <td key={key} className="p-1.5 text-center">
                            <StatusToggle value={row[key]} onChange={v => updateRow(row.id, key, v)} />
                          </td>
                        ))}
                        <td className="p-1.5 text-center"><OverallBadge status={overall} /></td>
                        <td className="p-1.5 w-8">
                          <button onClick={() => removeRow(row.id)} disabled={rows.length <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                            <XIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Add row */}
            <div className="flex items-center justify-center p-3.5 border-t border-dashed border-gray-200">
              <button onClick={addRow}
                className="inline-flex items-center gap-2 bg-transparent border border-dashed border-gray-300 text-navy px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:border-gold hover:bg-gold-soft hover:text-gold transition-all">
                <PlusIcon /> Add Child
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3 flex-wrap mb-6">
            {[['on-file','On File','bg-green-50 text-green-700 border-green-200'],['missing','Missing','bg-red-50 text-red-700 border-red-200'],['na','N/A','bg-gray-100 text-gray-400 border-gray-200']].map(([,label,cls])=>(
              <span key={label} className={`px-3 py-1 rounded-full text-[11px] font-bold border ${cls}`}>{label}</span>
            ))}
            <span className="text-[12px] text-gray-400 italic self-center">— click any badge to cycle through statuses</span>
          </div>

          {/* Callout */}
          <div className="bg-gradient-to-r from-cream to-cream-warm border border-gold/30 border-l-4 border-l-gold rounded-xl p-6">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2">Track this in Compleros</div>
            <p className="text-[13.5px] sm:text-[14.5px] text-navy-deep leading-relaxed">
              With a Basic plan, Compleros automatically alerts you when enrollment documents are missing or expired — across every child in your program. No more manual file checks.
            </p>
          </div>
        </div>
      </main>

      <ResetModal open={resetOpen} onClose={() => setReset(false)} onConfirm={handleReset} />
    </div>
  );
}
