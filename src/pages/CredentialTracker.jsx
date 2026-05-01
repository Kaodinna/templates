import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import TrackerRow from '../components/TrackerRow';
import ResetModal from '../components/ResetModal';
import { emptyRow, loadRows, saveRows, getSummary } from '../utils';
import { generatePDF } from './credentialPdf';

// ── Icons ─────────────────────────────────────────────────
const CheckIcon = () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const RefreshIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const XlsxIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
const PdfIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const PlusIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const LockIcon = () => <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const BackIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

// ── SaveStatus ─────────────────────────────────────────────
function SaveStatus({ saving }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition-all
      ${saving
        ? 'bg-amber-50 border-amber-200/60 text-amber-700'
        : 'bg-green-50 border-green-200/60 text-green-700'}`}>
      {saving ? (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      ) : <CheckIcon />}
      <span>{saving ? 'Saving…' : 'All changes saved'}</span>
    </div>
  );
}

// ── SummaryPill ────────────────────────────────────────────
function Pill({ num, label, color }) {
  const colors = {
    default: 'bg-white border-gray-200 text-gray-600',
    green:   'bg-green-50 border-green-200/60 text-green-700',
    amber:   'bg-amber-50 border-amber-200/60 text-amber-700',
    red:     'bg-red-50 border-red-200/60 text-red-700',
  };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${colors[color || 'default']}`}>
      <span className="text-sm font-bold">{num}</span> {label}
    </span>
  );
}

