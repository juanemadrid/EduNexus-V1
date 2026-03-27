'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Draggable from 'react-draggable';
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
    
    // The interaction is handled only when designMode is active
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
          <div style={{ position: 'absolute', bottom: 0, right: -30, width: 0, height: 0, 
            borderLeft: '30px solid transparent', borderBottom: `120px solid ${accentColor}` }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 90 600">
            {Array.from({length: 12}, (_, i) => (
              <line key={i} x1="0" y1={i*50} x2="90" y2={i*50-30} stroke="white" strokeWidth="1"/>
            ))}
          </svg>
        </div>

        <DraggableElement id="v_logo" {...designerProps} style={{ position: 'absolute', left: '15px', top: '30px', width: '60px', height: '60px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.5)' }}>
            {instLogo ? <img src={instLogo} style={{ width: '80%', height: '80%', objectFit: 'contain', filter: 'brightness(10)' }} /> : <Shield color="white" size={28} />}
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
                <div style={{ fontSize: '8px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{userType === 'student' ? 'Grado' : 'Área'}</div>
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
    const secondaryColor = '#0f172a'; // Dark slate for contrast

    return (
      <div style={{ 
        width: ID_CARD_HEIGHT, height: ID_CARD_WIDTH, // Swapped for horizontal
        background: '#ffffff',
        borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'block',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        fontFamily: '"Inter", sans-serif',
      }}>
        <DesignerBackground color={primaryColor} opacity={0.03} pattern={bgPattern} />
        <WatermarkLogo url={watermarkUrl} opacity={watermarkOpacity} />

        {/* Diagonal Split Background */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, 
            clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', zIndex: 1 }} />
            
        {/* Decorative lines on the dark side */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', zIndex: 2, overflow: 'hidden', opacity: 0.1 }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,100 L100,0 M-20,100 L80,0 M20,100 L120,0" stroke="white" strokeWidth="2" fill="none" />
            </svg>
        </div>

        {/* Light section (Left) */}
        <DraggableElement id="h_logo" {...designerProps} style={{ position: 'absolute', left: '25px', top: '25px', width: '50px', height: '50px', zIndex: 10 }}>
          <div style={{ width: '100%', height: '100%', border: `1.5px solid ${primaryColor}30`, borderRadius: '12px', padding: '6px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {instLogo ? <img src={instLogo} style={{ width: '90%', height: '90%', objectFit: 'contain' }} /> : <Shield color={primaryColor} size={24} />}
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

        {/* Dark section (Right) */}
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

        {/* Footer Accent */}
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
        {/* Subtle metallic sheen */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.08) 25%, transparent 30%, transparent 45%, rgba(255,255,255,0.03) 50%, transparent 55%)`, pointerEvents: 'none', zIndex: 1 }} />
        
        {/* Glowing orb accent based on chosen color */}
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '60%', height: '50%', background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`, filter: 'blur(60px)', zIndex: 0 }} />

        <DesignerBackground color={accentColor} opacity={0.05} pattern={bgPattern} />
        <WatermarkLogo url={watermarkUrl} opacity={watermarkOpacity} />

        {/* Header */}
        <DraggableElement id="p_header" {...designerProps} style={{ position: 'absolute', left: '30px', top: '30px', width: '280px', height: '50px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Photo Container */}
        <DraggableElement id="p_photo" {...designerProps} style={{ position: 'absolute', left: '30px', top: '110px', width: '150px', height: '190px', zIndex: 10 }}>
           <div style={{ width: '100%', height: '100%', borderRadius: '12px', padding: '3px', background: `linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.02) 100%)`, boxShadow: '0 15px 35px rgba(0,0,0,0.4)', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden', background: '#111' }}>
                 {student?.photo ? (
                    <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={50} color="rgba(255,255,255,0.1)" /></div>
                 )}
              </div>
              {/* Corner Accents on photo */}
              <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '15px', height: '15px', borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}`, borderTopLeftRadius: '13px' }} />
              <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '15px', height: '15px', borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, borderBottomRightRadius: '13px' }} />
           </div>
        </DraggableElement>

        {/* Student Info */}
        <DraggableElement id="p_data" {...designerProps} style={{ position: 'absolute', left: '30px', top: '325px', width: '280px', height: '120px', zIndex: 10 }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                 <span style={{ display: 'block', fontSize: '8px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Titular / Cardholder</span>
                 <span style={{ display: 'block', fontSize: '18px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{student?.name || 'ALEXANDRA PÉREZ'}</span>
              </div>
              <div style={{ display: 'flex', gap: '30px' }}>
                  <div>
                      <span style={{ display: 'block', fontSize: '7px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>ID. No.</span>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: accentColor, fontFamily: 'monospace', letterSpacing: '1px' }}>{student?.id || '24-A09'}</span>
                  </div>
                  <div>
                      <span style={{ display: 'block', fontSize: '7px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{userType === 'student' ? 'Carrera' : 'Área'}</span>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'white', letterSpacing: '0.5px' }}>{getUserSubtitle(student)}</span>
                  </div>
              </div>
           </div>
        </DraggableElement>

        {/* Clean QR Box Bottom Right */}
        <DraggableElement id="p_qr" {...designerProps} style={{ position: 'absolute', right: '30px', bottom: '60px', width: '85px', height: '85px', zIndex: 10 }}>
           <div style={{ width: '100%', height: '100%', padding: '6px', background: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: `0 15px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student?.id || '0020'}&color=000000`} style={{ width: '100%', height: '100%', borderRadius: '6px' }} alt="QR" />
           </div>
        </DraggableElement>

        {/* Role Badge Bottom Left */}
        <DraggableElement id="p_role" {...designerProps} style={{ position: 'absolute', left: '30px', bottom: '70px', width: '140px', height: '26px', zIndex: 10 }}>
           <div style={{ width: '100%', height: '100%', borderRadius: '4px', borderLeft: `3px solid ${accentColor}`, paddingLeft: '10px', display: 'flex', alignItems: 'center' }}>
               <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '3px', color: 'rgba(255,255,255,0.8)' }}>
                   {userType === 'student' ? 'STUDENT' : 'FACULTY'}
               </span>
           </div>
        </DraggableElement>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '35px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', zIndex: 10 }}>
           <span style={{ fontSize: '7px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>VALID UNTIL: DEC 2026</span>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
              <span style={{ fontSize: '7px', fontWeight: '700', color: accentColor, letterSpacing: '2px' }}>VERIFIED</span>
           </div>
        </div>
      </div>
    );
  };

  const BackCard = () => {
    if (activeTemplate === 'premium') {
      const accentColor = cardColor || '#d4af37';
      return (
        <div style={{ width: ID_CARD_WIDTH, height: ID_CARD_HEIGHT, background: `linear-gradient(135deg, #0f0f11 0%, #1a1a1c 100%)`, borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 15px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", "Inter", sans-serif', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Subtle sheen */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, transparent 50%)`, pointerEvents: 'none', zIndex: 1 }} />
          
          <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ flex: 1 }}>
               <h2 style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase' }}>CONTACT INFORMATION</h2>
               <h3 style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'white', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>{instName}</h3>
            </div>
          </div>
          
          <div style={{ padding: '30px', flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={14} color={accentColor} /></div>
                   <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px' }}>{instAddress}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={14} color={accentColor} /></div>
                   <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', letterSpacing: '1px' }}>{instPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={14} color={accentColor} /></div>
                   <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px' }}>{instEmail}</span>
                </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px' }}>
               <h3 style={{ margin: '0 0 15px 0', fontSize: '9px', fontWeight: '700', letterSpacing: '3px', color: accentColor, textTransform: 'uppercase' }}>TERMS OF USE (NON-TRANSFERABLE)</h3>
               <p style={{ margin: 0, fontSize: '8px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, textAlign: 'justify', letterSpacing: '0.5px' }}>
                 This premium identification card is the exclusive property of {instName}. It is strictly personal and non-transferable. 
                 The cardholder is subject to all institutional regulations and security protocols. If found, please return immediately to the main administrative office.
               </p>
            </div>
          </div>
          
          <div style={{ height: '35px', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span style={{ fontSize: '8px', fontWeight: '800', color: '#000', letterSpacing: '4px' }}>AUTHORIZED PERSONNEL ONLY</span>
          </div>
        </div>
      );
    }
    
    return (
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
