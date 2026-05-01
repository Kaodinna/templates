import React from 'react';
import StatusBadge from './StatusBadge';
import { calcDateStatus, calcScreenExp, calcInService, fmtDate } from '../utils';

function DateInput({ value, onChange, min }) {
  return (
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      className="tracker-input min-w-[130px]" />
  );
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`tracker-input ${className}`} />
  );
}

export default function TrackerRow({ row, index, onChange, onRemove, isOnly }) {
  const screenExp = calcScreenExp(row.screenDate);
  const screenSt  = calcDateStatus(screenExp);
  const cprSt     = calcDateStatus(row.cprExp);
  const faSt      = calcDateStatus(row.faExp);
  const isSt      = calcInService(row.inServiceHrs);

  const set = (field) => (val) => onChange(index, field, val);

  return (
    <tr className="hover:bg-navy/[0.02] even:bg-cream/30 even:hover:bg-navy/[0.03] group">
      {/* BASIC INFO */}
      <td className="p-1.5"><TextInput value={row.name} onChange={set('name')} placeholder="Full name" className="min-w-[150px] font-medium" /></td>
      <td className="p-1.5"><TextInput value={row.role} onChange={set('role')} placeholder="e.g. Lead Teacher" className="min-w-[120px]" /></td>
      <td className="p-1.5"><DateInput value={row.hireDate} onChange={set('hireDate')} /></td>

      {/* BACKGROUND SCREENING */}
      <td className="p-1.5"><DateInput value={row.screenDate} onChange={set('screenDate')} /></td>
      <td className="p-1.5 text-center text-xs text-gray-400 min-w-[100px]">{fmtDate(screenExp) || '—'}</td>
      <td className="p-1.5 min-w-[100px]"><StatusBadge status={screenSt} /></td>

      {/* CPR */}
      <td className="p-1.5"><DateInput value={row.cprDate} onChange={set('cprDate')} /></td>
      <td className="p-1.5"><DateInput value={row.cprExp} onChange={set('cprExp')} /></td>
      <td className="p-1.5 min-w-[100px]"><StatusBadge status={cprSt} /></td>

      {/* FIRST AID */}
      <td className="p-1.5"><DateInput value={row.faDate} onChange={set('faDate')} /></td>
      <td className="p-1.5"><DateInput value={row.faExp} onChange={set('faExp')} /></td>
      <td className="p-1.5 min-w-[100px]"><StatusBadge status={faSt} /></td>

      {/* 45-HR */}
      <td className="p-1.5"><DateInput value={row.training45} onChange={set('training45')} /></td>

      {/* IN-SERVICE */}
      <td className="p-1.5">
        <input type="number" min="0" max="100" step="0.5"
          value={row.inServiceHrs} onChange={e => set('inServiceHrs')(e.target.value)}
          placeholder="0"
          className="tracker-input min-w-[65px] text-center" />
      </td>
      <td className="p-1.5 min-w-[100px]"><StatusBadge status={isSt} /></td>

      {/* DIRECTOR CRED */}
      <td className="p-1.5">
        <select value={row.dirCred} onChange={e => set('dirCred')(e.target.value)}
          className="tracker-input min-w-[55px] cursor-pointer">
          <option value="">—</option>
          <option value="Y">Yes</option>
          <option value="N">No</option>
        </select>
      </td>

      {/* NOTES */}
      <td className="p-1.5">
        <TextInput value={row.notes} onChange={set('notes')} placeholder="Notes…" className="min-w-[160px]" />
      </td>

      {/* REMOVE */}
      <td className="p-1.5 w-9">
        <button onClick={() => !isOnly && onRemove(index)}
          disabled={isOnly}
          title="Remove"
          className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}
