import React from 'react';

const CONFIG = {
  current:     'bg-green-50 text-green-800 border border-green-200',
  expiring:    'bg-amber-50 text-amber-800 border border-amber-200',
  expired:     'bg-red-50 text-red-800 border border-red-200',
  complete:    'bg-green-50 text-green-800 border border-green-200',
  'in-progress':'bg-amber-50 text-amber-800 border border-amber-200',
  empty:       'bg-cream-warm text-gray-400',
};

export default function StatusBadge({ status }) {
  const cls = CONFIG[status.cls] || CONFIG.empty;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide text-center w-full whitespace-nowrap ${cls}`}>
      {status.label}
    </span>
  );
}
