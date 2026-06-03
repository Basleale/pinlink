import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  User, 
  Headphones, 
  Settings, 
  Search, 
  Bell, 
  LogOut, 
  ChevronDown,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Profile & Setting', path: '/patient/profile', icon: Settings },
  ];

  const supportItems = [
    { name: 'Help Center', path: '/support', icon: Headphones },
  ];

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/patient': return { title: 'My Dashboard', subtitle: `Welcome back, ${user?.name?.split(' ')[0] || 'User'} — here's your health summary` };
      case '/patient/appointments': return { title: 'Appointments', subtitle: 'Manage your upcoming and past appointments' };
      case '/patient/records': return { title: 'Medical Records', subtitle: 'View your health records and test results' };
      case '/patient/profile': return { title: 'Profile', subtitle: 'Manage your personal information' };
      default: return { title: 'Dashboard', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="flex h-screen w-full bg-[#f8fdfa] overflow-hidden text-slate-800 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col bg-white border-r border-slate-200">
        
        {/* Logo */}
        <div className="h-18 flex items-center px-6 border-b border-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex justify-center items-center text-white shadow-lg shadow-brand-500/30 transform rotate-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="-rotate-3">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900">MediLoop</h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Health Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
          
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Navigation</h3>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-sky-50 text-sky-600 font-medium' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-sky-500' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.name}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500"></div>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Support</h3>
            <nav className="flex flex-col gap-1">
              {supportItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-sky-50 text-sky-600 font-medium' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-sky-500' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">{`${user.firstName} ${user.lastName}`}</span>
                <span className="text-[10px] text-slate-500">{user.email}</span>
              </div>
            </div>
            <button onClick={logout} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-[22px] font-bold text-slate-800 leading-tight">{title}</h1>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-50 border border-slate-200">
              <Bell size={18} />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Header User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-col hidden sm:flex">
                <span className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">{`${user.firstName} ${user.lastName}`}</span>
                <span className="text-[11px] text-slate-500">{user.role}</span>
              </div>
              <ChevronDown size={16} className="text-slate-400 ml-1 group-hover:text-slate-600" />
            </div>
          </div>
        </header>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col">
          {/* Outlet renders the matched child route component here */}
          <div className="flex-1">
             <Outlet />
          </div>
          
          {/* FOOTER */}
          <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 border-opacity-50 mt-8">
            <p>© 2025 MediLoop Inc. -- A new way to manage your health</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
              <a href="/support" className="hover:text-slate-800 transition-colors">Support</a>
              <div className="flex items-center gap-2 font-medium text-emerald-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                </div>
                All Systems Operational
              </div>
            </div>
          </footer>
        </main>
      </div>
      
    </div>
  );
}
