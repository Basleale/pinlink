import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, User, Stethoscope, FileText, AlignLeft, CheckCircle2 } from 'lucide-react';
import axios from '../../api/axios';

const TIME_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

const getInitials = (name = "Doctor") => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export default function RescheduleAppointmentModal({ isOpen, onClose, appointment, onSuccess }) {
  const [mode, setMode] = useState('summary'); // 'summary' | 'reschedule' | 'cancel'
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    vistType: 'In-Person',
    date: '',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    location: '',
    reason: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setMode('summary');
    setShowSuccess(false);
    setShowCancelSuccess(false);
    setFormErrors({});
  }, [isOpen]);

  useEffect(() => {
    if (!appointment) return;
    const appointmentDate = new Date(appointment.startTime);
    const formattedDate = appointmentDate.toISOString().slice(0, 10);
    const startTime = new Date(appointment.startTime).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const endTime = new Date(appointment.endTime).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    setFormData({
      doctorName: appointment.doctor?.firstName 
        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` 
        : appointment.doctor?.name || 'Healthcare Specialist',
      vistType: appointment.vistType || 'In-Person',
      date: formattedDate,
      startTime,
      endTime,
      location: appointment.location || '',
      reason: appointment.reason || '',
      notes: appointment.notes || ''
    });
    setFormErrors({});
  }, [appointment]);

  const parseDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;
    const [hoursMin, ampm] = timeValue.split(' ');
    const [hours, minutes] = hoursMin.split(':').map(Number);
    let adjustedHours = hours;
    if (ampm === 'PM' && hours < 12) adjustedHours += 12;
    if (ampm === 'AM' && hours === 12) adjustedHours = 0;
    const [year, month, day] = dateValue.split('-').map(Number);
    return new Date(year, month - 1, day, adjustedHours, minutes);
  };

  const getValidationErrors = () => {
    const errors = {};
    const trimmedLocation = formData.location?.trim();
    const trimmedReason = formData.reason?.trim();
    const selectedDate = formData.date;
    const startDateTime = parseDateTime(formData.date, formData.startTime);
    const endDateTime = parseDateTime(formData.date, formData.endTime);
    const now = new Date();

    if (!selectedDate) {
      errors.date = 'Please choose a new appointment date.';
    }

    if (!trimmedLocation) {
      errors.location = 'Location is required.';
    }

    if (!trimmedReason) {
      errors.reason = 'A reason for your visit is required.';
    }

    if (!startDateTime || !endDateTime) {
      errors.time = 'Please choose valid start and end times.';
    } else {
      if (endDateTime <= startDateTime) {
        errors.time = 'End time must be later than start time.';
      }
      if (startDateTime < now) {
        errors.date = 'Appointment time cannot be in the past.';
      }
    }

    return errors;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'startTime') {
      const selectedStart = parseDateTime(formData.date, value);
      const currentEnd = parseDateTime(formData.date, formData.endTime);
      if (selectedStart && currentEnd && currentEnd <= selectedStart) {
        const nextOption = TIME_OPTIONS.find(time => parseDateTime(formData.date, time) > selectedStart);
        setFormData(prev => ({ ...prev, startTime: value, endTime: nextOption || value }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setFormErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'startTime' || name === 'endTime') {
      setFormErrors(prev => ({ ...prev, time: '' }));
    }
  };

  const endTimeOptions = TIME_OPTIONS.filter(time => {
    const currentStart = parseDateTime(formData.date, formData.startTime);
    const endOptionDate = parseDateTime(formData.date, time);
    return !currentStart || !endOptionDate ? true : endOptionDate > currentStart;
  });

  const validationErrors = getValidationErrors();
  const submitDisabled = Object.keys(validationErrors).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = getValidationErrors();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const startDateTime = parseDateTime(formData.date, formData.startTime);
      const endDateTime = parseDateTime(formData.date, formData.endTime);

      const response = await axios.put(`/appointments/${appointment._id}/reschedule`, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });

      if (response.data.success) {
        setShowSuccess(true);
      }
    } catch (err) {
      setFormErrors({ api: err.response?.data?.message || "Failed to reschedule appointment. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!appointment?._id) {
      setFormErrors({ api: 'Unable to cancel: no appointment selected.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.put(`/appointments/${appointment._id}/cancel`);
      if (response.data?.success) {
        setShowCancelSuccess(true);
      } else {
        setFormErrors({ api: response.data?.message || 'Failed to cancel appointment. Please try again.' });
      }
    } catch (err) {
      console.error('Cancel failed:', err);
      setFormErrors({ api: err.response?.data?.message || 'Failed to cancel appointment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setShowCancelSuccess(false);
    setFormErrors({});
    if (onSuccess) onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  if (!appointment && !showSuccess && !showCancelSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">No appointment selected</h2>
          <p className="text-sm text-slate-500 mt-2">Please choose a valid appointment before proceeding.</p>
          <button
            onClick={onClose}
            className="mt-8 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      
      {/* 1. Reschedule Success View */}
      {showSuccess && (
        <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl animate-slideUp text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle2 size={44} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Rescheduled!</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">Your appointment has been successfully updated with the new date and time details.</p>
          <button
            onClick={handleClose}
            className="mt-8 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* 2. Cancel Success View */}
      {showCancelSuccess && (
        <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl animate-slideUp text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <CheckCircle2 size={44} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Cancelled</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">Your appointment with {formData.doctorName} has been successfully cancelled.</p>
          <button
            onClick={handleClose}
            className="mt-8 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* 3. Summary details Mode */}
      {!showSuccess && !showCancelSuccess && mode === 'summary' && (
        <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl relative animate-slideUp overflow-hidden border border-white flex flex-col">
          <div className="bg-white px-8 pt-8 pb-4 border-b border-slate-100 relative z-10">
            <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Details</h2>
            <p className="text-sm text-slate-500 mt-1">Review your scheduled visit information.</p>
          </div>
          
          <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
            {/* Doctor Info */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-base font-bold">
                {getInitials(formData.doctorName)}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg leading-tight">{formData.doctorName}</h4>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{appointment?.doctor?.department || "Healthcare Specialist"}</p>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                <span className="text-sm font-bold text-slate-800 mt-1">
                  {new Date(appointment?.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{formData.startTime} – {formData.endTime}</span>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visit Type</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{formData.vistType}</span>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                <span className="text-sm font-bold text-slate-800 mt-1 truncate block">{formData.location || "Room assigned on arrival"}</span>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for Visit</span>
                <p className="text-sm font-medium text-slate-700 mt-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">{formData.reason || "Not specified"}</p>
              </div>
              {formData.notes && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Additional Notes</span>
                  <p className="text-sm font-medium text-slate-600 mt-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">{formData.notes}</p>
                </div>
              )}
            </div>

            {/* Summary Actions */}
            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => setMode('reschedule')}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-all shadow-md shadow-sky-600/10 cursor-pointer text-center"
              >
                Reschedule
              </button>
              <button
                onClick={() => setMode('cancel')}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-all cursor-pointer text-center"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Cancel Confirm Mode */}
      {!showSuccess && !showCancelSuccess && mode === 'cancel' && (
        <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl text-center flex flex-col items-center animate-slideUp border border-white">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cancel Appointment?</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
            Are you sure you want to cancel your appointment with <span className="font-bold text-slate-700">{formData.doctorName}</span>?
          </p>
          
          <div className="w-full space-y-3 mt-8">
            <button
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className={`w-full px-6 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all shadow-md shadow-red-600/10 ${isSubmitting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isSubmitting ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </button>
            <button
              onClick={() => setMode('summary')}
              className="w-full px-6 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm transition-all cursor-pointer border border-slate-150"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* 5. Reschedule form Mode */}
      {!showSuccess && !showCancelSuccess && mode === 'reschedule' && (
        <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl relative animate-slideUp overflow-hidden border border-white flex flex-col">
          <div className="bg-white px-8 pt-8 pb-6 border-b border-slate-100 relative z-10">
            <button onClick={() => setMode('summary')} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reschedule Appointment</h2>
            <p className="text-sm text-slate-500 mt-1">Update the appointment details and submit your new preferred time.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 p-8 overflow-y-auto max-h-[80vh]">
            {formErrors.api && (
              <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium w-full">
                {formErrors.api}
              </div>
            )}
            
            <div className="flex-1 space-y-8">
              <div className="grid gap-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doctor</span>
                  <p className="mt-2 text-slate-900 text-lg font-bold">{formData.doctorName}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => handleChange('date', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      required
                    />
                    {formErrors.date && <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visit Type</label>
                    <select
                      value={formData.vistType}
                      onChange={e => handleChange('vistType', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option>In-Person</option>
                      <option>Telehealth</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Time</label>
                    <select
                      value={formData.startTime}
                      onChange={e => handleChange('startTime', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      {TIME_OPTIONS.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Time</label>
                    <select
                      value={formData.endTime}
                      onChange={e => handleChange('endTime', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      {endTimeOptions.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
                    </select>
                  </div>
                </div>
                {formErrors.time && <p className="text-xs text-red-500 mt-1">{formErrors.time}</p>}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</label>
                  <input
                    value={formData.location}
                    onChange={e => handleChange('location', e.target.value)}
                    placeholder="Clinic room, office, or online link"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                  {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason for Visit</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-slate-400"><FileText size={16} /></div>
                    <input
                      value={formData.reason}
                      onChange={e => handleChange('reason', e.target.value)}
                      placeholder="e.g. Follow-up, medication review"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      required
                    />
                  </div>
                  {formErrors.reason && <p className="text-xs text-red-500 mt-1">{formErrors.reason}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Additional Notes</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-slate-400"><AlignLeft size={16} /></div>
                    <textarea
                      value={formData.notes}
                      onChange={e => handleChange('notes', e.target.value)}
                      placeholder="Optional details for the provider"
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[320px] bg-slate-50 rounded-[32px] p-6 border border-slate-200 flex flex-col gap-6 shrink-0 h-fit">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Appointment</span>
                <p className="mt-2 text-slate-900 font-semibold">
                  {appointment?.doctor?.firstName 
                    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` 
                    : appointment?.doctor?.name || 'Doctor'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</div>
                  <div className="mt-2 text-slate-900 font-semibold">{formData.date}</div>
                </div>
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time</div>
                  <div className="mt-2 text-slate-900 font-semibold">{formData.startTime} – {formData.endTime}</div>
                </div>
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visit Type</div>
                  <div className="mt-2 text-slate-900 font-semibold">{formData.vistType}</div>
                </div>
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</div>
                  <div className="mt-2 text-slate-900 font-semibold">{formData.location || 'Not set'}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  type="submit"
                  disabled={submitDisabled || isSubmitting}
                  className={`w-full px-6 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer ${submitDisabled || isSubmitting ? 'bg-slate-300 cursor-not-allowed hover:bg-slate-300' : 'bg-sky-600 hover:bg-sky-700'}`}
                >
                  {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('summary')}
                  className="w-full px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
