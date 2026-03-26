'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  Printer, 
  Download, 
  User, 
  CreditCard, 
  Layout, 
  Palette, 
  Shield, 
  QrCode, 
  CheckCircle2, 
  X, 
  Plus,
  RefreshCcw,
  Contact,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Users,
  BookOpen,
  Briefcase,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ID_CARD_WIDTH = '400px';
const ID_CARD_HEIGHT = '600px';

const IDCardGenerator = () => {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [registeredTeachers, setRegisteredTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeTemplate, setActiveTemplate] = useState('vertical');
  const [cardColor, setCardColor] = useState('#1e40af');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [genMode, setGenMode] = useState<'individual' | 'bulk'>('individual');
  const [bulkType, setBulkType] = useState<'all' | 'course' | 'program'>('all');
  const [bulkValue, setBulkValue] = useState('');
  const [generatedStudents, setGeneratedStudents] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [courses, setCourses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  
  // Institutional Configuration State
  const [instName, setInstName] = useState('Colegio Nueva Esperanza');
  const [instSlogan, setInstSlogan] = useState('Educación Integral para un Futuro Brillante');
  const [instLogo, setInstLogo] = useState('');
  const [instColor, setInstColor] = useState('#1e40af');
  const [instAddress, setInstAddress] = useState('Calle Esperanza 123, Ciudad');
  const [instPhone, setInstPhone] = useState('(01) 234-5678');
  const [instEmail, setInstEmail] = useState('contacto@colegionuevaesperanza.edu');
  const [logoSize, setLogoSize] = useState(65);
  const [logoY, setLogoY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const institutionalConfig = {
    name: instName,
    slogan: instSlogan,
    primaryColor: instColor,
    logo: instLogo,
    address: instAddress,
    phone: instPhone,
    email: instEmail
  };

  useEffect(() => {
    const savedStudents = localStorage.getItem('edunexus_registered_students');
    if (savedStudents) setRegisteredStudents(JSON.parse(savedStudents));

    const savedTeachers = localStorage.getItem('edunexus_registered_teachers');
    if (savedTeachers) setRegisteredTeachers(JSON.parse(savedTeachers));

    const savedCursos = localStorage.getItem('edunexus_cursos');
    if (savedCursos) setCourses(JSON.parse(savedCursos));

    const savedPrograms = localStorage.getItem('edunexus_academic_programs');
    if (savedPrograms) setPrograms(JSON.parse(savedPrograms));

    const globalAppearanceSaved = localStorage.getItem('edunexus_institutional_appearance');
    const globalAppearance = globalAppearanceSaved ? JSON.parse(globalAppearanceSaved) : null;

    const savedConfig = localStorage.getItem('edunexus_inst_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.name) setInstName(config.name);
      if (config.slogan) setInstSlogan(config.slogan);
      if (config.logo) setInstLogo(config.logo);
      else if (globalAppearance?.logo) setInstLogo(globalAppearance.logo);
      if (config.color) { setInstColor(config.color); setCardColor(config.color); }
      if (config.address) setInstAddress(config.address);
      if (config.phone) setInstPhone(config.phone);
      if (config.email) setInstEmail(config.email);
      if (config.logoSize) setLogoSize(config.logoSize);
      if (config.logoY) setLogoY(config.logoY);
    } else if (globalAppearance) {
      if (globalAppearance.logo) setInstLogo(globalAppearance.logo);
      if (globalAppearance.primaryColor) { setInstColor(globalAppearance.primaryColor); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('edunexus_inst_config', JSON.stringify({
      name: instName,
      slogan: instSlogan,
      logo: instLogo,
      color: instColor,
      address: instAddress,
      phone: instPhone,
      email: instEmail,
      logoSize,
      logoY
    }));
  }, [isLoaded, instName, instSlogan, instLogo, instColor, instAddress, instPhone, instEmail, logoSize, logoY]);
  
  useEffect(() => {
    if (!isLoaded) return;
    const syncGlobalAppearance = () => {
      const globalAppearanceSaved = localStorage.getItem('edunexus_institutional_appearance');
      if (!globalAppearanceSaved) return;
      try {
        const globalAppearance = JSON.parse(globalAppearanceSaved);
        if (globalAppearance.primaryColor && globalAppearance.primaryColor !== instColor) {
          setInstColor(globalAppearance.primaryColor);
        }
        if (globalAppearance.logo && globalAppearance.logo !== instLogo) {
          setInstLogo(globalAppearance.logo);
        }
      } catch (e) { console.error(e); }
    };
    const handleStorage = (e: StorageEvent) => { if (e.key === 'edunexus_institutional_appearance') syncGlobalAppearance(); };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(syncGlobalAppearance, 2000);
    return () => { window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, [isLoaded, instColor, instLogo]);

  const filteredUsers = (userType === 'student' ? registeredStudents : registeredTeachers).filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.includes(searchTerm)
  );

  const getUserSubtitle = (user: any) => {
    if (userType === 'student') return user.grade || '6° A';
    return user.details?.specialty || user.specialty || user.details?.program || 'Docente de Planta';
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchTerm('');
    setGenMode('individual');
  };

  const handleGenerateBulk = () => {
    setIsGenerating(true);
    let filtered: any[] = [];
    const source = userType === 'student' ? registeredStudents : registeredTeachers;

    if (bulkType === 'all') {
      filtered = source;
    } else if (bulkType === 'course') {
      const savedGrades = JSON.parse(localStorage.getItem('edunexus_grades') || '{}');
      filtered = source.filter(s => {
        const hasGradeEntry = Object.keys(savedGrades).some(key => key.startsWith(`curso-${bulkValue}_`) && key.endsWith(`_${s.id}`));
        return hasGradeEntry || s.details?.cursoId === bulkValue || s.grade === bulkValue;
      });
    } else if (bulkType === 'program') {
      filtered = source.filter(s => s.details?.programId === bulkValue || s.details?.program === bulkValue || s.details?.specialty === bulkValue);
    }

    setGeneratedStudents(filtered);
    setIsGenerating(false);
  };

  const handleExportBulk = () => {
    if (generatedStudents.length === 0) return;
    
    const handleDownloadCSV = (data: any[]) => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Nombre,Grado/Especialidad\n"
        + data.map(u => `${u.id},${u.name},${getUserSubtitle(u)}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `lote_${userType}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    handleDownloadCSV(generatedStudents);
  };

  const defaultStudent = {
    id: '20234567',
    name: 'Javier Gómez',
    grade: '6° A',
    photo: '',
  };

  const currentStudent = selectedStudent || defaultStudent;

  const GuillocheBackground = ({ color, opacity }: { color: string, opacity: number }) => (
    <div style={{ position: 'absolute', inset: 0, opacity, zIndex: 0, pointerEvents: 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="guilloche" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q 5 0 10 10" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#guilloche)" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="0.1" />
        <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="0.1" />
        <circle cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="0.1" />
      </svg>
    </div>
  );

  const VerticalTemplate = ({ student }: { student: any }) => (
    <div style={{ width: ID_CARD_WIDTH, height: ID_CARD_HEIGHT, background: '#ffffff', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, sans-serif', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
       <div style={{ height: '95px', background: cardColor, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: `${logoSize}px`, height: `${logoSize}px`, background: 'white', borderRadius: '50%', padding: '8px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${cardColor}`, transform: `translateY(${logoY}px)` }}>
             {instLogo ? <img src={instLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Shield color={cardColor} size={logoSize * 0.5} />}
          </div>
          <div style={{ flex: 1, paddingLeft: '15px', zIndex: 2, textAlign: 'center' }}>
             <h2 style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>— {instName.split(' ')[0]} —</h2>
             <h3 style={{ margin: 0, fontSize: '18px', color: 'white', fontWeight: '950', letterSpacing: '0.5px' }}>{instName.split(' ').slice(1).join(' ').toUpperCase()}</h3>
          </div>
       </div>
        <div style={{ position: 'relative', height: '35px', width: '100%', zIndex: 1, marginTop: '-15px' }}>
           <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
              <path d="M0,80 C150,150 350,0 500,80 L500,0 L0,0 Z" fill={cardColor} />
             <path d="M0,100 C150,170 350,20 500,100 L500,80 C350,0 150,150 0,80 Z" fill="#ffffff" />
             <path d="M0,120 C150,190 350,40 500,120 L500,100 C350,20 150,170 0,100 Z" fill="#44ad38" />
             <path d="M0,140 C150,210 350,60 500,140 L500,120 C350,40 150,190 0,120 Z" fill="#eab308" />
          </svg>
       </div>
       <div style={{ flex: 1, padding: '15px 25px', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
             <div style={{ width: '135px', height: '165px', border: '1px solid #d1d5db', padding: '3px', background: 'white', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                   {student.photo ? (
                      <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                         <User size={60} color="#9ca3af" />
                      </div>
                   )}
                </div>
             </div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
                <div>
                   <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '800' }}>Nombre: </span>
                   <span style={{ fontSize: '13px', color: '#111827', fontWeight: '950' }}>{student.name}</span>
                </div>
                <div>
                   <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '800' }}>{userType === 'student' ? 'Matrícula:' : 'Cód. Docente:'} </span>
                   <span style={{ fontSize: '13px', color: '#111827', fontWeight: '950' }}>{student.id}</span>
                </div>
                <div>
                   <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '800' }}>{userType === 'student' ? 'Grado:' : 'Especialidad:'} </span>
                   <span style={{ fontSize: '13px', color: '#111827', fontWeight: '950' }}>{getUserSubtitle(student)}</span>
                </div>
                <div>
                   <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '800' }}>Vigencia: </span>
                   <span style={{ fontSize: '13px', color: '#111827', fontWeight: '950' }}>2026-2027</span>
                </div>
             </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
             <div style={{ background: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${student.id}&color=111827`} 
                  alt="QR Code"
                  style={{ width: '110px', height: '110px' }}
                />
             </div>
              <div style={{ padding: '6px 20px', background: cardColor, color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: '950', textAlign: 'center', width: '200px', borderBottom: '3px solid #44ad38' }}>
                {userType === 'student' ? 'CONTROL DE ASISTENCIA' : 'ACCESO DOCENTE'}
             </div>
          </div>
       </div>
       <div style={{ height: '50px', position: 'relative', marginTop: 'auto' }}>
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ position: 'absolute', top: '-40px', left: 0, height: '40px', width: '100%', transform: 'scaleY(-1)' }}>
              <path d="M0,80 C150,150 350,0 500,80 L500,0 L0,0 Z" fill={cardColor} />
              <path d="M0,100 C150,170 350,20 500,100 L500,80 C350,0 150,150 0,80 Z" fill="#ffffff" />
              <path d="M0,120 C150,190 350,40 500,120 L500,100 C350,20 150,170 0,100 Z" fill="#44ad38" />
           </svg>
           <div style={{ height: '50px', background: cardColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>{institutionalConfig.slogan}</span>
          </div>
       </div>
    </div>
  );

  const HorizontalTemplate = ({ student }: { student: any }) => (
    <div style={{ width: ID_CARD_HEIGHT, height: ID_CARD_WIDTH, background: '#ffffff', borderRadius: '20px', overflow: 'hidden', position: 'relative', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, sans-serif', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
         <div style={{ height: '35px', background: cardColor, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative' }}>
            <div style={{ width: '30px', height: '30px', background: 'white', borderRadius: '50%', padding: '4px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${cardColor}`, position: 'absolute', top: '2.5px' }}>
               {instLogo ? <img src={instLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Shield color={cardColor} size={18} />}
            </div>
           <div style={{ flex: 1, paddingLeft: '45px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: '950', letterSpacing: '0.5px' }}>{instName.toUpperCase()}</span>
           </div>
           <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.6)', fontWeight: '900', letterSpacing: '2px' }}>{userType === 'student' ? 'STUDENT ID' : 'DOCENTE ID'}</div>
        </div>
         <div style={{ position: 'relative', height: '12px', width: '100%', zIndex: 1 }}>
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
               <path d="M0,80 C150,150 350,0 500,80 L500,0 L0,0 Z" fill={cardColor} />
              <path d="M0,100 C150,170 350,20 500,100 L500,80 C350,0 150,150 0,80 Z" fill="#ffffff" />
              <path d="M0,120 C150,190 350,40 500,120 L500,100 C350,20 150,170 0,100 Z" fill="#44ad38" />
              <path d="M0,140 C150,210 350,60 500,140 L500,120 C350,40 150,190 0,120 Z" fill="#eab308" />
           </svg>
        </div>
        <div style={{ flex: 1, padding: '10px 30px', display: 'flex', gap: '25px', alignItems: 'center' }}>
           <div style={{ width: '100px', height: '125px', border: '1px solid #d1d5db', padding: '3px', background: 'white', borderRadius: '6px', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '3px' }}>
                 {student.photo ? (
                    <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                       <User size={50} color="#9ca3af" />
                    </div>
                 )}
              </div>
           </div>
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                 <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '950', color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>{student.name.toUpperCase()}</h3>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '950', color: 'white', background: '#44ad38', padding: '3px 12px', borderRadius: '4px' }}>{userType === 'student' ? 'ESTUDIANTE' : 'DOCENTE'}</span>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#64748b' }}>{userType === 'student' ? 'GRADO' : 'ESP.'} {getUserSubtitle(student)}</span>
                 </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '10px', background: 'rgba(0, 74, 153, 0.02)', borderRadius: '8px', border: '1px solid rgba(0, 74, 153, 0.05)' }}>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '8px', color: '#1e3a8a', fontWeight: '850', textTransform: 'uppercase' }}>{userType === 'student' ? 'MATRÍCULA' : 'CÓD. DOCENTE'}</span>
                    <span style={{ fontSize: '14px', color: '#111827', fontWeight: '950' }}>{student.id}</span>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '8px', color: '#eab308', fontWeight: '850', textTransform: 'uppercase' }}>VIGENCIA</span>
                    <span style={{ fontSize: '14px', color: '#111827', fontWeight: '950' }}>2026-2027</span>
                 </div>
              </div>
           </div>
           <div style={{ background: 'white', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <QrCode size={60} color="#111827" />
           </div>
        </div>
         <div style={{ height: '32px', background: cardColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 25px', color: 'white' }}>
           <span style={{ fontSize: '9px', fontWeight: '950', letterSpacing: '1px' }}>{userType === 'student' ? 'CONTROL DE ASISTENCIA' : 'ACCESO DOCENTE'}</span>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={12} color="#44ad38" />
              <span style={{ fontSize: '8px', fontWeight: '900', opacity: 0.8 }}>EDUNEXUS SYSTEM 2026</span>
           </div>
        </div>
    </div>
  );

  const PremiumTemplate = ({ student }: { student: any }) => (
    <div style={{ width: ID_CARD_WIDTH, height: ID_CARD_HEIGHT, background: '#050a18', borderRadius: '45px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', fontFamily: '"Inter", sans-serif', color: 'white', boxShadow: '0 60px 120px -20px rgba(0,0,0,0.8), inset 0 0 100px rgba(0,0,0,0.6)' }}>
       <GuillocheBackground color={cardColor} opacity={0.2} />
       <motion.div animate={{ y: ['-100%', '600%'], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg, transparent, ${cardColor}, transparent)`, zIndex: 5, boxShadow: `0 0 20px ${cardColor}` }} />
       <div style={{ position: 'absolute', top: '35px', right: '-45px', width: '180px', height: '40px', background: `linear-gradient(90deg, ${cardColor}, #3b82f6)`, transform: 'rotate(45deg)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#050a18', fontSize: '11px', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase' }}>{userType === 'student' ? 'ULTRA MASTER' : 'DOCENTE VIP'}</span>
       </div>
       <div style={{ padding: '30px 40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cardColor, animation: 'pulse 2s infinite' }}></div>
                <span style={{ fontSize: '10px', fontWeight: '950', letterSpacing: '5px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>SECURE ACCESS</span>
             </div>
             <div style={{ width: '52px', height: '42px', background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)', borderRadius: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 30px rgba(251,191,36,0.2), inset 0 0 10px rgba(0,0,0,0.3)' }}>
                <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '10%', right: '10%', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px' }}></div>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }}></div>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.2)' }}></div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.5) 50%, transparent 55%)', backgroundSize: '200% 200%', animation: 'shimmer 4s infinite' }}></div>
             </div>
          </div>
          <div style={{ width: '170px', height: '200px', borderRadius: '45px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.15)', padding: '12px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)', marginBottom: '30px', position: 'relative' }}>
             <div style={{ width: '100%', height: '100%', borderRadius: '35px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                {student.photo ? (
                   <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={70} color="rgba(255,255,255,0.1)" /></div>
                )}
             </div>
             <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '5px 15px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '9px', fontWeight: '950', color: cardColor, letterSpacing: '2px' }}>MATCHED</span>
             </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '950', color: 'white', letterSpacing: '1px', textShadow: '0 10px 20px rgba(0,0,0,0.5)', textAlign: 'center' }}>{student.name.toUpperCase()}</h2>
          <div style={{ height: '4px', width: '60px', background: `linear-gradient(90deg, ${cardColor}, #4ade80)`, margin: '20px auto', borderRadius: '50px' }}></div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '25px 0', marginTop: 'auto' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '0 50px' }}>
                <div>
                   <p style={{ margin: 0, fontSize: '8px', color: cardColor, fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{userType === 'student' ? 'Matrícula' : 'Cód. Docente'}</p>
                   <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white' }}>{student.id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ margin: 0, fontSize: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: '950', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{userType === 'student' ? 'Grado' : 'Especialidad'}</p>
                   <p style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: 'white' }}>{getUserSubtitle(student)}</p>
                </div>
             </div>
          </div>
       </div>
       <div style={{ padding: '25px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: '950', color: 'white', letterSpacing: '1px' }}>{(instName || 'Colegio').split(' ')[0].toUpperCase()} PREMIUM</span>
             <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>{userType === 'student' ? 'AUTHENTICATION SUCCESSFUL' : 'TEACHER ACCESS GRANTED'}</span>
          </div>
          <div style={{ background: 'white', padding: '8px', borderRadius: '15px', boxShadow: `0 0 30px ${cardColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=45x45&data=${student.id}&color=050a18`} 
                alt="QR Code"
                style={{ width: '45px', height: '45px' }}
              />
          </div>
       </div>
    </div>
  );

  const BackCard = () => (
    <div style={{ width: activeTemplate === 'horizontal' ? ID_CARD_HEIGHT : ID_CARD_WIDTH, height: activeTemplate === 'horizontal' ? ID_CARD_WIDTH : ID_CARD_HEIGHT, background: 'white', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
        <div style={{ height: '80px', background: cardColor, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', padding: '6px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {instLogo ? <img src={instLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Shield color={cardColor} size={28} />}
           </div>
          <div style={{ flex: 1, paddingLeft: '15px', zIndex: 2 }}>
             <h2 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: '950', letterSpacing: '1px' }}>{instName.toUpperCase()}</h2>
          </div>
       </div>
        <div style={{ position: 'relative', height: '25px', width: '100%', zIndex: 1, marginTop: '-12px' }}>
           <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
              <path d="M0,80 C150,150 350,0 500,80 L500,0 L0,0 Z" fill={cardColor} />
             <path d="M0,100 C150,170 350,20 500,100 L500,80 C350,0 150,150 0,80 Z" fill="#ffffff" />
          </svg>
       </div>
       <div style={{ padding: '25px', flex: 1 }}>
          <div style={{ background: 'rgba(0, 74, 153, 0.05)', borderRadius: '12px', padding: '15px', border: '1px solid rgba(0, 74, 153, 0.1)', marginBottom: '20px' }}>
             <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#004a99', fontWeight: '950', textAlign: 'center', borderBottom: '1px solid rgba(0, 74, 153, 0.2)', paddingBottom: '5px' }}>INFORMACIÓN DE CONTACTO</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <MapPin size={14} color="#004a99" />
                   <span style={{ fontSize: '11px', color: '#1f2937' }}><strong>Dirección:</strong> {instAddress}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Phone size={14} color="#004a99" />
                   <span style={{ fontSize: '11px', color: '#1f2937' }}><strong>Teléfono:</strong> {instPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Mail size={14} color="#004a99" />
                   <span style={{ fontSize: '11px', color: '#1f2937' }}><strong>Email:</strong> {instEmail}</span>
                </div>
             </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #003366 0%, #001f3f 100%)', borderRadius: '12px', padding: '15px', color: 'white' }}>
             <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '950', textAlign: 'center' }}>{userType === 'student' ? 'NORMAS DEL ESTUDIANTE' : 'NORMAS DEL DOCENTE'}</h3>
             <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                <li style={{ marginBottom: '4px' }}>Portar este carnet en todo momento.</li>
                <li style={{ marginBottom: '4px' }}>{userType === 'student' ? 'Respetar el reglamento escolar.' : 'Respetar el código de ética docente.'}</li>
                <li>En caso de pérdida, reportar a la institución.</li>
             </ul>
             <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
                <Contact size={24} color="rgba(255,255,255,0.5)" />
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: '24px' }}></div>
                <Shield size={24} color="rgba(255,255,255,0.5)" />
             </div>
          </div>
       </div>
        <div style={{ height: '40px', background: cardColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}>
          <span style={{ color: 'white', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>{institutionalConfig.slogan}</span>
       </div>
    </div>
  );

  const renderActiveTemplate = (u: any) => {
    switch (activeTemplate) {
      case 'vertical': return <VerticalTemplate student={u} />;
      case 'horizontal': return <HorizontalTemplate student={u} />;
      case 'premium': return <PremiumTemplate student={u} />;
      default: return <VerticalTemplate student={u} />;
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '950', color: '#1e293b', letterSpacing: '-1.5px', margin: 0 }}>Generación de Carnetización</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Seleccione una plantilla y personalice los datos correspondientes.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-premium" 
              style={{ background: '#475569', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(71, 85, 105, 0.2)' }} 
              onClick={() => window.print()}
            >
               <Printer size={18} /> Imprimir Carnets
            </button>
            <button 
              className="btn-premium" 
              style={{ 
                background: instColor, 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                boxShadow: `0 4px 14px ${instColor}40`,
                transition: 'all 0.3s ease'
              }}
              onClick={handleExportBulk}
            >
               <Download size={18} /> Exportar Lote
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', position: 'relative', alignItems: 'flex-start' }}>
          
          {/* Column 1: Institutional Config & User Selection */}
          <div style={{ width: '330px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 0. CONFIGURACIÓN INSTITUCIONAL */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#1e293b' }}>
                  <Shield size={18} color={cardColor} />
                  <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Config. Institucional</h3>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Nombre Institución</label>
                    <input
                      type="text"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Eslogan</label>
                    <input
                      type="text"
                      value={instSlogan}
                      onChange={(e) => setInstSlogan(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                    />
                  </div>
                  
                  <div>
                     <label style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Contacto Reverso</label>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input type="text" value={instAddress} onChange={(e) => setInstAddress(e.target.value)} placeholder="Dirección" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <input type="text" value={instPhone} onChange={(e) => setInstPhone(e.target.value)} placeholder="Teléfono" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                     </div>
                  </div>
               </div>
            </div>

            {/* 1. SELECCIÓN DE USUARIO O LOTE */}
            <div className="glass-panel" style={{ padding: '20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
              <div style={{ marginBottom: '16px', display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                 <button onClick={() => { setUserType('student'); setGeneratedStudents([]); setSelectedStudent(null); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', border: 'none', cursor: 'pointer', background: userType === 'student' ? instColor : 'transparent', color: userType === 'student' ? 'white' : '#64748b' }}>ESTUDIANTES</button>
                 <button onClick={() => { setUserType('teacher'); setGeneratedStudents([]); setSelectedStudent(null); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', border: 'none', cursor: 'pointer', background: userType === 'teacher' ? instColor : 'transparent', color: userType === 'teacher' ? 'white' : '#64748b' }}>DOCENTES</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '900', color: instColor, margin: 0, textTransform: 'uppercase' }}>1. {genMode === 'individual' ? 'Persona' : 'Lote'}</h3>
                 <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
                    <button onClick={() => setGenMode('individual')} style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: genMode === 'individual' ? 'white' : 'transparent', color: genMode === 'individual' ? instColor : '#64748b', boxShadow: genMode === 'individual' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Individual</button>
                    <button onClick={() => setGenMode('bulk')} style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: genMode === 'bulk' ? 'white' : 'transparent', color: genMode === 'bulk' ? instColor : '#64748b', boxShadow: genMode === 'bulk' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Lote</button>
                 </div>
              </div>

               {genMode === 'individual' ? (
                  <div style={{ position: 'relative' }}>
                     <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                     <AnimatePresence>
                       {searchTerm && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: 'absolute', top: '48px', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', zIndex: 100, padding: '5px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                            {filteredUsers.length > 0 ? filteredUsers.slice(0, 5).map(u => (
                               <div key={u.id} onClick={() => handleSelectStudent(u)} style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                 <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={12} /></div>
                                 <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: '800', fontSize: '12px' }}>{u.name}</p>
                                    <p style={{ margin: 0, fontSize: '9px', color: '#64748b' }}>{u.id} • {getUserSubtitle(u)}</p>
                                 </div>
                               </div>
                            )) : <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>No hay resultados</div>}
                          </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                        <button onClick={() => { setBulkType('all'); setBulkValue(''); }} style={{ padding: '6px', borderRadius: '8px', border: bulkType === 'all' ? `2px solid ${instColor}` : '1px solid #e2e8f0', fontSize: '9px', fontWeight: '800' }}>TODOS</button>
                        <button onClick={() => setBulkType('course')} style={{ padding: '6px', borderRadius: '8px', border: bulkType === 'course' ? `2px solid ${instColor}` : '1px solid #e2e8f0', fontSize: '9px', fontWeight: '800' }}>CURSO</button>
                        <button onClick={() => setBulkType('program')} style={{ padding: '6px', borderRadius: '8px', border: bulkType === 'program' ? `2px solid ${instColor}` : '1px solid #e2e8f0', fontSize: '9px', fontWeight: '800' }}>PROG.</button>
                     </div>
                     {(bulkType === 'course' || bulkType === 'program') && (
                        <select style={{ height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 8px', fontSize: '12px' }} value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}>
                           <option value="">Seleccione {bulkType === 'course' ? 'Curso' : 'Programa'}...</option>
                           {(bulkType === 'course' ? courses : programs).map((i: any) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                        </select>
                     )}
                     <button onClick={handleGenerateBulk} style={{ background: instColor, color: 'white', height: '42px', borderRadius: '10px', fontWeight: '800', border: 'none', fontSize: '12px', boxShadow: `0 4px 12px ${instColor}30` }}>GENERAR LOTE</button>
                  </div>
               )}
            </div>
          </div>

          {/* Column 2: Center (Sticky Preview) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'sticky', top: '100px' }}>
            <div className="preview-container" style={{ position: 'relative', width: activeTemplate === 'horizontal' ? ID_CARD_HEIGHT : ID_CARD_WIDTH }}>
              <AnimatePresence mode="wait">
                 {genMode === 'individual' ? (
                    <motion.div key="individual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onClick={() => setIsFlipped(!isFlipped)} style={{ cursor: 'pointer', perspective: '1000px' }}>
                      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }} style={{ transformStyle: 'preserve-3d', position: 'relative' }}>
                        <div style={{ backfaceVisibility: 'hidden' }}>{renderActiveTemplate(currentStudent)}</div>
                        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', top: 0, left: 0 }}>
                           <BackCard />
                        </div>
                      </motion.div>
                    </motion.div>
                 ) : (
                    <motion.div key="bulk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxHeight: '720px', overflowY: 'auto', padding: '10px' }}>
                         {generatedStudents.map((s, idx) => (
                            <div key={idx} style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-60px' }}>
                               {renderActiveTemplate(s)}
                            </div>
                         ))}
                         {generatedStudents.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                               <Users size={40} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                               <p style={{ color: '#64748b', fontWeight: '700' }}>No se han generado carnets aún.</p>
                            </div>
                         )}
                      </div>
                    </motion.div>
                 )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: Personalization */}
          <div style={{ width: '330px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 2. DISEÑO / PERSONALIZACIÓN */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#1e293b' }}>
                  <Palette size={18} color={cardColor} />
                  <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personalización</h3>
               </div>

               <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>Color de Marca</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={cardColor}
                      onChange={(e) => setCardColor(e.target.value)}
                      style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', fontFamily: 'monospace' }}>{cardColor.toUpperCase()}</div>
                  </div>
               </div>

               <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Logo y Posición</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      value={instLogo}
                      placeholder="URL del Logo..."
                      onChange={(e) => setInstLogo(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8' }}>Tamaño: {logoSize}px</span>
                        <input type="range" min="30" max="150" value={logoSize} onChange={(e) => setLogoSize(parseInt(e.target.value))} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8' }}>Posición Y: {logoY}px</span>
                        <input type="range" min="-50" max="50" value={logoY} onChange={(e) => setLogoY(parseInt(e.target.value))} style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'block' }}>Modelo de Estilo</label>
                  {['vertical', 'horizontal', 'premium'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setActiveTemplate(t)} 
                      style={{ 
                        padding: '10px', borderRadius: '10px', border: activeTemplate === t ? `2px solid ${instColor}` : '1px solid #e2e8f0', 
                        background: activeTemplate === t ? `${instColor}08` : 'white', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      {t} {activeTemplate === t && <CheckCircle2 size={14} color={instColor} />}
                    </button>
                  ))}
               </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
               <CreditCard size={24} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
               <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Haga clic en el carnet para ver el reverso e información de seguridad.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="id-cards-print-zone" style={{ display: 'none' }}>
        {(genMode === 'individual' ? [currentStudent] : generatedStudents).map((s, idx) => (
          <div key={idx} style={{ pageBreakAfter: 'always', padding: '1cm', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1cm', background: 'white' }}>
            <div className="print-card-container" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              {renderActiveTemplate(s)}
            </div>
            <div className="print-card-container" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <BackCard />
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          @page {
            margin: 0 !important;
            size: auto;
          }
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            height: auto !important;
            overflow: visible !important;
          }
          /* Targeted hiding to avoid blank page */
          body * {
            visibility: hidden;
          }
          #id-cards-print-zone, #id-cards-print-zone * {
            visibility: visible !important;
          }
          #id-cards-print-zone { 
            display: block !important; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            background: white !important;
            z-index: 9999;
          }
          /* Ensure rounded corners and colors work */
          .print-card-container {
            overflow: hidden !important;
            isolation: isolate !important;
            -webkit-print-color-adjust: exact !important;
            border: 1px solid #d1d5db !important;
            background: white !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default IDCardGenerator;
