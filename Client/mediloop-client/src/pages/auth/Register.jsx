import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios.js';


function Register() {

  const { setUser } = useAuth();
  const navigate = useNavigate();
  
  //same idea as the login page
  const [registerData, setRegisterData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: ""
  });


  
  //state for errors and terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");


  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value
    }));

    if(errors[name]){
      setErrors(prev => ({...prev, [name]: ""}));
    }
  };


  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!registerData.firstName.trim()) tempErrors.firstName = "First name is required";
    if(!registerData.lastName.trim()) tempErrors.lastName = "Last name is required";

    if(!registerData.email){
      tempErrors.email = "Email is required";
    }else if (!emailRegex.test(registerData.email)){
      tempErrors.email = "Please enter a valid email";
    }

    if(!registerData.password){
      tempErrors.password = "Password is required";
    }else if(registerData.password.length < 6){
      tempErrors.password = "Password must look secure (minimum 6 characters)";
    }

    if(!acceptedTerms){
      tempErrors.terms = "You must agree to the Terms of Service";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }


  //submission handler
  const handleSubmit = async (e) =>{
    e.preventDefault();
    setApiError(""); //clear prev errors

    if (!validateForm()) return;
    
    const payload = {
      ...registerData,
      role: "Patient"
    }

    try {
      const response = await axios.post('/auth/register', payload)

      const data = await response.data;

      //saving token ----- this should prolly be in onBoarding in case we have a patient that stops midway during registration
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )
      setUser(data.user);

      console.log("Register Success", data); //debug code


      //navigate to additional info before completing registration
      navigate("/onboarding")

    } catch (err){
      console.log("Register Request Failed:", err);
      setApiError(err.message || "Registration failed. Email might already exist.");
    }
  };


  return (
    <AuthLayout>
      <div className="bg-white/70 backdrop-blur-2xl rounded-4x1 shadow-xl shadow-slate-200/50 w-full max-w-2xl p-8 md:p-12 relative border border-white">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-brand-100">
            Patient Registration
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Create an Account</h2>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Join MediLoop to manage appointments and view your medical records securely.
          </p>
          {apiError && <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl mb-4 font-medium">{apiError}</div>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">First Name</label>
              <input name="firstName" type="text" value={registerData.firstName} onChange={handleInputChange} placeholder="Sarah" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:outline-none font-semibold transition-all`} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Last Name</label>
              <input name="lastName" type="text" value={registerData.lastName} onChange={handleInputChange} placeholder="Jenkins" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:outline-none font-semibold transition-all`} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input name="email" type="email" value={registerData.email} onChange={handleInputChange}  placeholder="sarah.j@example.com" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:outline-none font-semibold transition-all`} />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Create Password</label>
              <input name="password" type="password" value={registerData.password} onChange={handleInputChange} placeholder="••••••••••••" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:outline-none font-semibold transition-all`} />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3 pb-2">
            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
              <input type="checkbox" id="terms" onChange={(e) => { setAcceptedTerms(e.target.checked); setErrors(prev => ({...prev, terms:""})); }} className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded bg-white checked:bg-brand-500 checked:border-brand-500 transition-all cursor-pointer" />
              <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <label htmlFor="terms" className="text-[13px] text-slate-600 font-medium cursor-pointer leading-relaxed">
              I agree to the MediLoop{' '}
              <a href="#" className="text-brand-600 hover:underline">Terms of Service</a> &{' '}
              <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>, including automatic storage of medical booking logs.
            </label>
            {errors.terms && <p className="text-red-500 text-xs mt-1 font-medium pl-8">{errors.terms}</p>}
          </div>

          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-600/30 transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 mt-2">
            Complete Registration
          </button>
        </form>

      </div>

      <div className="absolute bottom-6 text-center w-full left-0 z-20">
        <p className="text-sm font-medium text-slate-600 bg-white/60 backdrop-blur-md inline-block px-5 py-2.5 rounded-full shadow-sm border border-slate-200/60">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors ml-1">
            Sign in here
          </Link>
        </p>
      </div> {/** UI looks a lot better when this is outside the registeration div */}

    </AuthLayout>
  );
}

export default Register;
