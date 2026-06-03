
//roleTabs component for the Login page, takes role , set role and avaliableRoles

function RoleTabs({ role, setRole, avaliableRoles=['Patient', 'Doctor', 'Admin']}) {
  return (
    <div className="flex flex-col sm:flex-row bg-slate-100/80 rounded-2xl p-1.5 mb-6 border border-slate-200/50">
      {avaliableRoles.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setRole(item)}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === item ? 'text-brand-700 bg-white shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/30'}`}>
          {item === 'professional' ? 'Provider' : item.charAt(0).toUpperCase() + item.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default RoleTabs;
