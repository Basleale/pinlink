import React from 'react';

export default function StatCard({ icon: Icon, iconColor, title, value, subtitle }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl shrink-0 ${iconColor}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-slate-400 truncate">{title}</span>
        <span className="text-2xl font-extrabold text-slate-800 mt-1 tracking-tight">{value}</span>
        <span className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</span>
      </div>
    </div>
  );
}