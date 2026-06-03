import React from 'react';
import { 
  Calendar, 
  FileText, 
  Pill, 
  ShieldCheck, 
  ChevronRight, 
  PlusCircle,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '../../api/axios.js';

// 💡 Fixed: Restored separate component architectural imports
import StatCard from '../../components/cards/StatCard';
import AppointmentRow from '../../components/cards/AppointmentRow';
import QuickActionCard from '../../components/cards/QuickActionCard';
import RecordCard from '../../components/cards/RecordCard';
import BookAppointmentModal from '../../components/modals/BookAppointmentModal';
import RescheduleAppointmentModal from '../../components/modals/RescheduleAppointmentModal';

export default function PatientDashboard() {
  const { user, loading: authLoading } = useAuth();

  //appointment state management
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleViewAppointment = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailsModalOpen(true);
  };


  const fetchAppointments = async () => {
    try{
      
      const response = await axios.get('/appointments');

      if(response.data.success){
        setAppointments(response.data.appointments);
      }
    }catch(error){
      setError(error.response?.data?.message || "Failed to load appointments");
    }finally{
      setLoading(false);
    }
  };


  //effect for initial load
  useEffect(() => {
    if(!authLoading && user){
      fetchAppointments();
    }

  }, [authLoading, user]);


  const handleAppointmentCreated = () => {


    fetchAppointments();
  };

  if (authLoading || loading) return <div className="text-center p-10 text-slate-500">Loading your health portal...</div>;

  const now = new Date();
  const upcomingAppointments = appointments
    .filter(appt => new Date(appt.startTime) >= now && appt.status !== 'Cancelled' && appt.status !== 'Completed')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const medicalRecords = [
    { title: 'Annual Physical Exam', doctor: 'Dr. James Okafor', date: 'Dec 14, 2024', type: 'doc' },
    { title: 'Echocardiogram Results', doctor: 'Dr. Sarah Mitchell', date: 'Nov 29, 2024', type: 'scan' },
    { title: 'Blood Panel — Q4 2024', doctor: 'Lab Sciences Dept.', date: 'Nov 12, 2024', type: 'lab' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mx-auto animate-fadeIn p-4 items-stretch lg:h-[calc(100vh-210px)] lg:min-h-[500px]">
      
      {/* Column 1: Welcome Banner */}
      <div className="flex flex-col h-fit">
        <div className="relative bg-white rounded-3xl border border-slate-100 p-8 flex flex-col gap-6 shadow-sm overflow-hidden h-fit">
          {/* Background gradient */}
          <div className="absolute right-0 top-0 w-full h-1/2 bg-gradient-to-b from-sky-50/40 via-sky-50/10 to-transparent pointer-events-none"></div>
          
          {/* Top Info */}
          <div className="space-y-3 z-10">
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Patient Portal</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Good morning,<br/>
              <span className="text-sky-600">{user ? `${user.firstName} ${user.lastName}` : "Alex Johnson"}</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed pt-2">
              You have <span className="font-semibold text-slate-700">{upcomingAppointments.length} upcoming appointment{upcomingAppointments.length === 1 ? '' : 's'}</span> scheduled. Everything looks on track.
            </p>
          </div>

          {/* Next Visit Spotlight Widget & Button Group */}
          <div className="space-y-6 z-10 mt-4">
            {/* Next Visit Spotlight Widget */}
            {upcomingAppointments.length > 0 ? (
              <div className="flex items-center gap-4 bg-linear-to-r from-sky-50 to-sky-100/30 border border-sky-100/50 p-5 rounded-2xl">
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Next Visit</span>
                  <span className="text-base font-extrabold text-slate-800 mt-1">
                    {new Date(upcomingAppointments[0].startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs text-slate-500">
                    Dr. {upcomingAppointments[0].doctor?.firstName} {upcomingAppointments[0].doctor?.lastName} • {new Date(upcomingAppointments[0].startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-sky-600 font-bold text-sm shrink-0">
                  {upcomingAppointments[0].doctor?.firstName?.[0] || 'D'}{upcomingAppointments[0].doctor?.lastName?.[0] || 'R'}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Visit</span>
                  <span className="text-sm font-semibold text-slate-500 mt-1">No upcoming visits</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-6 py-4 rounded-2xl shadow-md shadow-sky-500/25 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <PlusCircle size={18} />
              Book New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Column 2: Stats Row & Upcoming Appointments */}
      <div className="flex flex-col gap-6 h-full min-h-0">
        
        {/* STATS Cards */}
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <StatCard 
            icon={Calendar} 
            iconColor="text-sky-500 bg-sky-50" 
            title="Total Visits" 
            value={appointments.length.toString()} 
            subtitle="Synced" 
          />
          <StatCard 
            icon={ClipboardList} 
            iconColor="text-orange-500 bg-orange-50" 
            title="Pending" 
            value={appointments.filter(a => a.status === 'Pending').length.toString()} 
            subtitle="Awaiting clinic" 
          />
          <StatCard 
            icon={Pill} 
            iconColor="text-emerald-500 bg-emerald-50" 
            title="Prescriptions" 
            value="3" 
            subtitle="Active" 
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="flex flex-col space-y-4 flex-1 min-h-0">
          <div className="flex items-center justify-between px-2 shrink-0">
            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Upcoming Appointments</h3>
            <button className="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1 transition-colors cursor-pointer">
                View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-slate-400 p-4 border border-dashed rounded-xl">No appointments scheduled.</p>
            ) : (
              upcomingAppointments.map((appt) => (
                <AppointmentRow 
                  key={appt._id} 
                  date={new Date(appt.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  doctor={`Dr. ${appt.doctor?.firstName} ${appt.doctor?.lastName}`}
                  specialty={appt.doctor?.department}
                  time={new Date(appt.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric',year: 'numeric' })}
                  location={appt.location}
                  status={appt.status}
                  onView={() => handleViewAppointment(appt)}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* BOOK APPOINTMENT MODAL */}
      <BookAppointmentModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        onSuccess={handleAppointmentCreated}
      />

      {/* APPOINTMENT DETAILS / RESCHEDULE / CANCEL MODAL */}
      <RescheduleAppointmentModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}