'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import Draggable from 'react-draggable';
import { db } from '@/lib/db';
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
  
  // Designer State
  const [designMode, setDesignMode] = useState(true);
  const [positions, setPositions] = useState<any>({});
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const addToHistory = (action: any) => setHistory(prev => [...prev, action]);
  
  const [headerDesign, setHeaderDesign] = useState('standard');
  const [bgGradient, setBgGradient] = useState('');
  const [bgPattern, setBgPattern] = useState('none');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.1);

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
  const [backLogoSize, setBackLogoSize] = useState(50);
  const [backLogoY, setBackLogoY] = useState(0);
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
    const fetchRealData = async () => {
      try {
        localStorage.removeItem('edunexus_registered_students');
        localStorage.removeItem('edunexus_registered_teachers');
        const studentsData = await db.list('students');
        const teachersData = await db.list('teachers');
        setRegisteredStudents(studentsData);
        setRegisteredTeachers(teachersData);
      } catch(e) { console.error("Error fetching for carnetization:", e); }
    };
    fetchRealData();

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
      if (config.backLogoSize) setBackLogoSize(config.backLogoSize);
      if (config.backLogoY) setBackLogoY(config.backLogoY);
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
      logoY,
      backLogoSize,
      backLogoY
    }));
  }, [isLoaded, instName, instSlogan, instLogo, instColor, instAddress, instPhone, instEmail, logoSize, logoY, backLogoSize, backLogoY]);
  
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
    if (userType === 'student') return user.grade || user.curso || user.programa || user.programaNombre || '';
    return user.details?.specialty || user.specialty || user.details?.program || user.cargo || '';
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
    id: '000000',
    name: 'Nombre Estudiante',
    grade: '',
    photo: '',
  };

  const currentStudent = selectedStudent || defaultStudent;

  const DesignerBackground = ({ color, opacity, pattern }: { color: string, opacity: number, pattern: string }) => {
    let backgroundStyle: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 0, opacity };
    if (pattern === 'dots') {
        backgroundStyle.backgroundImage = `radial-gradient(${color} 2px, transparent 2px)`;
        backgroundStyle.backgroundSize = '20px 20px';
    } else if (pattern === 'lines') {
        backgroundStyle.backgroundImage = `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%, transparent)`;
        backgroundStyle.backgroundSize = '20px 20px';
    } else if (pattern === 'grid') {
        backgroundStyle.backgroundImage = `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
        backgroundStyle.backgroundSize = '20px 20px';
    }
    return <div style={backgroundStyle} />;
  };

  const WatermarkLogo = ({ url, opacity }: { url: string, opacity: number }) => {
    if (!url) return null;
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, pointerEvents: 'none', opacity }}>
        <img src={url} alt="Watermark" style={{ width: '60%', height: '60%', objectFit: 'contain', filter: 'grayscale(100%)' }} />
      </div>
    );
  };

  const DraggableElement = ({ 
    id, children, style, 
    designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory 
  }: any) => {
    const isSelected = selectedElement === id;
    const currentPos = positions[id] || { x: 0, y: 0 };
    const nodeRef = React.useRef(null);
    
    if (!designMode) return <div style={{ ...style, transform: `translate(${currentPos.x}px, ${currentPos.y}px)` }}>{children}</div>;
    
    return (
      <Draggable 
        nodeRef={nodeRef}
        position={currentPos} 
        onDrag={(e, data) => { setPositions((prev: any) => ({ ...prev, [id]: { x: data.x, y: data.y } })) }} 
        onStop={(e, data) => { addToHistory({ type: 'MOVE', element: id, x: data.x, y: data.y }) }}
        onStart={() => setSelectedElement(id)}
      >
        <div ref={nodeRef} style={{ ...style, cursor: 'move', userSelect: 'none', border: isSelected ? '2px dashed #3b82f6' : 'none' }}>
           {children}
        </div>
      </Draggable>
    );
  };

  const VerticalTemplate = ({ 
    student, designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory,
    cardColor, bgGradient, bgPattern, headerDesign, instName, instLogo, userType, getUserSubtitle,
    watermarkUrl, watermarkOpacity, institutionalConfig 
  }: any) => {
    const designerProps = { designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory };
    const accentColor = cardColor || '#0f172a';

    return (
      <div style={{ 
        width: ID_CARD_WIDTH, height: ID_CARD_HEIGHT,
        background: '#ffffff',
        borderRadius: '20px', overflow: 'hidden', position: 'relative', display: 'block',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
      }}>
        <DesignerBackground color={accentColor} opacity={0.04} pattern={bgPattern} />
        <WatermarkLogo url={watermarkUrl} opacity={watermarkOpacity} />

        {/* Left accent stripe */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '90px', height: '100%', background: accentColor, zIndex: 1 }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 90 600">
            {Array.from({length: 12}, (_, i) => (
              <line key={i} x1="0" y1={i*50} x2="90" y2={i*50-30} stroke="white" strokeWidth="1"/>
            ))}
          </svg>
        </div>

        <DraggableElement id="v_logo" {...designerProps} style={{ position: 'absolute', left: '15px', top: `${30 + (logoY || 0)}px`, width: `${logoSize || 60}px`, height: `${logoSize || 60}px`, zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.5)' }}>
            {instLogo ? <img src={instLogo} style={{ width: '80%', height: '80%', objectFit: 'contain', borderRadius: '8px' }} /> : <Shield color="white" size={28} />}
          </div>
        </DraggableElement>

        <DraggableElement id="v_inst_vertical" {...designerProps} style={{ position: 'absolute', left: '0px', top: '120px', width: '90px', height: '320px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '9px', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
              {instName}
            </span>
          </div>
        </DraggableElement>

        <DraggableElement id="v_type_badge" {...designerProps} style={{ position: 'absolute', left: '10px', bottom: '80px', width: '70px', height: '28px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'white', fontSize: '7px', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {userType === 'student' ? 'ALUMNO' : 'DOCENTE'}
            </span>
          </div>
        </DraggableElement>

        <DraggableElement id="v_header_text" {...designerProps} style={{ position: 'absolute', left: '110px', top: '25px', width: '270px', height: '55px', zIndex: 10 }}>
          <div style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.5px', lineHeight: 1.1 }}>
              {(instName || 'Institución Educativa').toUpperCase()}
            </div>
            <div style={{ fontSize: '9px', fontWeight: '600', color: '#64748b', letterSpacing: '1px', marginTop: '2px' }}>
              {institutionalConfig?.slogan || 'INSTITUCIÓN EDUCATIVA'}
            </div>
          </div>
        </DraggableElement>

        <DraggableElement id="v_photo" {...designerProps} style={{ position: 'absolute', left: '110px', top: '100px', width: '140px', height: '175px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: `3px solid ${accentColor}20`, boxShadow: `0 8px 30px ${accentColor}25` }}>
            {student?.photo ? (
              <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User style={{ width: '50%', height: '50%', color: accentColor }} />
              </div>
            )}
          </div>
        </DraggableElement>

        <DraggableElement id="v_qr" {...designerProps} style={{ position: 'absolute', right: '30px', bottom: '70px', width: '75px', height: '75px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', background: 'white', padding: '5px', borderRadius: '10px', border: `2px solid ${accentColor}20`, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${student?.id || '0020'}&color=0f172a`} style={{ width: '100%', height: '100%', borderRadius: '6px' }} alt="QR" />
          </div>
        </DraggableElement>

        <DraggableElement id="v_data" {...designerProps} style={{ position: 'absolute', left: '110px', top: '290px', width: '270px', height: '200px', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: accentColor, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>Nombre Completo</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>{student?.name || 'JAVIER GÓMEZ'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '8px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{userType === 'student' ? 'Matrícula' : 'Código'}</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{student?.id || '20230001'}</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {userType === 'student' ? (instName.toLowerCase().includes('corporacion') || instName.toLowerCase().includes('corporación') ? 'Curso' : 'Grado') : 'Área'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{getUserSubtitle(student)}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '8px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Vigencia</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>2025 – 2026</div>
            </div>
          </div>
        </DraggableElement>

        <DraggableElement id="v_footer" {...designerProps} style={{ position: 'absolute', left: '90px', bottom: '0', width: 'calc(400px - 90px)', height: '50px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(90deg, ${accentColor}15, ${accentColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderTop: `1px solid ${accentColor}30` }}>
            <span style={{ fontSize: '9px', fontWeight: '700', color: accentColor, letterSpacing: '2px', textTransform: 'uppercase' }}>ID VERIFICADA</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          </div>
        </DraggableElement>
      </div>
    );
  };

  const HorizontalTemplate = ({ 
    student, designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory,
    cardColor, bgGradient, bgPattern, instName, instLogo, userType, getUserSubtitle,
    watermarkUrl, watermarkOpacity, institutionalConfig
  }: any) => {
    const designerProps = { designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory };
    const primaryColor = cardColor || '#0ea5e9';
    const secondaryColor = '#0f172a';

    return (
      <div style={{ 
        width: ID_CARD_HEIGHT, height: ID_CARD_WIDTH,
        background: '#ffffff',
        borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'block',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        fontFamily: '"Inter", sans-serif',
      }}>
        <DesignerBackground color={primaryColor} opacity={0.03} pattern={bgPattern} />
        <WatermarkLogo url={watermarkUrl} opacity={watermarkOpacity} />

        <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, 
            clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', zIndex: 1 }} />
            
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', zIndex: 2, overflow: 'hidden', opacity: 0.1 }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,100 L100,0 M-20,100 L80,0 M20,100 L120,0" stroke="white" strokeWidth="2" fill="none" />
            </svg>
        </div>

        <DraggableElement id="h_logo" {...designerProps} style={{ position: 'absolute', left: '25px', top: `${25 + (logoY || 0)}px`, width: `${logoSize || 50}px`, height: `${logoSize || 50}px`, zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', border: `1.5px solid ${primaryColor}30`, borderRadius: '12px', padding: '6px', overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {instLogo ? <img src={instLogo} style={{ width: '90%', height: '90%', objectFit: 'contain', borderRadius: '6px' }} /> : <Shield color={primaryColor} size={24} />}
          </div>
        </DraggableElement>

        <DraggableElement id="h_inst_name" {...designerProps} style={{ position: 'absolute', left: '85px', top: '30px', width: '150px', height: '40px', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: secondaryColor, letterSpacing: '0.5px', lineHeight: 1.2 }}>{(instName || 'Institución').toUpperCase()}</span>
            <span style={{ fontSize: '7px', fontWeight: '600', color: '#64748b', letterSpacing: '1px' }}>{institutionalConfig?.slogan || 'EDUCACIÓN SUPERIOR'}</span>
          </div>
        </DraggableElement>

        <DraggableElement id="h_data" {...designerProps} style={{ position: 'absolute', left: '25px', top: '100px', width: '190px', height: '120px', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '8px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre completo</div>
              <div style={{ fontSize: '15px', fontWeight: '900', color: secondaryColor, lineHeight: 1.1 }}>{student?.name || 'LAURA MARTÍNEZ'}</div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '7px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{userType === 'student' ? 'Matrícula' : 'Código'}</div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: secondaryColor }}>{student?.id || '24-0981'}</div>
              </div>
              <div>
                <div style={{ fontSize: '7px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{userType === 'student' ? 'Programa' : 'Departamento'}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: primaryColor }}>{getUserSubtitle(student)}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '7px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Válido hasta</div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: secondaryColor }}>Diciembre 2026</div>
            </div>
          </div>
        </DraggableElement>

        <DraggableElement id="h_photo" {...designerProps} style={{ position: 'absolute', right: '30px', top: '35px', width: '140px', height: '140px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: '5px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
             <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: secondaryColor }}>
                {student?.photo ? (
                  <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <User size={40} color="rgba(255,255,255,0.5)" />
                  </div>
                )}
             </div>
          </div>
        </DraggableElement>

        <DraggableElement id="h_qr" {...designerProps} style={{ position: 'absolute', left: '25px', bottom: '25px', width: '75px', height: '75px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', background: 'white', padding: '5px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student?.id || '0020'}&color=0f172a`} style={{ width: '100%', height: '100%', borderRadius: '6px' }} alt="QR" />
          </div>
        </DraggableElement>

        <DraggableElement id="h_role_badge" {...designerProps} style={{ position: 'absolute', right: '35px', bottom: '30px', width: '110px', height: '24px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '8px', fontWeight: '800', letterSpacing: '2px' }}>
               {userType === 'student' ? 'ESTUDIANTE' : 'PROFESOR'}
            </span>
          </div>
        </DraggableElement>

        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '6px', background: `linear-gradient(90deg, ${primaryColor}, #10b981)`, zIndex: 15 }} />
      </div>
    );
  };

  const PremiumTemplate = ({ 
    student, designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory,
    cardColor, bgGradient, bgPattern, instName, instLogo, userType, getUserSubtitle,
    watermarkUrl, watermarkOpacity, institutionalConfig
  }: any) => {
    const designerProps = { designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory };
    const accentColor = cardColor || '#d4af37';
    
    return (
      <div style={{ 
        width: ID_CARD_WIDTH, height: ID_CARD_HEIGHT,
        background: `linear-gradient(135deg, #1c1c1e 0%, #000000 100%)`,
        borderRadius: '24px', overflow: 'hidden', position: 'relative', display: 'block',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5)`,
        fontFamily: '"Outfit", "Inter", sans-serif',
        color: '#ffffff'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.08) 25%, transparent 30%, transparent 45%, rgba(255,255,255,0.03) 50%, transparent 55%)`, pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '60%', height: '50%', background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`, filter: 'blur(60px)', zIndex: 0 }} />

        <DesignerBackground color={accentColor} opacity={0.05} pattern={bgPattern} />
        <WatermarkLogo url={watermarkUrl} opacity={watermarkOpacity} />

        <DraggableElement id="p_header" {...designerProps} style={{ position: 'absolute', left: '30px', top: `${30 + (logoY || 0)}px`, width: '280px', height: '50px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: `${logoSize || 40}px`, height: `${logoSize || 40}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {instLogo ? <img src={instLogo} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} /> : <Shield color={accentColor} size={30} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '3px', color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase' }}>
                {(instName || 'Institución').toUpperCase()}
              </span>
              <span style={{ fontSize: '7px', fontWeight: '500', color: accentColor, letterSpacing: '2px', textTransform: 'uppercase' }}>
                {institutionalConfig?.slogan || 'EXCELLENCE & PRESTIGE'}
              </span>
            </div>
          </div>
        </DraggableElement>

        <DraggableElement id="p_photo" {...designerProps} style={{ position: 'absolute', left: '30px', top: '110px', width: '150px', height: '190px', zIndex: 10 }}>
           <div style={{ width: '100%', height: '100%', borderRadius: '12px', padding: '3px', background: `linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.02) 100%)`, boxShadow: '0 15px 35px rgba(0,0,0,0.4)', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden', background: '#111' }}>
                 {student?.photo ? (
                    <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={50} color="rgba(255,255,255,0.1)" /></div>
                 )}
              </div>
           </div>
        </DraggableElement>

        <DraggableElement id="p_data" {...designerProps} style={{ position: 'absolute', left: '30px', top: '325px', width: '280px', height: '120px', zIndex: 10 }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                 <span style={{ display: 'block', fontSize: '8px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Titular / Cardholder</span>
                 <span style={{ display: 'block', fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'white' }}>{student?.name || 'ALEXANDRA PÉREZ'}</span>
              </div>
              <div style={{ display: 'flex', gap: '30px' }}>
                  <div>
                      <span style={{ display: 'block', fontSize: '7px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>ID. No.</span>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: accentColor, fontFamily: 'monospace' }}>{student?.id || '24-A09'}</span>
                  </div>
              </div>
           </div>
        </DraggableElement>

        <DraggableElement id="p_qr" {...designerProps} style={{ position: 'absolute', right: '30px', bottom: '60px', width: '85px', height: '85px', zIndex: 10 }}>
           <div style={{ width: '100%', height: '100%', padding: '6px', background: 'rgba(255,255,255,0.95)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student?.id || '0020'}&color=000000`} style={{ width: '100%', height: '100%', borderRadius: '6px' }} alt="QR" />
           </div>
        </DraggableElement>

        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '35px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', zIndex: 10 }}>
           <span style={{ fontSize: '7px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>VALID UNTIL: DEC 2026</span>
           <span style={{ fontSize: '7px', fontWeight: '700', color: accentColor, letterSpacing: '2px' }}>VERIFIED</span>
        </div>
      </div>
    );
  };

  const BackCard = () => {
    return (
      <div style={{ width: activeTemplate === 'horizontal' ? ID_CARD_HEIGHT : ID_CARD_WIDTH, height: activeTemplate === 'horizontal' ? ID_CARD_WIDTH : ID_CARD_HEIGHT, background: 'white', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
        <div style={{ height: '80px', background: cardColor, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ transform: `translateY(${backLogoY}px)`, width: `${backLogoSize}px`, height: `${backLogoSize}px`, flexShrink: 0, background: 'white', borderRadius: '50%', padding: '6px', overflow: 'hidden', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {instLogo ? <img src={instLogo} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} /> : <Shield color={cardColor} size={28} />}
           </div>
          <div style={{ flex: 1, paddingLeft: '15px', zIndex: 2 }}>
             <h2 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: '950', letterSpacing: '1px' }}>{instName.toUpperCase()}</h2>
          </div>
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
        </div>
        <div style={{ height: '40px', background: cardColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}>
          <span style={{ color: 'white', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>{institutionalConfig.slogan}</span>
       </div>
    </div>
    );
  };

  const renderActiveTemplate = (u: any) => {
    const templateProps = {
      student: u, designMode, positions, setPositions, selectedElement, setSelectedElement, addToHistory,
      cardColor, bgGradient, bgPattern, headerDesign, instName, instLogo, userType, getUserSubtitle,
      watermarkUrl, watermarkOpacity, institutionalConfig
    };
    switch (activeTemplate) {
      case 'vertical': return <VerticalTemplate {...templateProps} />;
      case 'horizontal': return <HorizontalTemplate {...templateProps} />;
      case 'premium': return <PremiumTemplate {...templateProps} />;
      default: return <VerticalTemplate {...templateProps} />;
    }
  };

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_carn_admin">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '950', color: '#1e293b', letterSpacing: '-1.5px', margin: 0 }}>Generación de Carnetización</h1>
              <p style={{ color: '#64748b', marginTop: '4px' }}>Seleccione una plantilla y personalice los datos correspondientes.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-premium" style={{ background: '#475569', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => window.print()}>
                 <Printer size={18} /> Imprimir Carnets
              </button>
              <button className="btn-premium" style={{ background: instColor, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleExportBulk}>
                 <Download size={18} /> Exportar Lote
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '30px', position: 'relative', alignItems: 'flex-start' }}>
            <div style={{ width: '330px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#1e293b' }}>
                    <Shield size={18} color={cardColor} />
                    <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Config. Institucional</h3>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" value={instName} onChange={(e) => setInstName(e.target.value)} placeholder="Nombre Institución" style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px', fontSize: '13px' }} />
                    <input type="text" value={instSlogan} onChange={(e) => setInstSlogan(e.target.value)} placeholder="Slogan" style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0 12px', fontSize: '13px' }} />
                 </div>
              </div>

              <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                 <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
                    <button onClick={() => setUserType('student')} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', background: userType === 'student' ? 'white' : 'transparent', color: userType === 'student' ? '#1e293b' : '#64748b', fontSize: '12px', fontWeight: '800', boxShadow: userType === 'student' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>ESTUDIANTES</button>
                    <button onClick={() => setUserType('teacher')} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', background: userType === 'teacher' ? 'white' : 'transparent', color: userType === 'teacher' ? '#1e293b' : '#64748b', fontSize: '12px', fontWeight: '800', boxShadow: userType === 'teacher' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>DOCENTES</button>
                 </div>
                 
                 <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                    <input type="text" placeholder="Buscar por nombre o ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '0 12px 0 38px', fontSize: '13px' }} />
                 </div>

                 {searchTerm && (
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                       {filteredUsers.length > 0 ? filteredUsers.slice(0, 5).map(u => (
                          <div key={u.id} onClick={() => handleSelectStudent(u)} style={{ padding: '10px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={12} /></div>
                             <div>
                                <p style={{ margin: 0, fontWeight: '800', fontSize: '12px' }}>{u.name}</p>
                                <p style={{ margin: 0, fontSize: '9px', color: '#64748b' }}>{u.id} • {getUserSubtitle(u)}</p>
                             </div>
                          </div>
                       )) : <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px' }}>No hay resultados</div>}
                    </div>
                 )}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ position: 'relative', width: activeTemplate === 'horizontal' ? ID_CARD_HEIGHT : ID_CARD_WIDTH }}>
                  <motion.div onClick={() => setIsFlipped(!isFlipped)} style={{ cursor: 'pointer', perspective: '1000px' }}>
                    <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d', position: 'relative' }}>
                      <div style={{ backfaceVisibility: 'hidden' }}>{renderActiveTemplate(currentStudent)}</div>
                      <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', top: 0, left: 0 }}>
                         <BackCard />
                      </div>
                    </motion.div>
                  </motion.div>
               </div>
            </div>

            <div style={{ width: '330px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                     <Palette size={18} color={cardColor} />
                     <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Personalización</h3>
                  </div>
                  <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                    {['vertical', 'horizontal', 'premium'].map(t => (
                      <button key={t} onClick={() => setActiveTemplate(t)} style={{ padding: '10px', borderRadius: '10px', border: activeTemplate === t ? '2px solid black' : '1px solid #e2e8f0', background: 'white', fontSize: '11px', fontWeight: '800' }}>{t.toUpperCase()}</button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div id="id-cards-print-zone" style={{ display: 'none' }}>
          {(genMode === 'individual' ? [currentStudent] : generatedStudents).map((s, idx) => (
            <div key={idx} style={{ pageBreakAfter: 'always', padding: '1cm', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1cm', background: 'white' }}>
              {renderActiveTemplate(s)}
              <BackCard />
            </div>
          ))}
        </div>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            #id-cards-print-zone, #id-cards-print-zone * { visibility: visible !important; }
            #id-cards-print-zone { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>
      </PermissionGate>
    </DashboardLayout>
  );
};

export default IDCardGenerator;
