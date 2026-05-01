import React from 'react';

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 mb-0.5 relative
    ${active
      ? 'bg-gold/10 text-white'
      : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
    {active && <span className="absolute -left-4 top-2 bottom-2 w-0.5 bg-gold rounded-r" />}
    <span className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-gold-light' : ''}`}>{icon}</span>
    <span>{label}</span>
  </div>
);

const icons = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  staff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  doc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="M9 12l2 2 4-4"/></svg>,
  folder: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  calc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/></svg>,
};

export default function Sidebar({ activeItem }) {
  return (
    <aside className="bg-navy w-[260px] flex flex-col py-6 relative overflow-hidden flex-shrink-0">
      {/* decorative glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196,152,90,0.10) 0%, transparent 70%)' }} />

      <div className="px-7 pb-7 border-b border-white/8 mb-4">
        <span className="block font-serif text-[30px] text-cream tracking-tight">Compleros</span>
        <span className="inline-block mt-2 text-[10px] font-bold tracking-[2px] uppercase text-gold-light bg-gold/10 border border-gold/25 px-2.5 py-0.5 rounded-full">
          Free Plan
        </span>
      </div>

      <div className="px-4 mb-5">
        <div className="text-[10px] font-bold tracking-[1.8px] uppercase text-white/40 px-3 pb-2.5">Workspace</div>
        <NavItem icon={icons.home}  label="Dashboard" />
        <NavItem icon={icons.staff} label="Staff" />
        <NavItem icon={icons.doc}   label="Licenses & Permits" />
        <NavItem icon={icons.bell}  label="Regulatory Updates" />
        <NavItem icon={icons.check} label="Mock Inspection" />
      </div>

      <div className="px-4 mb-5">
        <div className="text-[10px] font-bold tracking-[1.8px] uppercase text-white/40 px-3 pb-2.5">Resources</div>
        <NavItem icon={icons.folder} label="Templates" active={activeItem === "templates"} href="/" />
        <NavItem icon={icons.calc}   label="Ratio Calculator" />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 px-4 pt-4 mx-4 border-t border-white/10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
          SD
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-white truncate">Sunrise Learning Co.</div>
          <div className="text-[11px] text-white/50">Free · 1 location</div>
        </div>
      </div>
    </aside>
  );
}
