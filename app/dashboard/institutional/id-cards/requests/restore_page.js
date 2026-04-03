
const fs = require('fs');
const path = require('path');

const content = `'use client';

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
  
  const institutionalConfig = {
    name: 'Colegio Nueva Esperanza',
    primaryColor: '#1e40af',
    logo: ''
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
  }, []);

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
        const hasGradeEntry = Object.keys(savedGrades).some(key => key.startsWith(\`curso-\${bulkValue}_\`) && key.endsWith(\`_\${s.id}\`));
        return hasGradeEntry || s.details?.cursoId === bulkValue || s.grade === bulkValue;
      });
    } else if (bulkType === 'program') {
      filtered = source.filter(s => s.details?.programId === bulkValue || s.details?.program === bulkValue || s.details?.specialty === bulkValue);
    }

    setGeneratedStudents(filtered);
    setIsGenerating(false);
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
          <div style={{ width: '65px', height: '65px', background: 'white', borderRadius: '50%', padding: '8px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: \`2px solid \${cardColor}\` }}>
             {institutionalConfig.logo ? <img src={institutionalConfig.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Shield color={cardColor} size={35} />}
          </div>
          <div style={{ flex: 1, paddingLeft: '15px', zIndex: 2, textAlign: 'center' }}>
             <h2 style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>— COLEGIO —</h2>
             <h3 style={{ margin: 0, fontSize: '18px', color: 'white', fontWeight: '950', letterSpacing: '0.5px' }}>NUEVA ESPERANZA</h3>
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
             <div style={{ background: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <QrCode size={110} color="#111827" />
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
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '900', letterSpacing: '1px' }}>COLEGIO NUEVA ESPERANZA</span>
          </div>
       </div>
    </div>
  );

  const HorizontalTemplate = ({ student }: { student: any }) => (
    <div style={{ width: ID_CARD_HEIGHT, height: ID_CARD_WIDTH, background: '#ffffff', borderRadius: '20px', overflow: 'hidden', position: 'relative', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, sans-serif', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
         <div style={{ height: '35px', background: cardColor, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative' }}>
            <div style={{ width: '30px', height: '30px', background: 'white', borderRadius: '50%', padding: '4px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: \`1.5px solid \${cardColor}\`, position: 'absolute', top: '2.5px' }}>
               {institutionalConfig.logo ? <img src={institutionalConfig.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Shield color={cardColor} size={18} />}
            </div>
           <div style={{ flex: 1, paddingLeft: '45px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: '950', letterSpacing: '0.5px' }}>COLEGIO NUEVA ESPERANZA</span>
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
       <motion.div animate={{ y: ['-100%', '600%'], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: \`linear-gradient(90deg, transparent, \${cardColor}, transparent)\`, zIndex: 5, boxShadow: \`0 0 20px \${cardColor}\` }} />
       <div style={{ position: 'absolute', top: '35px', right: '-45px', width: '180px', height: '40px', background: \`linear-gradient(90deg, \${cardColor}, #3b82f6)\`, transform: 'rotate(45deg)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
          <div style={{ height: '4px', width: '60px', background: \`linear-gradient(90deg, \${cardColor}, #4ade80)\`, margin: '20px auto', borderRadius: '50px' }}></div>
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
             <span style={{ fontSize: '14px', fontWeight: '950', color: 'white', letterSpacing: '1px' }}>LA ESPERANZA PREMIUM</span>
             <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>{userType === 'student' ? 'AUTHENTICATION SUCCESSFUL' : 'TEACHER ACCESS GRANTED'}</span>
          </div>
          <div style={{ background: 'white', padding: '8px', borderRadius: '15px', boxShadow: \`0 0 30px \${cardColor}30\` }}>
             <QrCode size={45} color="#050a18" />
          </div>
       </div>
    </div>
  );

  const BackCard = () => (
    <div style={{ width: activeTemplate === 'horizontal' ? ID_CARD_HEIGHT : ID_CARD_WIDTH, height: activeTemplate === 'horizontal' ? ID_CARD_WIDTH : ID_CARD_HEIGHT, background: 'white', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
        <div style={{ height: '80px', background: cardColor, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', padding: '6px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {institutionalConfig.logo ? <img src={institutionalConfig.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Shield color={cardColor} size={28} />}
           </div>
          <div style={{ flex: 1, paddingLeft: '15px', zIndex: 2 }}>
             <h2 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: '950', letterSpacing: '1px' }}>COLEGIO NUEVA ESPERANZA</h2>
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
                   <span style={{ fontSize: '11px', color: '#1f2937' }}><strong>Dirección:</strong> Calle Esperanza 123, Ciudad</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Phone size={14} color="#004a99" />
                   <span style={{ fontSize: '11px', color: '#1f2937' }}><strong>Teléfono:</strong> (01) 234-5678</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Mail size={14} color="#004a99" />
                   <span style={{ fontSize: '11px', color: '#1f2937' }}><strong>Email:</strong> contacto@colegionuevaesperanza.edu</span>
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
          <span style={{ color: 'white', fontSize: '10px', fontWeight: '900', letterSpacing: '2px' }}>CARNET PERSONAL E INTRANSFERIBLE</span>
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
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => window.print()}>
               <Printer size={18} /> Imprimir Carnets
            </button>
            <button className="btn-premium" style={{ background: institutionalConfig.primaryColor, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Download size={18} /> Exportar Lote
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '25px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', position: 'relative', zIndex: 20 }}>
              <div style={{ marginBottom: '20px', display: 'flex', background: '#f1f5f9', padding: '5px', borderRadius: '14px', gap: '5px' }}>
                 <button onClick={() => { setUserType(\'student\'); setGeneratedStudents([]); setSelectedStudent(null); }} style={{ flex: 1, padding: \'10px\', borderRadius: \'10px\', fontSize: \'12px\', fontWeight: \'900\', border: \'none\', cursor: \'pointer\', background: userType === \'student\' ? institutionalConfig.primaryColor : \'transparent\', color: userType === \'student\' ? \'white\' : \'#64748b\' }}>ESTUDIANTES</button>
                 <button onClick={() => { setUserType(\'teacher\'); setGeneratedStudents([]); setSelectedStudent(null); }} style={{ flex: 1, padding: \'10px\', borderRadius: \'10px\', fontSize: \'12px\', fontWeight: \'900\', border: \'none\', cursor: \'pointer\', background: userType === \'teacher\' ? institutionalConfig.primaryColor : \'transparent\', color: userType === \'teacher\' ? \'white\' : \'#64748b\' }}>DOCENTES</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '900', color: institutionalConfig.primaryColor, margin: 0, textTransform: 'uppercase' }}>1. {genMode === \'individual\' ? \'Persona\' : \'Lote\'}</h3>
                 <div style={{ display: \'flex\', background: \'#f1f5f9\', padding: \'4px\', borderRadius: \'12px\', gap: \'4px\' }}>
                    <button onClick={() => setGenMode(\'individual\')} style={{ padding: \'6px 12px\', borderRadius: \'8px\', fontSize: \'11px\', fontWeight: \'800\', background: genMode === \'individual\' ? \'white\' : \'transparent\', color: genMode === \'individual\' ? institutionalConfig.primaryColor : \'#64748b\' }}>Individual</button>
                    <button onClick={() => setGenMode(\'bulk\')} style={{ padding: \'6px 12px\', borderRadius: \'8px\', fontSize: \'11px\', fontWeight: \'800\', background: genMode === \'bulk\' ? \'white\' : \'transparent\', color: genMode === \'bulk\' ? institutionalConfig.primaryColor : \'#64748b\' }}>Por Lote</button>
                 </div>
              </div>

               {genMode === \'individual\' ? (
                  <div style={{ position: \'relative\' }}>
                     <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: \'100%\', height: \'50px\', padding: \'0 18px\', borderRadius: \'12px\', border: \'1px solid #e2e8f0\' }} />
                     <AnimatePresence>
                       {searchTerm && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: \'absolute\', top: \'58px\', left: 0, right: 0, background: \'white\', border: \'1px solid #e2e8f0\', borderRadius: \'12px\', zIndex: 100, padding: \'8px\', boxShadow: \'0 10px 25px rgba(0,0,0,0.1)\' }}>
                            {filteredUsers.length > 0 ? filteredUsers.slice(0, 5).map(u => (
                               <div key={u.id} onClick={() => handleSelectStudent(u)} style={{ padding: \'10px\', borderRadius: \'8px\', cursor: \'pointer\', display: \'flex\', alignItems: \'center\', gap: \'10px\' }}>
                                 <div style={{ width: \'30px\', height: \'30px\', borderRadius: \'50%\', background: \'#f1f5f9\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}><User size={14} /></div>
                                 <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: \'800\', fontSize: \'13px\' }}>{u.name}</p>
                                    <p style={{ margin: 0, fontSize: \'10px\', color: \'#64748b\' }}>ID: {u.id} • {getUserSubtitle(u)}</p>
                                 </div>
                               </div>
                            )) : <div style={{ padding: \'10px\', textAlign: \'center\', fontSize: \'12px\' }}>No hay resultados</div>}
                          </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
               ) : (
                  <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'15px\' }}>
                     <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr 1fr\', gap: \'8px\' }}>
                        <button onClick={() => { setBulkType(\'all\'); setBulkValue(\'\'); }} style={{ padding: \'10px\', borderRadius: \'10px\', border: bulkType === \'all\' ? \`2px solid \${institutionalConfig.primaryColor}\` : \'1px solid #e2e8f0\', fontSize: \'10px\', fontWeight: \'800\' }}>TODOS</button>
                        <button onClick={() => setBulkType(\'course\')} style={{ padding: \'10px\', borderRadius: \'10px\', border: bulkType === \'course\' ? \`2px solid \${institutionalConfig.primaryColor}\` : \'1px solid #e2e8f0\', fontSize: \'10px\', fontWeight: \'800\' }}>CURSO</button>
                        <button onClick={() => setBulkType(\'program\')} style={{ padding: \'10px\', borderRadius: \'10px\', border: bulkType === \'program\' ? \`2px solid \${institutionalConfig.primaryColor}\` : \'1px solid #e2e8f0\', fontSize: \'10px\', fontWeight: \'800\' }}>PROG.</button>
                     </div>
                     {(bulkType === \'course\' || bulkType === \'program\') && (
                        <select style={{ height: \'45px\', borderRadius: \'10px\', border: \'1px solid #e2e8f0\', padding: \'0 10px\' }} value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}>
                           <option value="">Seleccione...</option>
                           {(bulkType === \'course\' ? courses : programs).map((i: any) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                        </select>
                     )}
                     <button onClick={handleGenerateBulk} style={{ background: institutionalConfig.primaryColor, color: \'white\', height: \'48px\', borderRadius: \'12px\', fontWeight: \'800\', border: \'none\' }}>GENERAR LOTE</button>
                  </div>
               )}
            </div>

            <div className="glass-panel" style={{ padding: \'25px\', background: \'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
               <h3 style={{ fontSize: '13px', fontWeight: '900', color: institutionalConfig.primaryColor, marginBottom: '15px' }}>2. DISEÑO</h3>
               <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {['#1e40af', '#4f46e5', '#0891b2', '#dc2626', '#1e293b'].map(c => <button key={c} onClick={() => setCardColor(c)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: c, border: cardColor === c ? '2px solid white' : 'none', boxShadow: cardColor === c ? `0 0 0 2px ${c}` : 'none' }} />)}
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['vertical', 'horizontal', 'premium'].map(t => <button key={t} onClick={() => setActiveTemplate(t)} style={{ padding: '12px', borderRadius: '10px', border: activeTemplate === t ? `2px solid ${institutionalConfig.primaryColor}` : '1px solid #e2e8f0', background: activeTemplate === t ? `${institutionalConfig.primaryColor}08` : 'white', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>{t}</button>)}
               </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {genMode === 'individual' ? (
              <div onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px', cursor: 'pointer' }}>
                <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d', position: 'relative', width: activeTemplate === 'horizontal' ? ID_CARD_HEIGHT : ID_CARD_WIDTH, height: activeTemplate === 'horizontal' ? ID_CARD_WIDTH : ID_CARD_HEIGHT }}>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>{renderActiveTemplate(currentStudent)}</div>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><BackCard /></div>
                </motion.div>
              </div>
            ) : (
              <div className="bulk-print-container" style={{ display: 'grid', gridTemplateColumns: activeTemplate === 'horizontal' ? '1fr' : '1fr 1fr', gap: '20px', width: '100%' }}>
                {generatedStudents.map((s, i) => <div key={i} style={{ transform: activeTemplate === 'horizontal' ? 'scale(0.8)' : 'scale(0.6)', transformOrigin: 'top center', marginBottom: activeTemplate === 'horizontal' ? '-40px' : '-180px' }}>{renderActiveTemplate(s)}</div>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{\`
        @media print {
          body * { visibility: hidden; }
          .bulk-print-container, .bulk-print-container * { visibility: visible; }
          .bulk-print-container { position: absolute; left: 0; top: 0; display: block !important; }
        }
      \`}</style>
    </DashboardLayout>
  );
}

export default IDCardGenerator;
\`;

const targetFile = 'c:\\\\Users\\\\JoshuaGamingTV\\\\.gemini\\\\antigravity\\\\scratch\\\\edunexus-master\\\\app\\\\dashboard\\\\institutional\\\\id-cards\\\\requests\\\\page.tsx';

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully written to ' + targetFile);
`;

const file_path = 'c:\\Users\\JoshuaGamingTV\\.gemini\\antigravity\\scratch\\edunexus-master\\app\\dashboard\\institutional\\id-cards\\requests\\restore_page.js';

fs.writeFileSync(file_path, content, 'utf8');
console.log('Successfully created ' + file_path);
