import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ResetModal from '../components/ResetModal';
import { FORM_SCHEMA, loadState, saveState, calcCompletion, generateECPDF } from './emergencyContactData';

// ── Icons ─────────────────────────────────────────────────
const BackIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const RefreshIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const PdfIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const CheckIcon = () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const LockIcon = () => <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const BlankIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

// ── Form field component ───────────────────────────────────
function FormField({ field, value, onChange }) {
  const base = "w-full bg-cream-warm border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] font-sans text-gray-700 transition-all focus:outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/8 hover:bg-cream-warm/80";

  const input = field.type === 'textarea'
    ? <textarea rows={3} value={value || ''} onChange={e => onChange(field.id, e.target.value)}
        className={`${base} resize-y min-h-[72px]`} />
    : <input type={field.type || 'text'} value={value || ''} onChange={e => onChange(field.id, e.target.value)}
        className={base} />;

  return (
    <div className={`col-span-${Math.min(field.col, 12)} min-w-0`} style={{ gridColumn: `span ${field.col}` }}>
      {field.label && (
        <label className="block text-[11px] font-semibold text-navy tracking-[0.2px] mb-1.5">
          {field.label}
          {field.required && <span className="text-gold ml-0.5">*</span>}
        </label>
      )}
      {input}
      {field.hint && <p className="text-[10.5px] text-gray-400 italic mt-1">{field.hint}</p>}
    </div>
  );
}

// ── Section component ──────────────────────────────────────
function FormSection({ section, state, onChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
        <span className="font-serif text-[13px] text-gold bg-gold-soft px-2.5 py-1 rounded-md">{section.num}</span>
        <h2 className="font-serif text-[20px] text-navy">{section.title}</h2>
      </div>
      {section.hint && (
        <p className="text-[12px] text-gray-400 italic mb-4 -mt-2">{section.hint}</p>
      )}

      {/* Regular fields */}
      {section.fields && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-3 sm:gap-y-4">
          {section.fields.map(f => (
            <FormField key={f.id} field={f} value={state[f.id]} onChange={onChange} />
          ))}
        </div>
      )}

      {/* Grouped fields (emergency contacts, authorized pickup) */}
      {section.groups && section.groups.map((g, gi) => (
        <div key={gi} className="mb-4">
          {g.label && (
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-2 mt-3">{g.label}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-3">
            {g.fields.map(f => (
              <FormField key={f.id} field={f} value={state[f.id]} onChange={onChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function EmergencyContact() {
  const [state, setState] = useState(() => loadState());
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const saveTimer = useRef(null);

  const completion = calcCompletion(state);

  useEffect(() => {
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveState(state);
      setSaving(false);
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const handleChange = useCallback((id, value) => {
    setState(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleReset = () => {
    setState({});
    try { localStorage.removeItem('compleros-template-emergency-contact-form'); } catch (e) {}
    setResetOpen(false);
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await generateECPDF(state); }
    catch (e) { console.error(e); alert('PDF generation failed. Please try again.'); }
    finally { setPdfLoading(false); }
  };

  const handleBlankPDF = () => {
    const a = document.createElement('a');
    a.href = '/Compleros_Emergency_Contact_Form.pdf';
    a.download = 'Compleros_Emergency_Contact_Form.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeItem="templates" />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-cream-warm">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 lg:px-10 h-[56px] sm:h-[68px] flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-1 rounded-lg flex-shrink-0 text-gray-400 hover:bg-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <a href="/" className="hidden sm:inline-flex items-center gap-1.5 text-gray-400 text-[13px] font-medium px-2.5 py-1.5 -ml-2.5 rounded-lg hover:text-navy hover:bg-cream-warm transition-all">
            <BackIcon /> Back
          </a>
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] text-gray-400 min-w-0">
            <span>Templates</span>
            <span className="text-gray-300">/</span>
            <span className="text-navy font-semibold">Emergency Contact Form</span>
          </nav>
        </header>

        {/* Action bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 sm:gap-3 flex-wrap sticky top-0 z-10 shadow-sm">
          {/* Save status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition-all
            ${saving ? 'bg-amber-50 border-amber-200/60 text-amber-700' : 'bg-green-50 border-green-200/60 text-green-700'}`}>
            {saving
              ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <CheckIcon />}
            <span>{saving ? 'Saving…' : 'Saved'}</span>
          </div>

          {/* Completion */}
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-gray-400 font-medium">Completion</span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-[12px] font-semibold text-navy">{completion}%</span>
          </div>

          <div className="flex-1" />

          <button onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <RefreshIcon /><span className="hidden sm:inline">Start Over</span>
          </button>
          <button onClick={handleBlankPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-navy border border-gray-200 bg-white hover:border-navy hover:bg-navy-soft transition-all">
            <BlankIcon /><span className="hidden sm:inline">Blank PDF</span>
          </button>
          <button onClick={handlePDF} disabled={pdfLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-gold text-white hover:bg-[#B88A4E] disabled:opacity-60 transition-all">
            <PdfIcon /><span className="hidden sm:inline">{pdfLoading ? 'Generating…' : 'Download PDF'}</span><span className="sm:hidden">{pdfLoading ? '…' : 'PDF'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-9 max-w-[900px] w-full mx-auto pb-safe">
          {/* Hero */}
          <div className="mb-8 pb-7 border-b border-gray-100">
            <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-gold mb-3.5">
              Family &amp; Enrollment Template
            </span>
            <h1 className="font-serif text-[26px] sm:text-[34px] text-navy leading-tight mb-3">Emergency Contact Form</h1>
            <p className="text-[13.5px] sm:text-[15px] text-gray-400 leading-relaxed">
              Complete one form per enrolled child. This form collects contact, pickup authorization, and custody restriction information only.
              Medical and health information must be collected on a separate form and stored outside of Compleros per HIPAA requirements.
            </p>
            <div className="inline-flex items-center gap-2 mt-5 px-3.5 py-2 bg-cream-deep rounded-lg text-[11.5px] sm:text-[12.5px] text-gray-500 font-medium">
              <LockIcon />
              <span><strong className="text-navy font-semibold">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
            </div>
          </div>

          {/* Form sections */}
          {FORM_SCHEMA.map(section => (
            <FormSection key={section.id} section={section} state={state} onChange={handleChange} />
          ))}

          {/* Upsell callout */}
          <div className="bg-gradient-to-r from-cream to-cream-warm border border-gold/30 border-l-4 border-l-gold rounded-xl p-4 sm:p-6 mt-4">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2">Track this in Compleros</div>
            <p className="text-[13.5px] sm:text-[14.5px] text-navy-deep leading-relaxed">
              Add each child to Compleros to track whether their emergency contact form is on file, current, and complete — without storing the actual form data. Compleros tracks status, never records.
            </p>
          </div>
        </div>
      </main>

      <ResetModal open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={handleReset} />
    </div>
  );
}
