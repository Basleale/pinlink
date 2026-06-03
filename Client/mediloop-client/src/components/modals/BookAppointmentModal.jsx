import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, Star, CheckCircle2, ChevronLeft, ChevronRight, FileText, AlignLeft } from 'lucide-react';
import axios from '../../api/axios.js';

// -- Time Slider Helpers --
const SLOT_START = 8; // 8:00 AM
const SLOT_END = 17;  // 5:00 PM
const TOTAL_SLOTS = (SLOT_END - SLOT_START) * 2; // 30-min increments

const slotToTime = (slot) => {
  const totalMinutes = SLOT_START * 60 + slot * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const getDateFromSlot = (dateObj, slot) => {
  if (!dateObj) return null;
  const { year, month, day } = dateObj;
  const totalMinutes = SLOT_START * 60 + slot * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return new Date(year, month, day, hours, minutes, 0, 0);
};

const getInitials = (firstName = "", lastName = "") => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const [formData, setFormData] = useState({
    doctorId: '',
    date: null,
    startSlot: 2,   // default 9:00 AM
    endSlot: 4,     // default 10:00 AM
    visitType: 'In-Person',
    reason: '',
    notes: ''
  });
  const trackRef = useRef(null);
  const dragging = useRef(null); // 'start' | 'end' | null

  // Calendar State (Current month)
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch doctors on modal open
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset states
    setStep(1);
    setShowSuccess(false);
    setBookingError(null);
    setFormData({
      doctorId: '',
      date: null,
      startSlot: 2,
      endSlot: 4,
      visitType: 'In-Person',
      reason: '',
      notes: ''
    });

    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await axios.get('/doctor');
        if (response.data?.success) {
          setDoctors(response.data.doctors || []);
        } else {
          console.error('Doctor fetch returned unsuccessful response:', response.data);
          setBookingError(response.data?.message || 'Failed to load doctors list. Please try again.');
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setBookingError(err.response?.data?.message || "Failed to load doctors list. Please try again.");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setBookingError(null);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Validation checks
  const getValidationErrors = () => {
    const errors = {};
    if (!formData.doctorId) {
      errors.doctor = 'Please select a healthcare provider.';
    }
    if (!formData.date) {
      errors.date = 'Please select an appointment date.';
    } else {
      const selectedStart = getDateFromSlot(formData.date, formData.startSlot);
      if (selectedStart < new Date()) {
        errors.time = 'Appointment time cannot be in the past.';
      }
    }
    const durationSlots = formData.endSlot - formData.startSlot;
    if (durationSlots !== 1 && durationSlots !== 2) {
      errors.duration = 'Appointments must be exactly 30 or 60 minutes long.';
    }
    if (!formData.reason || !formData.reason.trim()) {
      errors.reason = 'Please enter a reason for the visit.';
    }
    return errors;
  };

  const errors = getValidationErrors();
  const isSubmitDisabled = Object.keys(errors).length > 0 || isBooking;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = getValidationErrors();
    if (Object.keys(validationErrors).length > 0) {
      setBookingError(validationErrors.time || validationErrors.duration || validationErrors.reason || 'Please correct the errors before booking.');
      return;
    }

    try {
      setIsBooking(true);
      setBookingError(null);
      const startDateTime = getDateFromSlot(formData.date, formData.startSlot);
      const endDateTime = getDateFromSlot(formData.date, formData.endSlot);

      const response = await axios.post('/appointments', {
        doctor: formData.doctorId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reason: formData.reason.trim(),
        vistType: formData.visitType,
        location: formData.visitType === 'In-Person' ? 'Main Clinic Room 305' : 'Telehealth Video Session',
        notes: formData.notes?.trim()
      });

      if (response.data.success) {
        setShowSuccess(true);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleDismissSuccess = () => {
    setShowSuccess(false);
    setStep(1);
    setFormData({ doctorId: '', date: null, startSlot: 2, endSlot: 4, visitType: 'In-Person', reason: '', notes: '' });
    if (onSuccess) onSuccess();
    onClose();
  };

  // -- Calendar Logic --
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isDayAvailable = (day) => {
    const dateObj = new Date(year, month, day);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
    return !isWeekend && !isPast;
  };

  const selectedProvider = doctors.find(p => p._id === formData.doctorId);

  // -- Slider drag logic --
  const getSlotFromX = useCallback((clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * TOTAL_SLOTS);
  }, []);

  if (!isOpen) return null;

  const handlePointerDown = (handle) => (e) => {
    e.preventDefault();
    dragging.current = handle;
    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const slot = getSlotFromX(clientX);
      setFormData(prev => {
        if (handle === 'start') {
          return { ...prev, startSlot: Math.min(slot, prev.endSlot - 1) };
        } else {
          return { ...prev, endSlot: Math.max(slot, prev.startSlot + 1) };
        }
      });
    };
    const onUp = () => {
      dragging.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  const startPct = (formData.startSlot / TOTAL_SLOTS) * 100;
  const endPct = (formData.endSlot / TOTAL_SLOTS) * 100;
  const durationMinutes = (formData.endSlot - formData.startSlot) * 30;
  const durationLabel = durationMinutes >= 60 
    ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60 ? durationMinutes % 60 + 'min' : ''}`.trim()
    : `${durationMinutes} min`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">

      {/* Success Modal */}
      {showSuccess && (
        <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl animate-slideUp text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle2 size={44} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Booked!</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xs">Your appointment has been successfully scheduled.</p>
          <button
            onClick={handleDismissSuccess}
            className="mt-8 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* Main Wizard Modal */}
      {!showSuccess && (
        <div className="bg-white rounded-[32px] w-full max-w-[900px] shadow-2xl relative animate-slideUp my-auto overflow-hidden border border-white flex flex-col">
        
        {/* Header & Progress */}
        <div className="bg-white px-8 pt-8 pb-6 border-b border-slate-100 relative z-10">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full cursor-pointer">
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule an Appointment</h2>
          <p className="text-sm text-slate-500 mt-1">Book your appointment in three easy steps</p>

          {/* Progress Bar */}
          <div className="mt-8 flex items-center max-w-3xl">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <span className={`text-sm font-semibold ${step >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Select Provider</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 transition-colors ${step >= 2 ? 'bg-sky-600' : 'bg-slate-200'}`}></div>
            
            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <span className={`text-sm font-semibold ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>Choose Date</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 transition-colors ${step >= 3 ? 'bg-sky-600' : 'bg-slate-200'}`}></div>
            
            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 3 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
              <span className={`text-sm font-semibold ${step >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>Pick Time & Confirm</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex flex-col flex-1 p-8 relative z-0 overflow-y-auto max-h-[70vh]">
          
          {/* Main Form Area */}
          <div className="flex-1 bg-white">
            
            {/* STEP 1: Select Provider */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Select a Healthcare Provider</h3>
                
                {loadingDoctors ? (
                  <div className="text-center p-12 text-slate-500 font-medium animate-pulse">
                    Loading medical providers...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center p-12 border border-dashed rounded-2xl text-slate-400 font-medium">
                    No active medical providers found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((provider) => (
                      <div 
                        key={provider._id}
                        onClick={() => handleChange('doctorId', provider._id)}
                        className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.doctorId === provider._id 
                            ? 'border-sky-500 bg-sky-50/30 shadow-md shadow-sky-500/10' 
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-extrabold text-lg shrink-0">
                          {getInitials(provider.firstName, provider.lastName)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Dr. {provider.firstName} {provider.lastName}</h4>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{provider.department || provider.specialization || "General Medicine"}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-slate-700">{provider.rating || '4.8'}</span>
                          </div>
                        </div>
                        {formData.doctorId === provider._id && (
                          <CheckCircle2 className="absolute top-4 right-4 text-sky-600" size={20} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Choose Date */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Select an Available Date</h3>
                
                {/* Calendar Wrapper */}
                <div className="max-w-md mx-auto border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"><ChevronLeft size={20}/></button>
                    <span className="font-bold text-slate-800">{monthNames[month]} {year}</span>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"><ChevronRight size={20}/></button>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-2 gap-x-2">
                      {/* Empty slots */}
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-10"></div>
                      ))}
                      
                      {/* Days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const available = isDayAvailable(day);
                        const isSelected = formData.date?.day === day && formData.date?.month === month && formData.date?.year === year;

                        return (
                          <button 
                            key={day}
                            type="button"
                            disabled={!available}
                            onClick={() => handleChange('date', { day, month, year })}
                            className={`
                              h-10 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all cursor-pointer
                              ${!available ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' : ''}
                              ${available && !isSelected ? 'text-slate-700 hover:bg-sky-50 hover:text-sky-700' : ''}
                              ${isSelected ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold' : ''}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Pick Time, Details & Summary */}
            {step === 3 && (
              <div className="animate-fadeIn flex flex-col lg:flex-row gap-8">
                
                {/* Left Side: Time and Details */}
                <div className="flex-1 space-y-8">
                  {/* Time Range Slider */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">Select Appointment Time</h3>
                    <p className="text-sm text-slate-500 mb-6">Drag the handles to set your start and end time.</p>

                    {/* Display Start / End / Duration */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 text-center">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Start</span>
                        <span className="text-base font-extrabold text-sky-700">{slotToTime(formData.startSlot)}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</span>
                        <span className="text-sm font-bold text-slate-700">{durationLabel}</span>
                      </div>
                      <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 text-center">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">End</span>
                        <span className="text-base font-extrabold text-sky-700">{slotToTime(formData.endSlot)}</span>
                      </div>
                    </div>

                    {/* Custom Dual-Handle Slider */}
                    <div className="relative select-none" style={{ touchAction: 'none' }}>
                      {/* Track */}
                      <div ref={trackRef} className="relative w-full h-2 bg-slate-200 rounded-full">
                        {/* Active Range */}
                        <div
                          className="absolute top-0 h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                        />
                      </div>

                      {/* Start Handle */}
                      <div
                        onMouseDown={handlePointerDown('start')}
                        onTouchStart={handlePointerDown('start')}
                        className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 rounded-full bg-white border-[3px] border-sky-500 shadow-lg shadow-sky-500/20 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
                        style={{ left: `${startPct}%`, top: '4px' }}
                      />

                      {/* End Handle */}
                      <div
                        onMouseDown={handlePointerDown('end')}
                        onTouchStart={handlePointerDown('end')}
                        className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 rounded-full bg-white border-[3px] border-sky-500 shadow-lg shadow-sky-500/20 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
                        style={{ left: `${endPct}%`, top: '4px' }}
                      />
                    </div>

                    {/* Time Ticks */}
                    <div className="relative w-full mt-3 h-5">
                      {[0, TOTAL_SLOTS / 4, TOTAL_SLOTS / 2, (TOTAL_SLOTS * 3) / 4, TOTAL_SLOTS].map((slot) => (
                        <span
                          key={slot}
                          className="absolute text-[10px] font-semibold text-slate-400 -translate-x-1/2"
                          style={{ left: `${(slot / TOTAL_SLOTS) * 100}%` }}
                        >
                          {slotToTime(slot)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Visit Type */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visit Type</label>
                        <div className="flex gap-4 mt-1">
                          {['In-Person', 'Telehealth'].map(type => (
                            <label key={type} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.visitType === type ? 'bg-sky-50 border-sky-200 text-sky-700 font-semibold' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                              <input type="radio" name="visitType" value={type} checked={formData.visitType === type} onChange={(e) => handleChange('visitType', e.target.value)} className="hidden" />
                              {type === 'In-Person' ? <User size={18} /> : <Stethoscope size={18} />} {type}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason for Visit</label>
                        <div className="relative">
                          <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400"><FileText size={18} /></div>
                          <input type="text" value={formData.reason} onChange={e => handleChange('reason', e.target.value)} placeholder="e.g. Annual Checkup, Back Pain..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Additional Notes (Optional)</label>
                        <div className="relative">
                          <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400"><AlignLeft size={18} /></div>
                          <textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} placeholder="Any extra details..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 resize-none" />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Side: Appointment Summary */}
                <div className="w-full lg:w-[320px] bg-slate-50 rounded-[24px] p-6 border border-slate-200 flex flex-col h-fit shrink-0">
                  <h3 className="font-extrabold text-slate-800 text-lg tracking-tight mb-6">Appointment Summary</h3>
                  
                  <div className="space-y-6">
                    {/* Provider */}
                    <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Provider</span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {selectedProvider ? getInitials(selectedProvider.firstName, selectedProvider.lastName) : 'DR'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">
                            {selectedProvider ? `Dr. ${selectedProvider.firstName} ${selectedProvider.lastName}` : 'Select Provider'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {selectedProvider?.department || selectedProvider?.specialization || "General Medicine"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                      <div className="flex items-center gap-2 text-slate-800">
                        <Calendar size={16} className="text-sky-500" />
                        <span className="text-sm font-bold">{formData.date && `${monthNames[formData.date.month]} ${formData.date.day}, ${formData.date.year}`}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time</span>
                      <div className="flex items-center gap-2 text-slate-800">
                        <Clock size={16} className="text-sky-500" />
                        <span className="text-sm font-bold">{slotToTime(formData.startSlot)} – {slotToTime(formData.endSlot)}</span>
                      </div>
                      <span className="text-xs text-slate-500">{durationLabel}</span>
                    </div>
                    
                    {/* Visit Type */}
                    <div className="flex flex-col gap-2 pb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visit Type</span>
                      <div className="flex items-center gap-2 text-slate-800">
                        {formData.visitType === 'In-Person' ? <User size={16} className="text-sky-500" /> : <Stethoscope size={16} className="text-sky-500" />}
                        <span className="text-sm font-bold">{formData.visitType}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
          </div>

          {/* Error Message */}
          {bookingError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-semibold text-red-600">
              {bookingError}
            </div>
          )}

          {/* Navigation Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            {step > 1 && (
              <button 
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all text-center cursor-pointer"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button 
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && !formData.doctorId) || 
                  (step === 2 && !formData.date)
                }
                className="px-8 py-3 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="px-8 py-3 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>

        </div>
        </div>
      )}
    </div>
  );
}
