import React, { useEffect, useState } from 'react';
import { 
  Edit2, 
  X, 
  Save,
  Mail, 
  Phone, 
  User, 
  MapPin, 
  BriefcaseMedical, 
  Asterisk, 
  Lock,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {useAuth} from '../../context/AuthContext' 
import axios from '../../api/axios.js';



// the helper component for fields so that they can switch between view and edit seamlessly
const Field = ({ label, name, value, suffix = '', type = 'text', colSpan = 1, errorMsg, handleChange, isEditing }) => (
  <div className={`flex flex-col gap-1.5 ${colSpan > 1 ? `col-span-${colSpan}` : ''}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    {isEditing ? (
      <>
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className={`w-full bg-slate-50 border ${errorMsg ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'} text-slate-800 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all`}
        />
        {errorMsg && <span className="text-xs text-red-500 font-medium">{errorMsg}</span>}
      </>
    ) : (
      <span className="text-sm text-slate-800">{value || "—"} {value ? suffix : ''}</span>
    )}
  </div>
);

export default function Profile() {

  const { user, loading: authLoading} = useAuth();

  //editing state stuff
  const [isEditing, setIsEditing] = useState(false);
  
  //password and deactiveate dialog boxes
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  //allergy input state management
  const [allergyInput, setAllergyInput] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",//`${user.firstName} ${user.lastName}`,
    email: "",
    phoneNumber: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodType: "",
    allergies: [],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""}
  });

  //error state management and input validation
  const [editBuffer, setEditBuffer] = useState({...formData}); //temp state for editing
  const [error, setError] = useState({});
  const [apiError, setApiError] = useState("");


  //effect for backspace stuff
  useEffect(() => {
    const handleBackspace = (e) => {
      if(e.key === 'BacKspace'){
        const target = e.target;

        const isEditable = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

        if(!isEditable){
          e.preventDefault();
        }
      }
    }

    window.addEventListener('keydown', handleBackspace);
    return () => window.removeEventListener('keydown', handleBackspace);
  }, []);



  //make api call and get patient info
  const getPatientInfo = async () => {
    try {
      const response = await axios.get('/patient/me');

      const data = response.data?.patient;

      if(!data){
        throw new Error("Failed to fetch helath profile.")
      }

      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        age: data.age || "",
        gender: data.gender || "",
        height: data.height || "",
        weight: data.weight || "",
        bloodType: data.bloodType || "",
        allergies: data.allergies || [],
        emergencyContact: {
          name: data.emergencyContact?.name || "",
          relationship: data.emergencyContact?.relationship || "",
          phone: data.emergencyContact?.phone || ""
        }
      })

      //setApiError("Something broke") //mkaing sure it works

      //console.log(data); //return data properly

    }catch(error){
      const serverMessage = error.response?.data?.message || error.message;
      console.error("Error in getPatientInfo", serverMessage);
      setApiError(serverMessage || "Failed to fetch health profile.")
    }
  }


  //effect for initial load
  useEffect(() => {
    if(!authLoading && user){
      getPatientInfo();
    }

  }, [authLoading, user]);



  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);



  //handle Input change onto buffer and handle emergency contact stuff
  const handleChange = (e) => {
    const {name, value} = e.target;

    if(name.startsWith("emergencyContact")) {
      const map = {
        emergencyContactName: "name",
        emergencyContactRelationship: "relationship",
        emergencyContactPhone: "phone"
      };
      setEditBuffer(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [map[name]]: value
        }
      }));
    }else {
      setEditBuffer(prev => ({...prev, [name]: value }));
    }
  };


  //password handler, maybe need to include some form of validation here ---- matching password or something
  const handlePasswordChange = (e) => {
    const {name, value} = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };


  //false -> true or true -> false
  const toggleEdit = () => {
    if(!isEditing){
      // enter editing mode using buffer
      setEditBuffer(structuredClone(formData));
    }else{
      setEditBuffer(structuredClone(formData));
      setError({});
    }

    setIsEditing(prev => !prev);
  };

    //Allergy related handlers -- add allergy, remove allergy, ...
  const handleAddAllergy = (e) => {
    if (e.key === 'Enter' && allergyInput.trim() !== '') {
      e.preventDefault();

      if (!formData.allergies.includes(allergyInput.trim())) {
        setEditBuffer(prev => ({ ...prev, allergies: [...prev.allergies, allergyInput.trim()] }));  
      }
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (allergyToRemove) => {
    setEditBuffer(prev => ({
      ...prev,
      allergies: prev.allergies.filter(
        allergy => allergy !== allergyToRemove
      )
    }));
  };


  const validateForm = () => {
    const errors = {};

    if(!editBuffer.firstName.trim()) errors.firstName = "First name is required.";
    if(!editBuffer.lastName.trim()) errors.lastName = "Last name is required.";

  //   if (!formData.email.trim()) {
  //   errors.email = "Email is required.";
  // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  //   errors.email = "Please enter a valid email address.";
  // }

    if (!editBuffer.phoneNumber){
      errors.phoneNumber = "Phone number is required.";
    } else if(editBuffer.phoneNumber.length !== 13){
      errors.phoneNumber = "Please enter a valid Phone number (+ followed by 12 digits)";

    } else if (!/^\+?[1-9]\d{1,14}$/.test(editBuffer.phoneNumber.replace(/[\s()-]/g, ''))){
      errors.phoneNumber = "Please enter a vlaid phone number.";
    } 

    if(!editBuffer.age){
        errors.age = "Age is required";
      } else {
      const ageNum = Number(editBuffer.age);
      if(isNaN(ageNum) || ageNum < 0 || ageNum > 120){
        errors.age = "Please enter a realistic age (0-120).";
      }
    }

     if(!editBuffer.height){
        errors.height = "Height is required";
      } else {
      const heightNum = Number(editBuffer.height);
      if(isNaN(heightNum) || heightNum < 30 || heightNum > 250){
        errors.height = "Height must be a valid number in cm (30-250).";
      }
    }

    if(!editBuffer.weight){
        errors.weight = "Weight is required";
      } else {
      const weightNum = Number(editBuffer.weight);
      if(isNaN(weightNum) || weightNum < 2 || weightNum > 200){
        errors.weight = "Weight must be a valid number in kg (2-200).";
      }
    }


  
  const { name, relationship, phone } = editBuffer.emergencyContact;

  if (
    name.trim() ||
    relationship.trim() ||
    phone.trim()
  ) {
    if (!name.trim()) {
      errors.emergencyContactName = "Contact name is required";
    }

    if (!relationship.trim()) {
      errors.emergencyContactRelationship = "Relationship is required";
    }

    if (!phone.trim()) {
      errors.emergencyContactPhone = "Contact phone number is required";
    } else if(phone.length !== 13 ){
      errors.emergencyContactPhone = "Please enter a valid phone number (+ followed by 12 digits)"
    } else if (
      !/^\+?[1-9]\d{1,14}$/.test(
        phone.replace(/[\s()-]/g, '')
      )
    ) {
      errors.emergencyContactPhone =
        "Please enter a valid contact phone number.";
    }
  }

    
    setError(errors);
    return Object.keys(errors).length === 0;
  }

  //prep payload and make Api call
  const saveProfile = async () => {

    if(!validateForm()) return;

    try{
      const payload = structuredClone(editBuffer);
      
      const response = await axios.put("/patient/me", payload);

      response.data.user.email = formData.email;
      setFormData(response.data.user);
      setEditBuffer(response.data.user);

      setError({});
      setApiError("");
      setIsEditing(false);

    }catch(error){
      const serverError = error.response?.data?.message || error.message;
      console.log(serverError);
      setApiError(serverError || "Failed to update profile data.")
    }
  };


  //password api call
  const savePassword = () => {
    // Password change API call goes here
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };


  //deactiate account api call
  const deactivateAccount = () => {
    // Account deactivation API call goes here
    setIsDeactivateModalOpen(false);
  };


  return (
<div className="w-full max-w-400px mx-auto animate-fadeIn pb-12 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          {/* <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal information and contact details.</p> */}
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={toggleEdit}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={saveProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm transition-all text-sm"
              >
                <Save size={16} /> Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={toggleEdit}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#006596] hover:bg-[#00527a] text-white font-semibold rounded-xl shadow-sm transition-all text-sm"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/** api error message */}
      {apiError && (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
        {apiError}
      </div> )}


      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: PROFILE SUMMARY */}
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 flex flex-col items-center shadow-sm flex-1">
            
            <div className="w-32 h-32 rounded-full border-4 border-sky-100 overflow-hidden relative group">
              <img src="https://i.pravatar.cc/150?img=33" alt="Profile" className="w-full h-full object-cover" />
              {isEditing && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Edit2 size={24} className="text-white" />
                </div>
              )}
            </div>
            
            {/** change here to mak ename persist during edit */}
            <h2 className="text-2xl font-semibold text-slate-900 mt-6 tracking-tight">{isEditing ? `${editBuffer.firstName} ${editBuffer.lastName}` : `${formData.firstName} ${formData.lastName}`}</h2>
            {/* NO SUCH THING AS ID AMIR!!!! WHY TF DO YOU KEEP DOING THIS TO MEEEEEEE 
            <div className="mt-2 bg-sky-100 text-sky-600 font-medium text-xs px-4 py-1.5 rounded-full">
              Patient ID: {formData.patientId}
            </div> */}

            <div className="w-full mt-8 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 bg-sky-50 text-sky-600 flex items-center justify-center rounded-xl">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</span>
                  <span className="text-sm text-slate-800 mt-0.5 truncate">{formData.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 bg-sky-50 text-sky-600 flex items-center justify-center rounded-xl">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col flex-1 min-w-0 w-full">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</span>
                  {isEditing ? (
                    <>
                      <input 
                        type="text" 
                        name="phoneNumber" 
                        value={editBuffer.phoneNumber} 
                        onChange={handleChange}
                        className={`mt-1 w-full bg-slate-50 border ${error.phoneNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'} text-slate-800 text-sm px-2 py-1.5 rounded focus:outline-none focus:border-sky-500`}
                      />
                      {error.phoneNumber && <span className="text-xs text-red-500 mt-1">{error.phoneNumber}</span>}
                    </>
                  ) : (
                    <span className="text-sm text-slate-800 mt-0.5 truncate">{formData.phoneNumber}</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MIDDLE COLUMN: MAIN DETAILS */}
        <div className="flex flex-col gap-6 h-full">
          
          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-[#006596]" size={22} />
              <h3 className="text-[19px] font-medium text-slate-900 tracking-tight">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
              <div className="sm:col-span-2">
                <Field label="First Name" name="firstName" value={isEditing ? editBuffer.firstName : formData.firstName} errorMsg={error.firstName}  isEditing={isEditing} handleChange={handleChange}/>
                <Field label="Last Name" name="lastName" value={isEditing ? editBuffer.lastName : formData.lastName} errorMsg={error.lastName} isEditing={isEditing} handleChange={handleChange}/>
              </div>
              {/* <Field label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} /> ---- NO DOB IN DB*/}
              <Field label="Age" name="age" value={isEditing ? editBuffer.age : formData.age} suffix="years" type="number" errorMsg={error.age} isEditing={isEditing} handleChange={handleChange} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gender</label>
                {isEditing ? (
                  <select name="gender" value={editBuffer.gender} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Prefer not to say</option>
                  </select>
                ) : (
                  <span className="text-sm text-slate-800">{formData.gender}</span>
                )}
              </div>

              <Field label="Height" name="height" value={isEditing ? editBuffer.height : formData.height} suffix="cm" type="number" errorMsg={error.height} isEditing={isEditing} handleChange={handleChange}/>
              <Field label="Weight" name="weight" value={isEditing ? editBuffer.weight : formData.weight} suffix="kg" type="number" errorMsg={error.weight} isEditing={isEditing} handleChange={handleChange}/>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blood Type</label>
                {isEditing ? (
                  <select name="bloodType" value={editBuffer.bloodType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500">
                    <option value="A+">A+ Positive</option>
                    <option value="A-">A- Negative</option>
                    <option value="O+">O+ Positive</option>
                    <option value="O-">O- Negative</option>
                    <option value="B+">B+ Postive</option>
                    <option value="B-">B- Negative</option>
                    <option value="AB+">AB+ Positive</option>
                    <option value="AB-">AB- Negative</option>
                  </select>
                ) : (
                  <div>
                    <span className="inline-flex bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">{formData.bloodType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex-1">
            <div className="flex items-center gap-3 mb-6">
              <BriefcaseMedical className="text-[#006596]" size={22} />
              <h3 className="text-[19px] font-medium text-slate-900 tracking-tight">Medical Information</h3>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Allergies</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(isEditing ? editBuffer.allergies : formData.allergies).length > 0 ? (
                  (isEditing ? editBuffer.allergies : formData.allergies).map(allergy => (
                    <span key={allergy} className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full">
                      {allergy}
                      {isEditing && (
                        <XCircle size={14} className="cursor-pointer hover:text-red-800 transition-colors" onClick={() => handleRemoveAllergy(allergy)} />
                      )}
                    </span>
                  ))
                ) : ( !isEditing &&
                  <span className="text-sm text-slate-400 italic py-1.5">No known allergies</span>
                )}

                {isEditing && (
                  <input 
                    type="text" 
                    value={allergyInput} 
                    onChange={e => setAllergyInput(e.target.value)}
                    onKeyDown={handleAddAllergy}
                    placeholder="Type & press enter..."
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-sm px-4 py-1.5 rounded-full focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-500/20 transition-all w-40"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EMERGENCY & SECURITY */}
        <div className="flex flex-col gap-6 h-full">
          
          {/* Emergency Contact */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006596]"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Asterisk className="text-[#006596]" size={22} strokeWidth={2.5} />
              <h3 className="text-[19px] font-medium text-slate-900 tracking-tight">Emergency Contact</h3>
            </div>
            
            <div className="flex flex-col gap-6">
              <Field label="Contact Name" name="emergencyContactName" value={isEditing ? editBuffer.emergencyContact.name : formData.emergencyContact.name} isEditing={isEditing} handleChange={handleChange} errorMsg={error.emergencyContactName}/>
              <Field label="Relationship" name="emergencyContactRelationship" value={isEditing ? editBuffer.emergencyContact.relationship : formData.emergencyContact.relationship} isEditing={isEditing} handleChange={handleChange} errorMsg={error.emergencyContactRelationship}/>
              <Field label="Phone Number" name="emergencyContactPhone" value={isEditing ? editBuffer.emergencyContact.phone : formData.emergencyContact.phone} isEditing={isEditing} handleChange={handleChange} errorMsg={error.emergencyContactPhone}/>
            </div>
          </div>

          {/* Security & Password */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6 flex-1 justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                <Lock size={22} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-slate-900">Password & Security</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account password and security settings</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
            >
              Change Password
            </button>
          </div>


          {/* Deactivate Account */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6 flex-1 justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <XCircle size={22} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-slate-900">Deactivate Account</h3>
                <p className="text-sm text-slate-500 mt-0.5">Permanently delete your account and data.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDeactivateModalOpen(true)}
              className="w-full px-5 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
            >
              Deactivate Account
            </button>
          </div>

        </div>
      </div>

      {/* PASSWORD Modal dialog */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl relative animate-slideUp">
            <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                <input 
                  type={showPassword ? "text" : "password"} name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-6.5 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                <input 
                  type={showPassword ? "text" : "password"} name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                <input 
                  type={showPassword ? "text" : "password"} name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={savePassword}
                disabled={!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-sky-600"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}


      {/**deactivate account modal - dialog */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl relative animate-slideUp">
            <button onClick={() => setIsDeactivateModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Deactivate Account</h2>
                <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">Your profile, medical records, and appointment history will be permanently removed from the system.</p>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button 
                onClick={() => setIsDeactivateModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={deactivateAccount}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition-all"
              >
                Deactivate 
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
