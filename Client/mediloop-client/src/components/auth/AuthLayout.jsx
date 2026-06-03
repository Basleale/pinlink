import { Link } from 'react-router-dom';


/*wrapper class to hold the Auth pages layout, takes a component as an argument and wraps it - 
basically the whole background stuff in the login and register pages*/

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 selection:bg-brand-100 selection:text-brand-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-brand-100/40 blur-[120px]"></div>
        <div className="absolute top-[60%] right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
      </div>

      <header className="relative z-10 flex justify-between items-center p-6 lg:px-12 w-full">
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
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-full py-2 px-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-2.5 border-r border-slate-200 pr-5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">System Online</span>
          </div>
          <Link to="/support" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Support
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex justify-center items-center px-4 py-12 lg:py-20">
        {children}
      </main>

      <footer className="relative z-10 w-full p-5 lg:px-12 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-slate-500 bg-white/40 backdrop-blur-md border-t border-slate-200/60">
        <div className="flex gap-6 mb-3 sm:mb-0">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            Ethiopian Health regulations Compliant
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            End-to-End Encrypted
          </div>
        </div>
        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          © 2026 MediLoop Inc.
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
