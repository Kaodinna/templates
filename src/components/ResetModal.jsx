import React from 'react';

export default function ResetModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-navy-deep/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="font-serif text-[22px] text-navy mb-2.5">Start over?</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          This clears all staff data from this template on this device. This action cannot be undone.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-navy border border-gray-200 hover:border-navy hover:bg-navy-soft transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all">
            Yes, start over
          </button>
        </div>
      </div>
    </div>
  );
}
