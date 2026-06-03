import React from 'react';
import { FileText, Activity, Beaker, Download } from 'lucide-react';

export default function RecordCard({ title, doctor, date, type }) {
  // Compute customized background and icon configurations depending on log file metrics
  const getIcon = () => {
    switch(type) {
      case 'scan': return { icon: Activity, styles: 'text-purple-500 bg-purple-50' };
      case 'lab': return { icon: Beaker, styles: 'text-emerald-500 bg-emerald-50' };
      default: return { icon: FileText, styles: 'text-sky-500 bg-sky-50' };
    }
  };

  const config = getIcon();

  return (
    <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-slate-200 transition-all group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`p-3 rounded-xl shrink-0 ${config.styles}`}>
          <config.icon size={18} />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate leading-snug group-hover:text-sky-600 transition-colors">{title}</h4>
          <span className="text-xs text-slate-400 mt-0.5 truncate">{doctor} • {date}</span>
        </div>
      </div>
      <button className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all shrink-0" title="Download Report">
        <Download size={14} />
      </button>
    </div>
  );
}
