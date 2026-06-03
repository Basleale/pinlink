import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import axios from '../../api/axios.js';

function PatientOnboarding(){
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [healthData, setHealthData] = useState({
        phoneNumber: "",
        age: "",
        gender: "",
        bloodType: "",
        height: "",
        weight: "",
        allergies: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: ""
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
 
    //handle input feild change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHealthData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if(errors[name]){
            setErrors(prev => ({...prev, [name]:""}));
        }
    };


    //validation function
    const validateForm = () => {
        let tempErrors = {};
        
        if (!healthData.phoneNumber.trim()) {
            tempErrors.phoneNumber = "Phone number is required";
        } else if (healthData.phoneNumber.length < 9) {
            tempErrors.phoneNumber = "Please enter a valid phone number";
        }

        if (!healthData.age) {
            tempErrors.age = "Age is required";
        } else if (Number(healthData.age) <= 0 || Number(healthData.age) > 120) {
            tempErrors.age = "Please provide a realistic age";
        }

        if (!healthData.gender) tempErrors.gender = "Gender identity is required";
        if (!healthData.bloodType) tempErrors.bloodType = "Blood type choice is required";

        if (!healthData.height) {
            tempErrors.height = "Height is required";
        } else if (Number(healthData.height) < 30 || Number(healthData.height) > 250) {
            tempErrors.height = "Please enter a valid height metric (cm)";
        }

        if (!healthData.weight) {
            tempErrors.weight = "Weight is required";
        } else if (Number(healthData.weight) <= 2 || Number(healthData.weight) > 400) {
            tempErrors.weight = "Please enter a valid weight metric (kg)";
        }

        if(!healthData.emergencyContactName.trim()){
            tempErrors.emergencyContactName = "Emergency contact name is required";
        }
        if(!healthData.emergencyContactRelationship.trim()){
            tempErrors.emergencyContactRelationship = "Relationship to you is required";
        }

        if (!healthData.emergencyContactPhone.trim()) {
            tempErrors.emergencyContactPhone = "Phone number for emergency contact is required";
        } else if (healthData.emergencyContactPhone.length < 9) {
            tempErrors.emergencyContactPhone = "Please enter a valid phone number for emergency contact";
        }


        setErrors(tempErrors);

        //return true if no erros
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiError("");

        //run validation
        if(!validateForm()) return;

        //prep data by tranforming into appropriate types
        const payload = {
            phoneNumber: healthData.phoneNumber,
            age: healthData.age ? Number(healthData.age) : undefined,
            gender: healthData.gender,
            bloodType: healthData.bloodType,
            height: healthData.height ? Number(healthData.height) : undefined,
            weight: healthData.weight ? Number(healthData.weight) : undefined,
            allergies: healthData.allergies ? healthData.allergies.split(',').map(item => item.trim()).filter(Boolean): [], //filter(boolean) to remove empty array elements
            
            emergencyContact: {
                name: healthData.emergencyContactName,
                relationship: healthData.emergencyContactRelationship,
                phone: healthData.emergencyContactPhone
            }
        };

        console.log("onboarding payload preped");

        try{
            // const token = localStorage.getItem("token");
            //attached token to request using axios

            const response = await axios.put('/auth/register/additionalInfo', payload);
            const data = await response.data;

            //update local storage to store user helath data
            const updatedUser = { ...user, ...data.user};
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            //now naviaget to /patient
            navigate("/patient");

        } catch(err){
            console.log("Profile Update Request Failed:", err)
            setApiError(err.message || "Something went wrong while saving details.");
        }
    };

    return (
        <AuthLayout>
            <div className="bg-white/70 backdrop-blur-2xl rounded-4xl shadow-xl shadow-slate-200/50 w-full max-w-2xl p-8 md:p-12 relative border border-white">
                <div className="text-center mb-10">
                    <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-brand-100">
                        Step 2: Health Profile
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Tell us about yourself</h2>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Please fill out your basic clinical details to help customize your healthcare portal options.
                    </p>
                    {apiError && <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl mb-4 font-medium">{apiError}</div>}
                </div>


                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                            <input name="phoneNumber" type="tel" value={healthData.phoneNumber} onChange={handleInputChange} placeholder="+251 911 000 000" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold transition-all`} />
                            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phoneNumber}</p>}
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Age</label>
                            <input name="age" type="number" value={healthData.age} onChange={handleInputChange} placeholder="25" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.age ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold transition-all`} />
                            {errors.age && <p className="text-red-500 text-xs mt-1 font-medium">{errors.age}</p>}
                        </div>
                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Gender Identity</label>
                            <select name="gender" value={healthData.gender} onChange={handleInputChange} className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer`}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</p>}
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Blood Type</label>
                            <select name="bloodType" value={healthData.bloodType} onChange={handleInputChange} className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.bloodType ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold text-slate-700 transition-all appearance-none cursor-pointer`}>
                                <option value="">Select Blood Type</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {errors.bloodType && <p className="text-red-500 text-xs mt-1 font-medium">{errors.bloodType}</p>}
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Height (cm)</label>
                            <input name="height" type="number" value={healthData.height} onChange={handleInputChange} placeholder="175" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.height ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold transition-all`} />
                            {errors.height && <p className="text-red-500 text-xs mt-1 font-medium">{errors.height}</p>}
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Weight (kg)</label>
                            <input name="weight" type="number" value={healthData.weight} onChange={handleInputChange} placeholder="70" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.weight ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold transition-all`} />
                            {errors.weight && <p className="text-red-500 text-xs mt-1 font-medium">{errors.weight}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Known Allergies</label>
                            <input name="allergies" type="text" value={healthData.allergies} onChange={handleInputChange} placeholder="Peanuts, Penicillin, Pollen (separate with commas)" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white focus:outline-none placeholder-slate-400 font-semibold transition-all" />
                        </div>

                        {/* Section Divider for Emergency Contact */}
                        <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Emergency Contact</h3>
                            <p className="text-xs text-slate-400 font-medium mb-3">Who should we notify in an emergency scenario?</p>
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Contact Name</label>
                            <input name="emergencyContactName" type="text" value={healthData.emergencyContactName} onChange={handleInputChange} placeholder="Nahom Teferi" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.emergencyContactName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold transition-all`} />
                            {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.emergencyContactName}</p>}
                        </div>

                        <div className="sm:col-span-1">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Relationship</label>
                            <input name="emergencyContactRelationship" type="text" value={healthData.emergencyContactRelationship} onChange={handleInputChange} placeholder="Spouse" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.emergencyContactRelationship ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold transition-all`} />
                            {errors.emergencyContactRelationship && <p className="text-red-500 text-xs mt-1 font-medium">{errors.emergencyContactRelationship}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Emergency Phone Number</label>
                            <input name="emergencyContactPhone" type="tel" value={healthData.emergencyContactPhone} onChange={handleInputChange} placeholder="+251 911 123 456" className={`w-full px-5 py-3.5 bg-slate-50 border ${errors.emergencyContactPhone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-sm focus:ring-2 focus:outline-none font-semibold transition-all`} />
                            {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.emergencyContactPhone}</p>}
                        </div>

                    </div>
                    <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-600/30 transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 mt-4">
                        Complete Setup & Enter Dashboard
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}

export default PatientOnboarding;