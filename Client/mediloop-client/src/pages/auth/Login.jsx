import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import RoleTabs from '../../components/auth/RoleTabs';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios.js';

function Login() {

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Patient'); //to automactically update role

  //object state to handle form dta
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    staffID: "",
    department: "",
    adminID: ""
  });


  //state to capture API response errors and validation errors
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  
  //input change handler
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value  
    }));

    //remove error as use starts typing
    if(errors[name]){
      setErrors(prev => ({...prev, [name]:""}));
    }
  };


  //Validation logic
  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!loginData.email){
      tempErrors.email= "Email address is required";
    }else if (!emailRegex.test(loginData.email)){
      tempErrors.email = "Please enter a valid email address";
    }

    if(!loginData.password){
      tempErrors.password = "Password is required";
    }else if(loginData.password.length < 6){
      tempErrors.password = "Password must be at least 6 characters";
    }


    if(role==="Admin" && !loginData.adminID.trim()){
      tempErrors.adminID = "Admin ID is required;"
    }

    if(role==="Doctor"){
      if(!loginData.staffID.trim()) tempErrors.staffID = "Staff ID is required";
      if(!loginData.department) tempErrors.department = "Department choice is required";
    }

    setErrors(tempErrors);

    //return true if there are zero errors found
    return Object.keys(tempErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(""); //reset legacy errors

    //trigger validation
    if(!validateForm()) return;

    console.log("validtion passes, making api call");
    
    const {email,password,staffID,department,adminID} = loginData;
    const payload = {role: role, email: email, password: password};

    if(role==="Admin"){
      payload.adminID = adminID;
    }else if(role==="Doctor"){
      payload.staffID = staffID;
      payload.department = department;
    }


    try{
      const response = await axios.post('/auth/login', payload)

      const data = await response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
      setUser(data.user);


      //role based naviagtion after login
      if(data.user.role === "Admin"){
        navigate("/admin");
      }
      else if(data.user.role === "Doctor"){
        navigate("/doctor");
      }
      else{
        navigate("/patient");
      }

    }catch(err){
      console.log("Login Request Failed", err);
      setApiError(err.message || "Login Failed. Check your credentials."); //maybe be better to use more descriptive error message here
    }
  }; 
  

  return (
    <AuthLayout>
      <div className="bg-white/70 backdrop-blur-2xl rounded-4xl shadow-xl shadow-slate-200/50 w-full max-w-4xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-10 lg:gap-14 items-center border border-white">
        <div className="flex-1 w-full">
          <div className="mb-8 text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-brand-100">
              Welcome Back
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Sign In</h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Securely access your healthcare operations and manage your records.
            </p>
          </div>

          <RoleTabs role={role} setRole={(r) => {setRole(r); setErrors({}); setApiError("");}} />

          {/**API/server error Box */}
          {apiError && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-2xl font-medium">
              {apiError}
            </div>
          )}
          <div className={`transition-all duration-500 ease-in-out ${role === 'Patient' ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100 h-auto bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3'}`}>
            <div className="text-blue-500 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>
            <p className="text-[13px] text-blue-900 font-medium leading-relaxed">
              <strong className="font-bold block text-blue-950 mb-0.5">Restricted Area</strong>
              Authorized personnel only. Access is heavily logged and monitored for compliance.
            </p>
          </div>

          {role === 'Patient' && (
            <div className="hidden md:block mt-8">
              <div className="mb-5 relative flex items-center">
              </div>
            </div>
          )}
        </div>

        <div className="flex-[1.2] w-full bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-2xl shadow-slate-200/40 relative">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate> {/**form for input with handleSubmit as the handler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {role === 'Admin' && (
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Admin ID</label> {/**admin ID Errors */}
                  <input onChange={handleInputChange} value={loginData.adminID} type="text" name="adminID" placeholder="ADM-XXXX" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.adminID ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none placeholder-slate-400 font-semibold transition-all`} />
                  {errors.adminID && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.adminID}</p>}
                </div>
              )}

              {role === 'Doctor' && (
                <>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Staff ID</label>
                    <input onChange={handleInputChange} value={loginData.staffID} type="text" name="staffID" placeholder="HCP-XXXX" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.staffID ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none placeholder-slate-400 font-semibold transition-all`} />
                    {errors.staffID && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.staffID}</p>}
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Department</label>
                    <select onChange={handleInputChange} value={loginData.department} name="department" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white focus:outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer">
                      <option value="" disabled>Select Dept</option>
                      <option value="cardio">Cardiology</option>
                      <option value="neuro">Neurology</option>
                      <option value="peds">Pediatrics</option>
                      <option value="gen">General</option>
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.department}</p>}
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  onChange={handleInputChange}
                  value={loginData.email}
                  type="email"
                  name="email"
                  placeholder={role === 'Patient' ? 'hello@example.com' : 'staff@healthcareInstitute.com'}
                  className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none placeholder-slate-400 font-semibold transition-all`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1 flex justify-between">
                  <span>Password</span>
                  {/* <button type="button" className="text-brand-600 hover:text-brand-700 font-bold normal-case tracking-normal">Forgot?</button> */}
                </label>
                <input
                  onChange={handleInputChange}
                  value={loginData.password}
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none placeholder-slate-400 font-semibold transition-all`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 pb-1">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" id="remember" defaultChecked className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded bg-white checked:bg-brand-500 checked:border-brand-500 transition-all cursor-pointer" />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <label htmlFor="remember" className="text-[13px] text-slate-600 font-medium cursor-pointer select-none">Keep me securely signed in</label>
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 mt-2">
              Access Dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>
        </div>

        {/* <div className="absolute -bottom-16 w-full text-center md:hidden">
          <p className="text-sm font-medium text-slate-600">
            New to MediLoop?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
              Register as a patient
            </Link>
          </p>
        </div> */ /**IDK why I put this here, feels very unneccesary */}
      </div>

      <div className="absolute bottom-4 text-center w-full left-0 hidden md:block z-20">
        <p className="text-sm font-medium text-slate-600 bg-white/60 backdrop-blur-md inline-block px-5 py-2.5 rounded-full shadow-sm border border-slate-200/60">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold transition-colors ml-1">
            Register as a patient
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;

