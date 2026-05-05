import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ResetModal from '../components/ResetModal';
import { FORM, ALL_AUTH_IDS, calcCompletion, loadState, saveState } from './parentAuthData';

// ── Icons ──────────────────────────────────────────────────
const BackIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const RefreshIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const BlankIcon   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const PdfIcon     = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CheckIcon   = () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const LockIcon    = () => <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

// ── Yes / No toggle ────────────────────────────────────────
function YesNo({ value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 w-fit">
      {['yes','no'].map(opt => (
        <button key={opt}
          onClick={() => onChange(value === opt ? '' : opt)}
          className={`px-5 py-2 text-[12.5px] font-semibold transition-all capitalize
            ${value === opt
              ? opt === 'yes'
                ? 'bg-green-600 text-white'
                : 'bg-red-500 text-white'
              : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          {opt === 'yes' ? 'Yes, I grant permission' : 'No, I do not grant permission'}
        </button>
      ))}
    </div>
  );
}

// ── Auth section ───────────────────────────────────────────
function AuthSection({ section, state, onChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
        <span className="font-serif text-[13px] text-gold bg-gold-soft px-2.5 py-1 rounded-md">{section.num}</span>
        <h2 className="font-serif text-[20px] text-navy">{section.title}</h2>
      </div>
      {section.auths.map(auth => (
        <div key={auth.id} className="mb-6 last:mb-0">
          <p className="text-[13px] font-semibold text-navy mb-2">{auth.label}</p>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-4 bg-cream-warm rounded-lg p-3.5 border border-gray-100">
            {auth.desc}
          </p>
          <YesNo value={state[auth.id] || ''} onChange={v => onChange(auth.id, v)} />
          {auth.hasConditions && (
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-[0.5px]">
                Conditions or restrictions (optional)
              </label>
              <input type="text"
                value={state[auth.id + '_cond'] || ''}
                onChange={e => onChange(auth.id + '_cond', e.target.value)}
                placeholder="e.g., No social media use, internal documentation only"
                className="w-full bg-cream-warm border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 font-sans focus:outline-none focus:border-navy focus:bg-white transition-all" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Field section ──────────────────────────────────────────
function FieldSection({ section, state, onChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
        <span className="font-serif text-[13px] text-gold bg-gold-soft px-2.5 py-1 rounded-md">{section.num}</span>
        <h2 className="font-serif text-[20px] text-navy">{section.title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-3 sm:gap-y-4">
        {section.fields.map(f => (
          <div key={f.id} className="min-w-0" style={{gridColumn:`span ${f.col}`}}>
            {f.label && (
              <label className="block text-[11px] font-semibold text-navy tracking-[0.2px] mb-1.5">
                {f.label}{f.req && <span className="text-gold ml-0.5">*</span>}
              </label>
            )}
            {f.type === 'textarea' ? (
              <textarea rows={3} value={state[f.id]||''} onChange={e=>onChange(f.id,e.target.value)}
                placeholder={f.hint}
                className="w-full bg-cream-warm border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-gray-700 font-sans resize-y min-h-[80px] focus:outline-none focus:border-navy focus:bg-white transition-all" />
            ) : (
              <input type={f.type||'text'} value={state[f.id]||''} onChange={e=>onChange(f.id,e.target.value)}
                className="w-full bg-cream-warm border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-gray-700 font-sans focus:outline-none focus:border-navy focus:bg-white transition-all" />
            )}
            {f.hint && f.type !== 'textarea' && <p className="text-[10.5px] text-gray-400 italic mt-1">{f.hint}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PDF generation ─────────────────────────────────────────
async function getJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload=res; s.onerror=rej; document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

function fmtDate(d) {
  if (!d) return '';
  const p = d.split('-');
  if (p.length !== 3 || p[0].length !== 4) return '';
  return `${p[1]}/${p[2]}/${p[0]}`;
}

async function generatePDF(state) {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({orientation:'portrait',unit:'mm',format:'letter'});
  const PW=216, PH=279, ML=16, MR=16, MT=14, CW=216-32;
  const NAVY=[27,77,107], GOLD=[196,152,90], LIGHT=[248,246,241], BORDER=[220,215,205];
  const TEXT=[45,55,72], GRAY=[100,116,139];
  let y = MT;

  function checkPage(n=15) { if(y+n>PH-16){doc.addPage();y=MT;} }

  // Header
  doc.setFillColor(...NAVY); doc.rect(ML,y,CW,0.7,'F'); y+=4;
  doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.setTextColor(...NAVY);
  doc.text('Compleros', ML, y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...GOLD);
  doc.text('FAMILY & ENROLLMENT TEMPLATE', ML, y+9.5);
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...NAVY);
  doc.text('Parent Authorization Form', ML+CW, y+5, {align:'right'});
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(148,163,184);
  const today = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  doc.text(`Generated ${today}`, ML+CW, y+9.5, {align:'right'});
  y+=15; doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(ML,y,ML+CW,y); y+=6;

  // Child info box
  checkPage(30);
  const childName = state['childName'] || '';
  if (childName) {
    doc.setFillColor(...LIGHT); doc.rect(ML,y,CW,22,'F');
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.3); doc.rect(ML,y,CW,22,'S');
    const infoItems = [
      ['Child Name', childName], ['Date of Birth', fmtDate(state['dob'])],
      ['Classroom', state['classroom']||''], ['Guardian 1', state['p1Name']||''],
      ['Phone', state['p1Phone']||''], ['Form Date', fmtDate(state['formDate'])],
    ];
    infoItems.forEach((item, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const ix = ML + 4 + col * (CW/3), iy = y + 4 + row * 9;
      doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(...GOLD);
      doc.text(item[0].toUpperCase(), ix, iy);
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...TEXT);
      doc.text(item[1] || '—', ix, iy+4);
    });
    y += 26;
  }

  // Auth sections
  FORM.filter(s => s.type === 'auth').forEach(section => {
    checkPage(20);
    doc.setFillColor(...LIGHT); doc.rect(ML,y,CW,6,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...GOLD);
    doc.text(`${section.num}.`, ML+3, y+4);
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(...NAVY);
    doc.text(section.title.toUpperCase(), ML+10, y+4);
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.line(ML,y+6,ML+CW,y+6);
    y += 10;

    section.auths.forEach(auth => {
      checkPage(25);
      const answer = state[auth.id];

      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...NAVY);
      doc.text(auth.label, ML, y); y += 4;

      // Description
      doc.setFont('helvetica','italic'); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
      const descLines = doc.splitTextToSize(auth.desc, CW);
      doc.text(descLines, ML, y);
      y += descLines.length * 3 + 3;

      // Answer box
      checkPage(12);
      const answerText = answer === 'yes' ? '☑ Yes, I grant permission'
                       : answer === 'no'  ? '☒ No, I do not grant permission'
                       : '☐ Not yet answered';
      const ansClr = answer === 'yes' ? [46,125,50] : answer === 'no' ? [185,28,28] : [148,163,184];
      doc.setFillColor(answer==='yes'?232:answer==='no'?254:245, answer==='yes'?245:answer==='no'?226:245, answer==='yes'?233:answer==='no'?226:245);
      doc.rect(ML,y,CW,7,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...ansClr);
      doc.text(answerText, ML+4, y+4.5);
      y += 9;

      if (auth.hasConditions && state[auth.id+'_cond']) {
        doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(...GRAY);
        doc.text('Conditions: ' + state[auth.id+'_cond'], ML+2, y+3); y += 7;
      }
      y += 4;
    });
  });

  // Additional notes
  const notes = state['addlConditions'];
  if (notes && notes.trim()) {
    checkPage(18);
    doc.setFillColor(...LIGHT); doc.rect(ML,y,CW,5,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...NAVY);
    doc.text('8. ADDITIONAL CONDITIONS OR RESTRICTIONS', ML+3, y+3.5); y+=7;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...TEXT);
    const noteLines = doc.splitTextToSize(notes, CW);
    doc.text(noteLines, ML, y); y += noteLines.length * 3.5 + 4;
  }

  // Signature block
  checkPage(30);
  y += 4;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4); doc.line(ML,y,ML+CW,y); y+=6;
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...NAVY);
  doc.text('PARENT / GUARDIAN SIGNATURE', ML, y); y+=8;
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text('Signature', ML, y);
  doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
  doc.line(ML+20, y+0.5, ML+CW*0.6, y+0.5);
  doc.text('Date', ML+CW*0.65, y);
  doc.line(ML+CW*0.65+10, y+0.5, ML+CW, y+0.5);
  y+=10;
  doc.text('Printed Name', ML, y);
  doc.line(ML+24, y+0.5, ML+CW, y+0.5);

  // Footer
  const footY = PH-14;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4); doc.line(ML,footY,ML+CW,footY);
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(148,163,184);
  doc.text(`CMP-TMP-PAF-001 · Generated ${today} · Compleros`, ML, footY+4);
  doc.setFont('helvetica','bold'); doc.setTextColor(...GOLD);
  doc.text('compleros.com', ML+CW, footY+4, {align:'right'});

  const name = state['childName'] ? state['childName'].replace(/\s+/g,'_') : 'Form';
  doc.save(`Compleros_Parent_Auth_${name}_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Main page ──────────────────────────────────────────────
export default function ParentAuth() {
  const [state, setState]       = useState(() => loadState());
  const [saving, setSaving]     = useState(false);
  const [pdfLoading, setPdf]    = useState(false);
  const [resetOpen, setReset]   = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);
  const saveTimer = useRef(null);
  const completion = calcCompletion(state);

  useEffect(() => {
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveState(state); setSaving(false); }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const handleChange = useCallback((id, val) => {
    setState(prev => ({...prev, [id]: val}));
  }, []);

  const handleReset = () => {
    setState({});
    try { localStorage.removeItem('compleros-template-parent-auth-form'); } catch(e){}
    setReset(false);
  };

  const handlePDF = async () => {
    setPdf(true);
    try { await generatePDF(state); }
    catch(e) { console.error(e); alert('PDF generation failed. Please try again.'); }
    finally { setPdf(false); }
  };

  const handleBlankPDF = () => {
    const a = document.createElement('a');
    a.href = '/Compleros_Parent_Authorization_Form.pdf';
    a.download = 'Compleros_Parent_Authorization_Form.pdf';
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
            <span className="text-navy font-semibold">Parent Authorization Form</span>
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

          <div className="flex items-center gap-3">
            <span className="text-[12px] text-gray-400 font-medium hidden sm:block">Completion</span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all duration-300" style={{width:`${completion}%`}} />
            </div>
            <span className="text-[12px] font-semibold text-navy">{completion}%</span>
          </div>

          <div className="flex-1" />
          <button onClick={() => setReset(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <RefreshIcon /><span className="hidden sm:inline">Start Over</span>
          </button>
          <button onClick={handleBlankPDF} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-navy border border-gray-200 bg-white hover:border-navy hover:bg-navy-soft transition-all">
            <BlankIcon /><span className="hidden sm:inline">Blank PDF</span>
          </button>
          <button onClick={handlePDF} disabled={pdfLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-gold text-white hover:bg-[#B88A4E] disabled:opacity-60 transition-all">
            <PdfIcon /><span className="hidden sm:inline">{pdfLoading ? 'Generating…' : 'Download PDF'}</span><span className="sm:hidden">{pdfLoading ? '…' : 'PDF'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-9 max-w-[900px] w-full mx-auto pb-safe">
          <div className="mb-8 pb-7 border-b border-gray-100">
            <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-gold mb-3.5">Family & Enrollment Template</span>
            <h1 className="font-serif text-[26px] sm:text-[34px] text-navy leading-tight mb-3">Parent Authorization Form</h1>
            <p className="text-[13.5px] sm:text-[15px] text-gray-400 leading-relaxed">
              Complete one form per enrolled child per program year. For each authorization, select Yes or No.
              All authorizations are voluntary — declining any item will not affect your child's enrollment.
            </p>
            <div className="inline-flex items-center gap-2 mt-5 px-3.5 py-2 bg-cream-deep rounded-lg text-[11.5px] sm:text-[12.5px] text-gray-500 font-medium">
              <LockIcon />
              <span><strong className="text-navy font-semibold">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
            </div>
          </div>

          {FORM.map(section => (
            section.type === 'auth'
              ? <AuthSection   key={section.id} section={section} state={state} onChange={handleChange} />
              : <FieldSection  key={section.id} section={section} state={state} onChange={handleChange} />
          ))}

          <div className="bg-gradient-to-r from-cream to-cream-warm border border-gold/30 border-l-4 border-l-gold rounded-xl p-4 sm:p-6 mt-4">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2">Track this in Compleros</div>
            <p className="text-[13.5px] sm:text-[14.5px] text-navy-deep leading-relaxed">
              Track whether each child's authorization form is on file and current. Compleros tracks status, never records.
            </p>
          </div>
        </div>
      </main>

      <ResetModal open={resetOpen} onClose={() => setReset(false)} onConfirm={handleReset} />
    </div>
  );
}
