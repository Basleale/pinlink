import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Filter 
} from 'lucide-react';
import axios from '../../api/axios.js';
import BookAppointmentModal from '../../components/modals/BookAppointmentModal';
import RescheduleAppointmentModal from '../../components/modals/RescheduleAppointmentModal';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // State to track calendar navigation (defaults to today's date)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const mockAppointment = {
    _id: 'mock-appointment-1',
    doctor: { name: 'Dr. Amina Kassa', specialty: 'Internal Medicine' },
    startTime: new Date(new Date().setHours(new Date().getHours() + 2, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 3, 0, 0, 0)).toISOString(),
    status: 'Confirmed',
    vistType: 'In-Person',
    location: 'Clinic Room 305',
    reason: 'Follow-up consultation',
    notes: 'Review blood test results and discuss medications.'
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/appointments');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setSelectedAppointment(null);
    setIsRescheduleModalOpen(false);
  };

  //UTILITY FORMATTING FUNCTIONS 
  const formatMonthStr = (dateObj) => {
    return dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };

  const formatDayNum = (dateObj) => {
    return dateObj.getDate().toString();
  };

  const formatHistoryDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const formatTimeRange = (startISO, endISO) => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getInitials = (name = "Doctor") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // CATEGORIZING DATA FROM STATE
  const now = new Date();

  const historyAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.startTime);
    return apptDate < now;
  }).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const nextApt = appointments
    .filter(appt => new Date(appt.startTime) >= now && appt.status !== 'Cancelled')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

  const formatNextAptText = () => {
    if (!nextApt) return "Next Apt: No upcoming appointments";
    const date = new Date(nextApt.startTime);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `Next Apt: ${dateStr} at ${timeStr}`;
  };

  // DYNAMIC STATS COUNTERS 
  const totalCount = appointments.length;
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  // DYNAMIC CALENDAR GENERATION
  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysHeader = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // First day of the targeted month (0 = Sunday, 1 = Monday...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Total days in the targeted month
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    // Total days in the prior month (for padding out the grid)
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];
    let currentWeek = [];

    // Fill out initial padding days from the previous month --NATI don't worry about this part, it's just UI refinement for the calender
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      currentWeek.push({
        dayNum: totalDaysInPrevMonth - i,
        isFaded: true,
        dateObj: new Date(year, month - 1, totalDaysInPrevMonth - i)
      });
    }

    // Fill out active days of this current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({
        dayNum: d,
        isFaded: false,
        dateObj: new Date(year, month, d)
      });
    }

    // Fill out trailing padding days for the next month to square the grid
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({
        dayNum: nextMonthDay,
        isFaded: true,
        dateObj: new Date(year, month + 1, nextMonthDay)
      });
      nextMonthDay++;
    }
    grid.push(currentWeek);

    // If calendar grid layout is short, fill out one extra row to maintain design uniformity
    if (grid.length < 5) {
      currentWeek = [];
      for (let i = 0; i < 7; i++) {
        currentWeek.push({
          dayNum: nextMonthDay,
          isFaded: true,
          dateObj: new Date(year, month + 1, nextMonthDay)
        });
        nextMonthDay++;
      }
      grid.push(currentWeek);
    }

    return (
      <div className="w-full">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-4 text-center">
          {daysHeader.map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-400 tracking-wider">{day}</div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-4 text-center text-sm font-medium text-slate-700">
          {grid.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              // Find if this date matches any fetched appointment
              const hasAppointmentOnDay = appointments.find(appt => {
                const apptDate = new Date(appt.startTime);
                return apptDate.getDate() === cell.dayNum &&
                       apptDate.getMonth() === cell.dateObj.getMonth() &&
                       apptDate.getFullYear() === cell.dateObj.getFullYear() &&
                       appt.status !== 'Cancelled';
              });

              const apptStatus = hasAppointmentOnDay?.status;
              const isCompleted = apptStatus === 'Completed';
              const isConfirmedOrRescheduled = apptStatus === 'Confirmed' || apptStatus === 'Rescheduled';
              const isPending = apptStatus === 'Pending';
              
              return (
                <div key={`${rIdx}-${cIdx}`} className="flex justify-center items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all text-xs
                    ${cell.isFaded ? 'text-slate-300' : ''}
                    ${isConfirmedOrRescheduled && !cell.isFaded ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-bold' : ''}
                    ${isCompleted && !cell.isFaded ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 font-bold' : ''}
                    ${isPending && !cell.isFaded ? 'bg-orange-100 text-orange-600 font-bold' : ''}
                    ${!hasAppointmentOnDay && !cell.isFaded ? 'hover:bg-slate-100 cursor-pointer' : ''}
                  `}>
                    {cell.dayNum}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center text-slate-500 font-medium animate-pulse">
        Loading appointments information...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto animate-fadeIn p-4 items-stretch lg:h-[calc(100vh-210px)] lg:min-h-[500px]">
      
      {/* COLUMN 1: Manage Apts Banner & Calendar */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full min-h-0">
        
        {/* 1. Manage Banner Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden shrink-0">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Manage Your Apts</h2>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed">
            Schedule, reschedule, or cancel your upcoming healthcare visits in one simple place.
          </p>
          <button 
            onClick={() => setIsBookingModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-4 py-3.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <PlusCircle size={16} />
            Schedule New Appointment
          </button>
        </div>

        {/* 2. Calendar Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col flex-1 min-h-0 justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                {currentCalendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {renderCalendar()}
            </div>
          </div>
          
          {/* Cool Next Appointment Indicator */}
          <div className="pt-4 border-t border-slate-100 mt-4 shrink-0 text-center">
            <span className="text-[11px] font-bold text-sky-600 bg-sky-50/60 px-3.5 py-1.5 rounded-full inline-block">
              {formatNextAptText()}
            </span>
          </div>
        </div>

      </div>

      {/* COLUMN 2: Stats Cards & Appointment History */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
        
        {/* STATS Cards Row */}
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
              <CalendarIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 mb-0.5">Total</p>
              <h3 className="text-xl font-extrabold text-slate-800 leading-none">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 mb-0.5">Pending</p>
              <h3 className="text-xl font-extrabold text-slate-800 leading-none">
                {pendingCount < 10 ? `0${pendingCount}` : pendingCount}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 mb-0.5">Completed</p>
              <h3 className="text-xl font-extrabold text-slate-800 leading-none">{completedCount}</h3>
            </div>
          </div>
        </div>

        {/* Appointment History Table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-lg font-bold text-slate-800">Appointment History</h3>
            <button className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700">
              <Filter size={14} /> Filter
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 sticky top-0 z-10">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialty</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {historyAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium">
                        No past appointment records found.
                      </td>
                    </tr>
                  ) : (
                    historyAppointments.map((hist) => {
                      const docName = hist.doctor?.firstName 
                        ? `Dr. ${hist.doctor.firstName} ${hist.doctor.lastName}` 
                        : hist.doctor?.name || "Doctor";
                      const specialty = hist.doctor?.department || hist.doctor?.specialty || "General Medicine";
                      return (
                        <tr key={hist._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                            {formatHistoryDate(new Date(hist.startTime))}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {getInitials(docName)}
                              </div>
                              <span className="font-semibold text-slate-700 whitespace-nowrap">{docName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                            {specialty}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                            {hist.location || "Online"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border 
                              ${hist.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : hist.status === 'Pending'
                                ? 'bg-orange-50 text-orange-600 border-orange-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                            >
                              {hist.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* BOOK APPOINTMENT MODAL */}
      <BookAppointmentModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        onSuccess={fetchAppointments}
      />

      <RescheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={closeRescheduleModal}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}