import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ResetModal from '../components/ResetModal';
import { TEMPLATE, loadState, saveState, calcProgress, sectionProgress } from './dcfChecklistData';

// ── Icons ─────────────────────────────────────────────────
const BackIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const RefreshIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const DocxIcon    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const PdfIcon     = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CheckIcon   = () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const LockIcon    = () => <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const FileIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const PenIcon     = () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

// ── Checkbox item ─────────────────────────────────────────
function CheckItem({ item, checked, onToggle }) {
  return (
    <div
      role="checkbox" tabIndex={0} aria-checked={checked}
      onClick={() => onToggle(item.id)}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), onToggle(item.id))}
      className={`flex items-start gap-3 sm:gap-3.5 px-2.5 sm:px-3.5 py-3 -mx-2.5 sm:-mx-3.5 rounded-lg cursor-pointer transition-all select-none hover:bg-cream-warm group ${checked ? 'opacity-70' : ''}`}>
      <div className={`w-[22px] h-[22px] rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all
        ${checked ? 'bg-gold border-gold' : 'border-gray-300 bg-white group-hover:border-gold-light'}`}>
        <svg className={`w-3.5 h-3.5 stroke-[3.5] text-white transition-all ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13.5px] sm:text-[14px] font-medium leading-snug transition-all ${checked ? 'line-through decoration-gold decoration-[1.5px] text-gray-400' : 'text-gray-700'}`}>
          {item.label}
        </p>
        {item.note && (
          <p className={`text-[12px] italic mt-0.5 leading-snug ${checked ? 'text-gray-300' : 'text-gray-400'}`}>
            {item.note}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────
function SectionCard({ section, state, onToggle, onNote }) {
  const sp = sectionProgress(section, state);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 sm:px-7 py-5 sm:py-6 mb-4 sm:mb-5 shadow-sm">
      <div className="pb-4 border-b border-gray-100 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
          <span className="font-serif text-[12px] sm:text-[13px] text-gold bg-gold-soft px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md whitespace-nowrap">
            Section {section.num}
          </span>
          {sp.complete ? (
            <span className="flex items-center gap-1 text-[11px] sm:text-[12px] font-semibold text-green-600 ml-auto whitespace-nowrap">
              <CheckIcon /> Complete
            </span>
          ) : (
            <span className="text-[11px] sm:text-[12px] font-semibold text-gray-400 ml-auto whitespace-nowrap">
              {sp.done} / {sp.total}
            </span>
          )}
        </div>
        <h2 className="font-serif text-[19px] sm:text-[22px] text-navy leading-tight mb-1">{section.title}</h2>
        <p className="text-[12.5px] sm:text-[13.5px] text-gray-400 italic leading-snug">{section.intro}</p>
      </div>
      <div className="space-y-0.5">
        {section.items.map(item => (
          <CheckItem key={item.id} item={item} checked={!!state.checked[item.id]} onToggle={onToggle} />
        ))}
      </div>
      <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-dashed border-gray-200">
        <label className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[1.2px] uppercase text-gray-400 mb-2">
          <PenIcon /> Notes for this section
        </label>
        <textarea
          value={state.notes[section.id] || ''}
          onChange={e => onNote(section.id, e.target.value)}
          placeholder="Add your own notes — reminders, deadlines, or documents you're still waiting on…"
          rows={2}
          className="w-full bg-cream-warm border border-gray-200 rounded-lg px-3 sm:px-3.5 py-2.5 text-[13px] text-gray-700 resize-y focus:outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/8 transition-all placeholder:text-gray-300 font-sans"
        />
      </div>
    </div>
  );
}

// ── PDF (unchanged — keep existing generatePDF function) ──
async function getJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

async function generatePDF(state) {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation:'portrait', unit:'mm', format:'letter' });
  const PW=216, PH=279, ML=16, MR=16, MT=14, CW=216-32;
  const NAVY=[27,77,107], GOLD=[196,152,90], LIGHT=[248,246,241], BORDER=[220,215,205];
  const TEXT=[45,55,72], GRAY=[100,116,139];
  let y = MT;
  function checkPage(needed=15) { if (y+needed>PH-16){doc.addPage();y=MT;} }

  doc.setFillColor(...NAVY); doc.rect(ML,y,CW,0.7,'F'); y+=4;
  doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.setTextColor(...NAVY);
  doc.text('Compleros', ML, y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...GOLD);
  doc.text('LICENSING & APPLICATION TEMPLATE', ML, y+9.5);
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...NAVY);
  doc.text('DCF Facility License Application Checklist', ML+CW, y+5, {align:'right'});
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(148,163,184);
  const today = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  doc.text(`Generated ${today}`, ML+CW, y+9.5, {align:'right'});
  y+=15; doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(ML,y,ML+CW,y); y+=5;

  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...GRAY);
  const introLines = doc.splitTextToSize(TEMPLATE.intro, CW);
  doc.text(introLines, ML, y); y+=introLines.length*3.5+5;

  checkPage(40);
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...NAVY);
  doc.text('PROGRAM INFORMATION', ML, y); y+=4;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4); doc.line(ML,y,ML+CW,y); y+=4;
  TEMPLATE.programInfo.forEach(f => {
    checkPage(9);
    const v = state.programInfo[f.id]||'';
    const colW = f.full ? CW : CW/2-2;
    doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(...NAVY);
    doc.text(f.label, ML, y);
    doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...TEXT);
    if(v) doc.text(v, ML, y+5);
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.25); doc.line(ML,y+6.5,ML+colW,y+6.5);
    y+=10;
  });
  y+=4;

  TEMPLATE.sections.forEach(section => {
    checkPage(20);
    const sp = sectionProgress(section, state);
    doc.setFillColor(...LIGHT); doc.rect(ML,y,CW,7,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...GOLD);
    doc.text(`SECTION ${section.num}`, ML+3, y+4.5);
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(...NAVY);
    doc.text(section.title, ML+24, y+4.5);
    const spLabel = sp.complete ? 'Complete ✓' : `${sp.done}/${sp.total}`;
    doc.setFont('helvetica','bold'); doc.setFontSize(7);
    doc.setTextColor(sp.complete?46:148, sp.complete?125:163, sp.complete?50:184);
    doc.text(spLabel, ML+CW, y+4.5, {align:'right'});
    y+=9;
    doc.setFont('helvetica','italic'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
    const introL = doc.splitTextToSize(section.intro, CW);
    doc.text(introL, ML, y); y+=introL.length*3+3;

    section.items.forEach(item => {
      checkPage(10);
      const checked = !!state.checked[item.id];
      if(checked){
        doc.setFillColor(...GOLD); doc.roundedRect(ML,y-0.5,4,4,0.8,0.8,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(255,255,255);
        doc.text('✓', ML+0.8, y+2.8);
      } else {
        doc.setDrawColor(...BORDER); doc.setLineWidth(0.3); doc.roundedRect(ML,y-0.5,4,4,0.8,0.8,'S');
      }
      doc.setFont('helvetica','normal'); doc.setFontSize(8);
      doc.setTextColor(checked?148:45, checked?163:55, checked?184:72);
      const labelLines = doc.splitTextToSize(item.label, CW-7);
      doc.text(labelLines, ML+6, y+2.5); y+=labelLines.length*3.5;
      if(item.note){
        doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(...GRAY);
        const noteLines = doc.splitTextToSize(item.note, CW-7);
        doc.text(noteLines, ML+6, y+1); y+=noteLines.length*3+1;
      }
      y+=2;
    });

    const note = state.notes[section.id];
    if(note&&note.trim()){
      checkPage(12);
      doc.setDrawColor(...GOLD); doc.setLineWidth(1.5);
      doc.line(ML,y,ML,y+8);
      doc.setFillColor(248,246,241); doc.rect(ML,y,CW,8,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(...GOLD);
      doc.text('NOTES', ML+3, y+3.5);
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...TEXT);
      const noteLines = doc.splitTextToSize(note, CW-8);
      doc.text(noteLines, ML+3, y+7); y+=noteLines.length*3+8;
    }
    y+=5;
  });

  checkPage(12);
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4); doc.line(ML,y,ML+CW,y); y+=4;
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(148,163,184);
  doc.text(`${TEMPLATE.docId} · Auto-generated from Compleros · ${today}`, ML, y);
  doc.setFont('helvetica','bold'); doc.setTextColor(...GOLD);
  doc.text('compleros.com', ML+CW, y, {align:'right'});
  doc.save(`Compleros_DCF_License_Checklist_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Main page ─────────────────────────────────────────────
export default function DCFChecklist() {
  const [state, setState]         = useState(() => loadState());
  const [saving, setSaving]       = useState(false);
  const [pdfLoading, setPdf]      = useState(false);
  const [resetOpen, setReset]     = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);
  const saveTimer = useRef(null);
  const progress = calcProgress(state);

  useEffect(() => {
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveState(state); setSaving(false); }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const handleToggle      = useCallback((id)     => setState(prev => ({ ...prev, checked: { ...prev.checked, [id]: !prev.checked[id] } })), []);
  const handleProgramInfo = useCallback((id, val) => setState(prev => ({ ...prev, programInfo: { ...prev.programInfo, [id]: val } })), []);
  const handleNote        = useCallback((id, val) => setState(prev => ({ ...prev, notes: { ...prev.notes, [id]: val } })), []);

  const handleReset = () => {
    setState({ programInfo:{}, checked:{}, notes:{} });
    try { localStorage.removeItem('compleros-template-dcf-license-checklist'); } catch(e){}
    setReset(false);
  };

  const handlePDF = async () => {
    setPdf(true);
    try { await generatePDF(state); }
    catch(e) { console.error(e); alert('PDF generation failed. Please try again.'); }
    finally { setPdf(false); }
  };

  const handleDocx = () => {
    const a = document.createElement('a');
    a.href = '/Compleros_DCF_License_Application_Checklist.docx';
    a.download = 'Compleros_DCF_License_Application_Checklist.docx';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebar(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeItem="templates" />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-cream-warm">

        {/* ── Topbar ── */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 h-[56px] sm:h-[68px] flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebar(true)} className="lg:hidden p-2 -ml-1 rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] text-gray-400 min-w-0">
            <span className="hidden sm:block">Resources</span>
            <span className="hidden sm:block text-gray-300">/</span>
            <span className="hidden sm:block">Templates</span>
            <span className="hidden sm:block text-gray-300">/</span>
            <span className="text-navy font-semibold truncate">DCF Facility License Application Checklist</span>
          </nav>
        </header>

        {/* ── Action bar ── */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-3 flex-wrap sticky top-0 z-10 shadow-sm">
          {/* Row 1: save status + progress (full width on mobile) */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all flex-shrink-0
            ${saving ? 'bg-amber-50 border-amber-200/60 text-amber-700' : 'bg-green-50 border-green-200/60 text-green-700'}`}>
            {saving
              ? <svg className="w-3 h-3 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <CheckIcon />}
            <span className="whitespace-nowrap">{saving ? 'Saving…' : 'Saved'}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-20 sm:w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-300" style={{ width:`${progress.pct}%` }} />
            </div>
            <span className="text-[12px] font-semibold text-navy whitespace-nowrap">{progress.done}/{progress.total}</span>
          </div>

          <div className="flex-1" />

          {/* Buttons — always in a row, labels hide on xs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setReset(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-lg text-[13px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-1.5">
              <RefreshIcon /><span className="hidden sm:inline">Start Over</span>
            </button>
            <button onClick={handleDocx}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-navy border border-gray-200 bg-white hover:border-navy hover:bg-navy-soft transition-all">
              <DocxIcon /><span className="hidden sm:inline">Blank DOCX</span><span className="sm:hidden">DOCX</span>
            </button>
            <button onClick={handlePDF} disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold bg-gold text-white hover:bg-[#B88A4E] disabled:opacity-60 transition-all">
              <PdfIcon /><span className="hidden sm:inline">{pdfLoading ? 'Generating…' : 'Download PDF'}</span>
              <span className="sm:hidden">{pdfLoading ? '…' : 'PDF'}</span>
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-9 max-w-[900px] w-full mx-auto pb-safe">

          {/* Hero */}
          <div className="mb-6 sm:mb-8 pb-6 sm:pb-7 border-b border-gray-100">
            <span className="inline-block text-[10px] sm:text-[11px] font-bold tracking-[2px] uppercase text-gold mb-3">{TEMPLATE.eyebrow}</span>
            <h1 className="font-serif text-[26px] sm:text-[34px] text-navy leading-tight mb-2 sm:mb-3">{TEMPLATE.title}</h1>
            <p className="text-[13.5px] sm:text-[15px] text-gray-400 leading-relaxed">{TEMPLATE.intro}</p>
            <div className="inline-flex items-center gap-2 mt-4 sm:mt-5 px-3 sm:px-3.5 py-2 bg-cream-deep rounded-lg text-[12px] text-gray-500 font-medium">
              <LockIcon />
              <span><strong className="text-navy font-semibold">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
            </div>
          </div>

          {/* Program info — single column on mobile, 2-col on sm+ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-7 mb-5 sm:mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 rounded-lg bg-navy-soft flex items-center justify-center text-navy flex-shrink-0"><FileIcon /></div>
              <h2 className="font-serif text-[18px] sm:text-[20px] text-navy">Program Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 sm:gap-y-4">
              {TEMPLATE.programInfo.map(f => (
                <div key={f.id} className={f.full ? 'sm:col-span-2' : ''}>
                  <label className="block text-[11px] sm:text-[12px] font-semibold text-navy mb-1.5 tracking-[0.2px]">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={state.programInfo[f.id] || ''}
                    onChange={e => handleProgramInfo(f.id, e.target.value)}
                    className="w-full bg-cream-warm border border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-[13px] sm:text-[13.5px] text-gray-700 font-sans focus:outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/8 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Checklist sections */}
          {TEMPLATE.sections.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              state={state}
              onToggle={handleToggle}
              onNote={handleNote}
            />
          ))}

          {/* Callout */}
          <div className="bg-gradient-to-r from-cream to-cream-warm border border-gold/30 border-l-4 border-l-gold rounded-xl p-5 sm:p-6 mt-4">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2">{TEMPLATE.callout.eyebrow}</div>
            <p className="text-[13.5px] sm:text-[14.5px] text-navy-deep leading-relaxed">{TEMPLATE.callout.body}</p>
          </div>
        </div>
      </main>

      <ResetModal open={resetOpen} onClose={() => setReset(false)} onConfirm={handleReset} />
    </div>
  );
}
