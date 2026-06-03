import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function QuickActionCard({ icon: Icon, iconColor, title, description, onClick }) {
  return (
    <button onClick={onClick} className="w-full bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between text-left shadow-sm hover:border-sky-200 hover:shadow-md hover:shadow-sky-500/5 transition-all group">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`p-2.5 rounded-xl shrink-0 ${iconColor}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-800 transition-colors group-hover:text-sky-600">{title}</span>
          <span className="text-xs text-slate-400 mt-0.5 truncate">{description}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
    </button>
  );
}
