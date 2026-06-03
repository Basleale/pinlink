import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

function Support(){
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "What is MediLoop?",
            answer: "MediLoop is a specialized e-health appointment and patient management system built specifically for Ethiopian healthcare institutions. It seamlessly bridges the gap between patients, healthcare providers, and administrators to streamline operations and elevate modern clinical care."
        },
        {
            question: "I cannot log in with my Staff/Admin ID. What should I do?",
            answer: "Ensure your ID prefix is formatted correctly (e.g., HCP-XXXX for staff or ADM-XXXX for admins) and capitalized. If your credentials are valid but you still lack entry, your department administrator may need to re-verify your system profile records for operational compliance."
        },
        {
            question: "Can I register as a healthcare professional from the portal?",
            answer: "No, direct online registration is strictly limited to patients to secure internal infrastructures. Healthcare staff and institutional providers must have their system accounts provisioned directly by their facility's HR or IT administration department."
        }
    ];


    return (
    <AuthLayout>
        <div className="bg-white/70 backdrop-blur-2xl rounded-4xl shadow-xl shadow-slate-200/50 w-full max-w-4xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-10 lg:gap-14 items-start border border-white">
    
            {/* Left Side: Contact Information Header */}
            <div className="flex-1 w-full md:sticky md:top-0">
                <div className="mb-8 text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-brand-100">
                    Help Desk & Support
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Portal Support</h2>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">
                    Experiencing login anomalies or registration issues? Reach out directly to our institutional technical team to securely restore your dashboard access.
                    </p>
                </div>

                {/* Contact Directives */}
                <div className="space-y-4">
                    {/* Phone Support */}
                    <div className="flex items-center gap-4 bg-white/50 border border-slate-200/60 p-4 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </div>
                    <div>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Call Us</span>
                        <a href="tel:+251911000000" className="text-slate-900 font-bold text-sm hover:text-brand-600 transition-colors">
                        +251 911 000 000
                        </a>
                    </div>
                    </div>

                    {/* Email Support */}
                    <div className="flex items-center gap-4 bg-white/50 border border-slate-200/60 p-4 rounded-2xl shadow-sm">
                        {/* Email Support Icon */}
                        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Email Support</span>
                            <a href="mailto:support@mediloop.health" className="text-slate-900 font-bold text-sm hover:text-brand-600 transition-colors">
                            support@mediloop.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: FAQ Dynamic Section */}
            <div className="flex-[1.2] w-full bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-2xl shadow-slate-200/40">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Frequently Asked Questions
                </h3>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                    <div 
                        key={index} 
                        className="border border-slate-100 rounded-xl bg-slate-50/50 overflow-hidden transition-all duration-300"
                    >
                        <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                        >
                        <span className="text-sm font-bold text-slate-800 leading-snug">
                            {faq.question}
                        </span>
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`text-slate-400 shrink-0 transform transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-brand-600' : ''}`}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                        </button>
                        
                        <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === index ? 'max-h-40 border-t border-slate-100' : 'max-h-0'}`}
                        >
                        <p className="px-5 py-4 text-[13px] text-slate-500 font-medium leading-relaxed bg-white">
                            {faq.answer}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {/* Absolute Footer Navigation Links */}
            <div className="absolute -bottom-24 w-full text-center md:hidden">
                <p className="text-sm font-medium text-slate-600">
                    Remembered details?{' '}
                    <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
                    Sign in here
                    </Link>
                </p>
            </div>
        </div>

        <div className="absolute bottom-4 text-center w-full left-0 hidden md:block z-20">
            <p className="text-sm font-medium text-slate-600 bg-white/60 backdrop-blur-md inline-block px-5 py-2.5 rounded-full shadow-sm border border-slate-200/60">
            Remembered your security details?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors ml-1">
                Back to Sign In
            </Link>
            </p>
        </div> 
    </AuthLayout>
    )
}

export default Support;