// ── Main App ───────────────────────────────────────────────
export default function App() {
  const [rows, setRows] = useState(() => loadRows());
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const saveTimer = useRef(null);

  // Persist on change
  useEffect(() => {
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveRows(rows);
      setSaving(false);
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [rows]);

  const handleChange = useCallback((index, field, value) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }, []);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, emptyRow()]);
  }, []);

  const removeRow = useCallback((index) => {
    setRows(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index));
  }, []);

  const handleReset = () => {
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    try { localStorage.removeItem('compleros-staff-credential-tracker'); } catch (e) {}
    setResetOpen(false);
  };

  const handleXlsx = () => {
    // Serve the pre-built styled XLSX from /public
    const a = document.createElement('a');
    a.href = '/Compleros_Staff_Credential_Tracking_Sheet.xlsx';
    a.download = 'Compleros_Staff_Credential_Tracking_Sheet.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await generatePDF(rows); } catch (e) { alert('PDF generation failed. Please try again.'); }
    finally { setPdfLoading(false); }
  };

  const summary = getSummary(rows);

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — hidden on mobile, shown on lg+ */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeItem="templates" />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-cream-warm">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 lg:px-10 h-[68px] flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <a href="#" className="hidden sm:inline-flex items-center gap-1.5 text-gray-400 text-[13px] font-medium px-2.5 py-1.5 -ml-2.5 rounded-lg hover:text-navy hover:bg-cream-warm transition-all">
            <BackIcon /> Back
          </a>
          <nav className="flex items-center gap-2 text-[13px] text-gray-400">
            <span>Templates</span>
            <span className="text-gray-300">/</span>
            <span className="text-navy font-semibold">Staff Credential Tracking Sheet</span>
          </nav>
        </header>

        {/* Action bar */}
        <div className="bg-white border-b border-gray-200 px-6 lg:px-10 py-4 flex items-center gap-4 flex-wrap sticky top-0 z-10 shadow-sm">
          <SaveStatus saving={saving} />

          <div className="flex gap-2 flex-wrap">
            {summary.total > 0 && <Pill num={summary.total}    label="staff"    />}
            {summary.current  > 0 && <Pill num={summary.current}  label="current"  color="green" />}
            {summary.expiring > 0 && <Pill num={summary.expiring} label="expiring" color="amber" />}
            {summary.expired  > 0 && <Pill num={summary.expired}  label="expired"  color="red"   />}
          </div>

          <div className="flex-1" />

          <button onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <RefreshIcon /> <span className="hidden sm:inline">Start Over</span>
          </button>
          <button onClick={handleXlsx}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-navy border border-gray-200 bg-white hover:border-navy hover:bg-navy-soft transition-all">
            <XlsxIcon /> <span className="hidden sm:inline">Blank XLSX</span>
          </button>
          <button onClick={handlePDF} disabled={pdfLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-gold text-white hover:bg-[#B88A4E] disabled:opacity-60 transition-all">
            <PdfIcon /> <span>{pdfLoading ? 'Generating…' : 'Download PDF'}</span>
          </button>
        </div>

        {/* Page content */}
        <div className="px-6 lg:px-10 py-9 max-w-[1400px] w-full mx-auto pb-20">

          {/* Hero */}
          <div className="mb-8 pb-7 border-b border-gray-100">
            <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-gold mb-3.5">
              Staff Management Template
            </span>
            <h1 className="font-serif text-[34px] text-navy leading-tight mb-3">
              Staff Credential Tracking Sheet
            </h1>
            <p className="text-[15px] text-gray-400 leading-relaxed max-w-2xl">
              Enter each staff member's credentials and dates below. Status badges auto-calculate —
              green means current, yellow means expiring within 30 days, red means expired.
              The Level 2 screening expiration auto-fills at 5 years from the screening date.
            </p>
            <div className="inline-flex items-center gap-2 mt-5 px-3.5 py-2 bg-cream-deep rounded-lg text-[12.5px] text-gray-500 font-medium">
              <LockIcon />
              <span><strong className="text-navy font-semibold">Your work stays on this device.</strong> Compleros never sees or stores what you type here.</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-5">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th colSpan="3" className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 px-2.5 border-b border-gray-200 text-center">BASIC INFO</th>
                    <th colSpan="3" className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 px-2.5 border-b border-gray-200 text-center">BACKGROUND SCREENING</th>
                    <th colSpan="3" className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 px-2.5 border-b border-gray-200 text-center">CPR CERTIFICATION</th>
                    <th colSpan="3" className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 px-2.5 border-b border-gray-200 text-center">FIRST AID</th>
                    <th className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 px-2.5 border-b border-gray-200 text-center">45-HR</th>
                    <th colSpan="2" className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 px-2.5 border-b border-gray-200 text-center">ANNUAL IN-SERVICE</th>
                    <th className="bg-cream text-gold text-[9px] font-bold tracking-[1.5px] uppercase py-1.5 px-2.5 border-b border-gray-200 text-center">DIR.</th>
                    <th className="bg-cream py-1.5 border-b border-gray-200"></th>
                    <th className="bg-cream py-1.5 border-b border-gray-200 w-9"></th>
                  </tr>
                  <tr className="bg-navy text-white">
                    {['Staff Name','Role','Hire Date','Screening Date','Expiration','Status','Cert Date','Expiration','Status','Cert Date','Expiration','Status','Completed','Hours','Status','Cred?','Notes',''].map((h, i) => (
                      <th key={i} className="py-2.5 px-2.5 font-semibold text-[11px] tracking-[0.3px] text-center whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <TrackerRow
                      key={row.id}
                      row={row}
                      index={index}
                      onChange={handleChange}
                      onRemove={removeRow}
                      isOnly={rows.length === 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add row bar */}
            <div className="flex items-center justify-center p-3.5 border-t border-dashed border-gray-200">
              <button onClick={addRow}
                className="inline-flex items-center gap-2 bg-transparent border border-dashed border-gray-300 text-navy px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:border-gold hover:bg-gold-soft hover:text-gold transition-all">
                <PlusIcon /> Add Staff Member
              </button>
            </div>
          </div>

          {/* Callout */}
          <div className="bg-gradient-to-r from-cream to-cream-warm border border-gold/30 border-l-4 border-l-gold rounded-xl p-6">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-gold mb-2">Track this in Compleros</div>
            <p className="text-[14.5px] text-navy-deep leading-relaxed">
              With a Basic plan, Compleros automatically alerts you before any credential expires — 90, 60, 30, 14, and 7 days out. No more manual checking.
            </p>
          </div>
        </div>
      </main>

      <ResetModal open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={handleReset} />
    </div>
  );
}
