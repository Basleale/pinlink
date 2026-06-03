import React from 'react';
import { Eye, Calendar } from 'lucide-react';

export default function AppointmentRow({ date, doctor, specialty, time, location, status, onView }) {
  const isConfirmed = status === 'Confirmed';
  
  return (
    <div 
      onClick={onView} 
      className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-slate-200 transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Date Icon Flag */}
        <div className="w-14 h-14 bg-sky-50/70 border border-sky-100 rounded-xl flex flex-col justify-center items-center shrink-0">
          <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">{date.split(' ')[0]}</span>
          <span className="text-base font-extrabold text-sky-700 leading-tight">{date.split(' ')[1]}</span>
        </div>
        
        {/* Appointment Details */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-800 truncate">{doctor}</h4>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{specialty}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-600">{time}</span>
            <span className="truncate hidden sm:inline">• &nbsp;{location}</span>
          </div>
        </div>
      </div>

      {/* Action and Badge status Container */}
      <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
          isConfirmed 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {status}
        </span>
        <button 
          onClick={onView} 
          className="p-2 text-slate-300 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all cursor-pointer"
          title="View Details"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}
