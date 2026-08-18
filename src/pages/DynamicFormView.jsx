import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Send, CheckCircle2, FileUp, AlertCircle, Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const DynamicFormView = () => {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCardId, setActiveCardId] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // State to track error keys for Google Form style visual red highlights
  const [sectionErrors, setSectionErrors] = useState({});
  
  const navigate = useNavigate();
  const cardRefs = useRef({});

  useEffect(() => {
    const hasAccess = localStorage.getItem('formAccessGranted');
    if (!hasAccess) {
      navigate('/register-gate');
      return;
    }

    API.get('/api/form')
      .then(res => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  // World-class dynamic scroll tracking for active panel illumination
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2.5;
      for (const [key, el] of Object.entries(cardRefs.current)) {
        if (el) {
          const rect = el.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveCardId(key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [form]);

  const handleChange = (fieldKey, value) => {
    setAnswers({ ...answers, [fieldKey]: value });
    // Clear error for this field once user fills it
    if (sectionErrors[fieldKey]) {
      setSectionErrors(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const handleCheckboxChange = (fieldKey, opt, checked) => {
    const currentValues = answers[fieldKey] || [];
    let updatedValues;
    if (checked) {
      updatedValues = [...currentValues, opt];
    } else {
      updatedValues = currentValues.filter(item => item !== opt);
    }
    setAnswers({ ...answers, [fieldKey]: updatedValues });
    
    if (sectionErrors[fieldKey] && updatedValues.length > 0) {
      setSectionErrors(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const handleFileChange = (fieldKey, file, maxSizeMB) => {
    if (!file) return;

    const maxBytes = (maxSizeMB || 5) * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileErrors({ ...fileErrors, [fieldKey]: `File size exceeds the limit of ${maxSizeMB || 5}MB` });
      return;
    } else {
      setFileErrors({ ...fileErrors, [fieldKey]: null });
      if (sectionErrors[fieldKey]) {
        setSectionErrors(prev => ({ ...prev, [fieldKey]: false }));
      }
    }

    setAnswers({ ...answers, [fieldKey]: file });
  };

  const sections = form?.sections || [
    {
      sectionTitle: form?.title,
      sectionDescription: form?.description,
      fields: form?.fields || []
    }
  ];

  const totalSections = sections.length;
  const currentSec = sections[currentSectionIndex] || sections[0];

  // Validation check that flags missing fields and scrolls directly to the first unfilled one
  const validateCurrentSection = () => {
    if (!currentSec.fields) return true;

    let newErrors = {};
    let firstErrorFieldKey = null;

    for (let i = 0; i < currentSec.fields.length; i++) {
      const field = currentSec.fields[i];
      const fieldKey = field._id || `${currentSectionIndex}-${i}`;

      if (field.required) {
        const val = answers[fieldKey];
        if (
          val === undefined || 
          val === null || 
          val === '' || 
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[fieldKey] = true;
          if (!firstErrorFieldKey) {
            firstErrorFieldKey = fieldKey;
          }
        }
      }
    }

    setSectionErrors(newErrors);

    // Check for file errors
    if (Object.values(fileErrors).some(err => err)) {
      return false;
    }

    if (firstErrorFieldKey) {
      // Google-form style: Scroll straight to the missing requirement card smoothly
      if (cardRefs.current[firstErrorFieldKey]) {
        cardRefs.current[firstErrorFieldKey].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleNextSection = (e) => {
    if (e) e.preventDefault(); 
    
    if (!validateCurrentSection()) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setSectionErrors({}); // Reset error states for the next section
    }
  };

  const handlePrevSection = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setSectionErrors({});
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateCurrentSection()) return;

    try {
      // যদি ফর্মে ফাইল বা ছবি থাকে, তবে FormData ব্যবহার করতে হবে
      const formData = new FormData();
      formData.append('formId', form._id);

      // অ্যানসারগুলো অ্যাপেন্ড করা
      const serializedAnswers = {};
      for (const [key, value] of Object.entries(answers)) {
        if (value instanceof File) {
          // ফাইল হলে FormData তে আলাদাভাবে পাঠাবো
          formData.append(key, value);
        } else {
          serializedAnswers[key] = value;
        }
      }
      formData.append('answers', JSON.stringify(serializedAnswers));

      await API.post('/api/form/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit form');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-purple-300 font-semibold text-base tracking-wider">Loading Secure Enterprise Portal...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-center space-y-3 max-w-md w-full border border-slate-800">
          <p className="text-rose-400 font-bold text-base">No Form Found. Please publish a form from the admin panel.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4">
        <div className="bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl text-center space-y-5 max-w-md w-full border border-purple-500/20 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Application Submitted!</h2>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Thank you for completing the registration. Your response has been securely recorded and verified in our database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 py-16 px-4 sm:px-6 font-sans text-slate-100 selection:bg-purple-600 selection:text-white">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-10">
        
        {/* Main Header Banner */}
        <div className="bg-gradient-to-br from-slate-900/90 to-purple-950/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-purple-950/50 border border-purple-500/20 relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"></div>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-xs tracking-widest uppercase border border-purple-500/20">
              <Sparkles size={14} /> Official Verified Portal
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <ShieldCheck size={16} /> Secured & Encrypted
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">{form.title}</h1>
          {form.description && (
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">{form.description}</p>
          )}

          {totalSections > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">
                Section {currentSectionIndex + 1} of {totalSections}
              </span>
              <div className="flex gap-1.5">
                {sections.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === currentSectionIndex ? 'w-8 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'w-2 bg-slate-800'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Section Display */}
        <div className="space-y-6">
          
          {currentSec.sectionTitle && (
            <div className="bg-gradient-to-r from-purple-900/80 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-purple-950/30 space-y-3 border border-purple-500/30 backdrop-blur-lg">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{currentSec.sectionTitle}</h2>
              {currentSec.sectionDescription && (
                <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-normal whitespace-pre-line">
                  {currentSec.sectionDescription}
                </p>
              )}
            </div>
          )}

          {currentSec.fields && currentSec.fields.length > 0 ? (
            currentSec.fields.map((field, fIdx) => {
              const fieldKey = field._id || `${currentSectionIndex}-${fIdx}`;
              const globalFieldCounter = fIdx + 1;
              const isActive = activeCardId === fieldKey;
              const hasError = sectionErrors[fieldKey]; // Check if field has error state

              return (
                <div 
                  key={fieldKey} 
                  ref={el => cardRefs.current[fieldKey] = el}
                  className={`p-6 sm:p-10 rounded-[2.25rem] transition-all duration-700 ease-out space-y-5 backdrop-blur-2xl border ${
                    hasError 
                      ? 'bg-rose-950/20 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)] ring-1 ring-rose-500' 
                      : isActive 
                        ? 'bg-slate-900/95 border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.18)] scale-[1.015] ring-1 ring-purple-500/50' 
                        : 'bg-slate-900/50 border-slate-800/80 shadow-xl shadow-black/40 hover:border-slate-700'
                  }`}
                >
                  
                  {/* Question Header */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
                      <span className="text-purple-400 mr-2 font-black">{globalFieldCounter}.</span> 
                      {field.question} 
                      {field.required && <span className="text-rose-500 ml-1.5">*</span>}
                    </label>
                    {field.questionDescription && (
                      <p className="text-sm text-slate-400 pl-6 leading-relaxed font-medium">{field.questionDescription}</p>
                    )}
                    
                    {/* Inline error tag if required field is empty */}
                    {hasError && (
                      <p className="text-xs text-rose-400 font-bold pl-6 pt-1 flex items-center gap-1 animate-pulse">
                        <AlertCircle size={14} /> This is a required question
                      </p>
                    )}
                  </div>

                  {/* Field Inputs Container */}
                  <div className="pl-0 sm:pl-6 pt-2">
                    {/* Short Answer */}
                    {field.fieldType === 'shortAnswer' && (
                      <input 
                        type="text" 
                        value={answers[fieldKey] || ''}
                        onChange={(e) => handleChange(fieldKey, e.target.value)} 
                        className={`w-full bg-slate-950/70 border rounded-2xl px-5 py-4 text-slate-100 text-base placeholder:text-slate-600 outline-none transition-all duration-300 font-medium tracking-wide ${
                          hasError ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/20' : 'border-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                        }`} 
                        placeholder="Type your answer here..."
                      />
                    )}

                    {/* Paragraph */}
                    {field.fieldType === 'paragraph' && (
                      <textarea 
                        value={answers[fieldKey] || ''}
                        onChange={(e) => handleChange(fieldKey, e.target.value)} 
                        className={`w-full bg-slate-950/70 border rounded-2xl p-5 text-slate-100 text-base placeholder:text-slate-600 outline-none transition-all duration-300 font-medium resize-none tracking-wide ${
                          hasError ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/20' : 'border-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                        }`} 
                        rows={4}
                        placeholder="Type your detailed response here..."
                      />
                    )}

                    {/* Multiple Choice & Dropdown */}
                    {(field.fieldType === 'multipleChoice' || field.fieldType === 'dropdown') && field.options && (
                      field.fieldType === 'dropdown' ? (
                        <select 
                          value={answers[fieldKey] || ''}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className={`w-full bg-slate-950/70 border rounded-2xl px-5 py-4 text-base text-slate-100 outline-none transition-all duration-300 font-medium ${
                            hasError ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/20' : 'border-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          }`}
                        >
                          <option value="" disabled className="bg-slate-900 text-slate-500">Choose an option</option>
                          {field.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt} className="bg-slate-950 text-white">{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="space-y-3.5">
                          {field.options.map((opt, oIdx) => (
                            <label key={oIdx} className={`flex items-center gap-4 p-4 rounded-2xl border bg-slate-950/40 hover:bg-purple-950/30 cursor-pointer transition-all group/item ${
                              hasError ? 'border-rose-500/60' : 'border-slate-800/80 hover:border-purple-500/40'
                            }`}>
                              <input 
                                type="radio" 
                                name={`field-${fieldKey}`} 
                                value={opt} 
                                checked={answers[fieldKey] === opt}
                                onChange={(e) => handleChange(fieldKey, e.target.value)} 
                                className="w-5 h-5 text-purple-600 accent-purple-500 focus:ring-purple-400"
                              />
                              <span className="text-base font-semibold text-slate-200 group-hover/item:text-white transition-colors">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )
                    )}

                    {/* Checkboxes */}
                    {field.fieldType === 'checkbox' && field.options && (
                      <div className="space-y-3.5">
                        {field.options.map((opt, oIdx) => {
                          const currentValues = answers[fieldKey] || [];
                          const isChecked = currentValues.includes(opt);
                          return (
                            <label key={oIdx} className={`flex items-center gap-4 p-4 rounded-2xl border bg-slate-950/40 hover:bg-purple-950/30 cursor-pointer transition-all group/item ${
                              hasError ? 'border-rose-500/60' : 'border-slate-800/80 hover:border-purple-500/40'
                            }`}>
                              <input 
                                type="checkbox" 
                                value={opt} 
                                checked={isChecked}
                                onChange={(e) => handleCheckboxChange(fieldKey, opt, e.target.checked)} 
                                className="w-5 h-5 rounded text-purple-600 accent-purple-500 focus:ring-purple-400"
                              />
                              <span className="text-base font-semibold text-slate-200 group-hover/item:text-white transition-colors">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* File Upload Field */}
                    {field.fieldType === 'fileUpload' && (
                      <div className="space-y-3">
                        <div className={`flex flex-col sm:flex-row items-center gap-5 border-2 border-dashed p-6 rounded-2xl bg-slate-950/40 transition-all ${
                          hasError ? 'border-rose-500' : 'border-slate-800 hover:border-purple-500/50'
                        }`}>
                          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-inner">
                            <FileUp size={28} />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <input 
                              type="file" 
                              onChange={(e) => handleFileChange(fieldKey, e.target.files[0], field.maxSizeMB)}
                              className="text-sm text-slate-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer w-full sm:w-auto transition-all shadow-md"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold pl-1 tracking-wide">Maximum permitted file size: {field.maxSizeMB || 5} MB</p>
                        {fileErrors[fieldKey] && (
                          <p className="text-xs text-rose-400 flex items-center gap-2 font-bold pl-1 mt-1">
                            <AlertCircle size={16} /> {fileErrors[fieldKey]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="bg-slate-900 p-8 rounded-[2rem] text-center text-slate-500 border border-slate-800">
              No questions available in this section.
            </div>
          )}

        </div>

        {/* Navigation & Submit Buttons Bar */}
        <div className="pt-6 flex items-center gap-4">
          {currentSectionIndex > 0 && (
            <button 
              type="button" 
              onClick={handlePrevSection}
              className="px-6 py-5 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-slate-800 shadow-xl flex items-center justify-center gap-2 transition-all duration-300"
            >
              <ChevronLeft size={20} /> Previous
            </button>
          )}

          {currentSectionIndex < totalSections - 1 ? (
            <button 
              type="button" 
              onClick={handleNextSection}
              className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-purple-900/50 hover:shadow-purple-700/80 flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              Next Section <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-purple-900/50 hover:shadow-purple-700/80 flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              <Send size={20} /> Submit Application
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

export default DynamicFormView;