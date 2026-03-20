'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  User, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Bell, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Plus,
  X,
  CreditCard,
  Target,
  Building,
  ShieldCheck,
  FileDown,
  Upload,
  Database,
  FileText,
  MonitorPlay,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToCSV, importFromCSV } from '@/lib/dataUtils';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: { name: string; href: string }[];
}

const navigation: Record<string, NavItem[]> = {
  'Institucional': [
    { name: 'Estudiantes', icon: <Users size={18} />, subItems: [
      { name: 'Registrar Estudiante', href: '/dashboard/institutional/students/register' },
      { name: 'Información básica', href: '/dashboard/institutional/students/basic-info' },
      { name: 'Preinscripciones', href: '/dashboard/institutional/students/pre-enrollment' },
      { name: 'Inscritos no matriculados', href: '/dashboard/institutional/students/not-enrolled' },
      { name: 'Cancelación masiva', href: '/dashboard/institutional/students/mass-cancellation' },
      { name: 'Establecer egresados', href: '/dashboard/institutional/students/graduates' }
    ]},
    { name: 'Docentes', icon: <User size={18} />, subItems: [
      { name: 'Registrar Docente', href: '/dashboard/institutional/teachers/register' },
      { name: 'Información básica', href: '/dashboard/institutional/teachers/basic-info' }
    ]},
    { name: 'Administrativos', icon: <ShieldCheck size={18} />, subItems: [
      { name: 'Registrar Administrativo', href: '/dashboard/institutional/admins/register' },
      { name: 'Información básica', href: '/dashboard/institutional/admins/basic-info' }
    ]},
    { name: 'Familiares', icon: <Users size={18} />, subItems: [
      { name: 'Registrar familiar', href: '/dashboard/institutional/family/register' },
      { name: 'Información básica', href: '/dashboard/institutional/family/basic-info' }
    ]},
    { name: 'Participantes', icon: <Users size={18} />, subItems: [
      { name: 'Información básica', href: '/dashboard/institutional/participants/basic-info' }
    ]},
    { name: 'Comercial CRM', icon: <Target size={18} />, subItems: [
      { name: 'Oportunidades', href: '/dashboard/institutional/commercial/opportunities' },
      { name: 'Medios publicitarios', href: '/dashboard/institutional/commercial/advertising-media' },
      { name: 'Medios de contactos', href: '/dashboard/institutional/commercial/contact-media' },
      { name: 'Estados de negocio', href: '/dashboard/institutional/commercial/business-status' },
      { name: 'Campos personalizados', href: '/dashboard/institutional/commercial/custom-fields' },
      { name: 'Causas', href: '#' },
      { name: 'Importar oportunidades', href: '#' },
      { name: 'Cambio masivo de asesor', href: '#' }
    ]},
    { name: 'Establecimiento', icon: <Building size={18} />, subItems: [
      { name: 'Información general', href: '#' }
    ]},
    { name: 'Admisiones', icon: <BookOpen size={18} />, subItems: [
      { name: 'Panel de admisiones', href: '#' }
    ]},
    { name: 'Pedidos Q10 ID (Carnetización)', icon: <CreditCard size={18} />, subItems: [
      { name: 'Solicitudes', href: '#' }
    ]},
    { name: 'Estructuración', icon: <Database size={18} />, subItems: [
      { name: 'Configuración', href: '#' }
    ]}
  ],
  'Académico': [
    { name: 'Evaluaciones', icon: <FileText size={18} />, href: '/dashboard/academic/evaluations' },
    { name: 'Educación virtual', icon: <MonitorPlay size={18} />, subItems: [
      { name: 'Aulas virtuales', href: '/dashboard/academic/virtual-classrooms' }
    ]},
    { name: 'Estructuración', icon: <Database size={18} />, subItems: [
      { name: 'Asignaturas', href: '/dashboard/academic/structuring/subjects' },
      { name: 'Programas', href: '/dashboard/academic/structuring/programs' },
      { name: 'Sedes - jornadas - programas', href: '#' },
      { name: 'Cursos', href: '#' },
      { name: 'Cerrar - cursos', href: '#' },
      { name: 'Preguntas personalizadas programas', href: '#' },
      { name: 'Grupos', href: '#' },
      { name: 'Agrupaciones', href: '#' },
      { name: 'Parámetros de evaluación asignaturas', href: '#' },
      { name: 'Parámetros evaluaciones', href: '#' },
      { name: 'Tipos de cancelaciones', href: '#' },
      { name: 'Causas de cancelación', href: '#' },
      { name: 'Restricciones de evaluación', href: '#' },
      { name: 'Requisitos de matrícula', href: '#' },
      { name: 'Requisitos de grado', href: '#' },
      { name: 'Parametrización de constancias y certificados', href: '#' },
      { name: 'Categorías examen admisión', href: '/dashboard/academic/structuring/admission-categories' }
    ]}
  ],
  'Tesorería': [
    { name: 'Otros ingresos', icon: <DollarSign size={18} />, href: '/dashboard/treasury/other-incomes' },
    { name: 'Egresos', icon: <TrendingDown size={18} />, href: '/dashboard/treasury/expenses' },
    { name: 'Codeudores', icon: <Users size={18} />, subItems: [
      { name: 'Registrar codeudor', href: '/dashboard/treasury/codebtors/register' },
      { name: 'Información básica', href: '/dashboard/treasury/codebtors/basic-info' }
    ]},
    { name: 'Administrar notas crédito', icon: <FileText size={18} />, href: '#' },
    { name: 'Estructuración', icon: <Database size={18} />, subItems: [
      { name: 'Configuración', href: '#' }
    ]}
  ]
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Nueva Preinscripción', detail: 'Juan Perez se ha preinscrito en Bachillerato.', time: 'Hace 5 min', type: '#3b82f6' },
  { id: 2, title: 'Pago Recibido', detail: 'Se ha confirmado el pago de pensión de Marzo.', time: 'Hace 1 hora', type: '#10b981' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [institutionalConfig, setInstitutionalConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_institutional_appearance');
      return saved ? JSON.parse(saved) : { logo: '', primaryColor: '#10b981', subdomain: '' };
    }
    return { logo: '', primaryColor: '#10b981', subdomain: '' };
  });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', institutionalConfig.primaryColor);
    const hex = institutionalConfig.primaryColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    root.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.15)`);
  }, [institutionalConfig.primaryColor]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const query = val.toLowerCase();
    const studentsSaved = localStorage.getItem('edunexus_registered_students');
    const localStudents = studentsSaved ? JSON.parse(studentsSaved) : [];
    const students = localStudents
      .filter((s: any) => s.name.toLowerCase().includes(query) || s.id.includes(query))
      .map((s: any) => ({ 
        id: s.id, 
        name: s.name, 
        type: 'Estudiante', 
        icon: <Users size={14} />,
        href: `/dashboard/institutional/students/basic-info`
      }));

    const processes: any[] = [];
    Object.entries(navigation).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.href && item.name.toLowerCase().includes(query)) {
          processes.push({ name: item.name, type: `Proceso • ${category}`, icon: <BookOpen size={14} />, href: item.href });
        }
        item.subItems?.forEach(sub => {
          if (sub.href.toLowerCase().includes(query) || sub.name.toLowerCase().includes(query)) {
            processes.push({ name: sub.name, type: `Proceso • ${category} / ${item.name}`, icon: <BookOpen size={14} />, href: sub.href });
          }
        });
      });
    });

    setSearchResults([...students, ...processes]);
  };

  const handleMouseEnter = (category: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveMenu(category);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveSubMenu(null);
    }, 300);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <div className="aurora-container" style={{ position: 'fixed', zIndex: -1 }}></div>

      {toast && (
        <div className="toast-animate" style={{
          position: 'fixed', top: '90px', right: '24px', zIndex: 9999,
          background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          padding: '12px 20px', borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
          fontSize: '13px', fontWeight: '700'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Hidden Import Input */}
      <input 
        type="file" 
        ref={importFileRef} 
        style={{ display: 'none' }} 
        accept=".csv" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // For now, we simulate the upload and redirect to the validation step
            // In a real env, we'd store the file chunk or parse it into a temp state
            showToast('Archivo cargado. Validando integridad...', 'success');
            setTimeout(() => {
              router.push('/dashboard/institutional/import-validation?type=students');
            }, 1000);
          }
        }}
      />

      <header style={{ 
        height: '75px', 
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(40px)', 
        borderBottom: '1px solid var(--glass-border)',
        borderTop: '5px solid var(--primary)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'border-color 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flex: 1 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
             <motion.div
               animate={{ scale: [1, 1.1, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
               whileHover={{ scale: 1.3, rotate: [0, -2, 2, 0] }}
               transition={{ scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }, filter: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
               style={{ display: 'flex', alignItems: 'center' }}
             >
               {institutionalConfig.logo ? (
                 <img src={institutionalConfig.logo} alt="Logo" style={{ height: '52px', maxWidth: '220px', objectFit: 'contain' }} />
               ) : (
                 <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1.5px', margin: 0 }}>EduNexus</h1>
               )}
             </motion.div>
          </Link>
          
          <div style={{ position: 'relative', width: '340px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              placeholder="Buscar personas o procesos..." 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-premium"
              style={{ paddingLeft: '48px', background: 'rgba(255,255,255,0.4)', borderRadius: '14px' }}
            />
            {searchResults.length > 0 && (
              <div style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', borderRadius: '12px', 
                marginTop: '8px', padding: '8px', zIndex: 1100, border: '1px solid #e2e8f0'
              }}>
                {searchResults.slice(0, 5).map((res, idx) => (
                  <div key={idx} onClick={() => { if (res.href) router.push(res.href); setSearchResults([]); setSearchTerm(''); }}
                    style={{ padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: res.type.includes('Proceso') ? '#f0f9ff' : 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: res.type.includes('Proceso') ? '#0ea5e9' : 'var(--primary)' }}>
                      {res.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{res.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{res.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px', flex: 2, justifyContent: 'center' }}>
          {Object.entries(navigation).map(([category, items]) => (
            <div key={category} style={{ position: 'relative', paddingBottom: '15px', marginBottom: '-15px' }} onMouseEnter={() => handleMouseEnter(category)} onMouseLeave={handleMouseLeave}>
              <button style={{ 
                background: activeMenu === category ? 'var(--primary-glow)' : 'none', 
                border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '14.5px', fontWeight: '700', 
                color: activeMenu === category ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                {category} <ChevronDown size={14} style={{ opacity: 0.5 }} />
              </button>
              {activeMenu === category && (
                <div style={{ position: 'absolute', top: '100%', left: '0', minWidth: '240px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', borderRadius: '18px', border: '1px solid var(--glass-border)', padding: '12px', marginTop: '5px', zIndex: 1000 }}>
                  {items.map((item) => (
                    <div key={item.name} style={{ position: 'relative' }} onMouseEnter={() => setActiveSubMenu(item.name)}>
                      <Link href={item.href || '#'} style={{ 
                        padding: '12px 14px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: (activeSubMenu === item.name || pathname === item.href) ? 'var(--primary-glow)' : 'transparent',
                        color: (activeSubMenu === item.name || pathname === item.href) ? 'var(--primary)' : 'var(--text-dim)',
                      }}>
                        {item.name} {item.subItems && <ChevronRight size={14} />}
                      </Link>
                      {item.subItems && activeSubMenu === item.name && (
                        <div style={{ position: 'absolute', top: '-12px', left: '100%', minWidth: '220px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', borderRadius: '18px', border: '1px solid var(--glass-border)', padding: '12px' }}>
                          {item.subItems.map((sub) => (
                            <Link key={sub.name} href={sub.href} style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: pathname === sub.href ? 'var(--primary)' : 'var(--text-dim)', textDecoration: 'none', display: 'block', background: pathname === sub.href ? 'var(--primary-glow)' : 'transparent' }}>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
             <Bell size={22} style={{ color: showNotifications ? 'var(--primary)' : 'var(--text-dim)' }} />
             {showNotifications && (
               <div style={{ position: 'absolute', top: '100%', right: 0, width: '320px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', borderRadius: '20px', border: '1px solid var(--glass-border)', marginTop: '15px', padding: '16px', zIndex: 2000 }}>
                 <h4 style={{ margin: '0 0 16px', fontWeight: '800', fontSize: '15px' }}>Notificaciones</h4>
                 {MOCK_NOTIFICATIONS.map(n => (
                   <div key={n.id} style={{ padding: '12px', borderRadius: '14px', background: '#f8fafc', marginBottom: '8px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: n.type }}>{n.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>{n.detail}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 14px', background: 'white', borderRadius: '50px', border: '1px solid var(--glass-border)', cursor: 'pointer', position: 'relative' }} onClick={() => setShowUserMenu(!showUserMenu)}>
             <div style={{ textAlign: 'right' }}>
               <p style={{ fontSize: '13px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                 Jader Antonio <ChevronDown size={14} style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none' }} />
               </p>
               <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', margin: 0 }}>RECTORÍA MASTER</p>
             </div>
             <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderRadius: '12px' }}></div>
             {showUserMenu && (
               <div style={{ position: 'absolute', top: '100%', right: 0, width: '220px', background: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', borderRadius: '18px', border: '1px solid var(--glass-border)', marginTop: '12px', padding: '8px', zIndex: 2000 }}>
                 <div style={{ borderBottom: '1px solid #f1f5f9', padding: '4px 0' }}>
                    <div onClick={() => { setShowUserMenu(false); }} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)' }}>Mi perfil</div>
                    <div onClick={() => { setShowUserMenu(false); }} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)' }}>Mis tickets</div>
                 </div>

                 {/* New Gestión de Datos Dropdown/Section in User Menu */}
                 <div style={{ borderBottom: '1px solid #f1f5f9', padding: '8px 0' }}>
                    <p style={{ margin: '0 12px 6px', fontSize: '10px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>GESTIÓN DE DATOS</p>
                    <div onClick={() => { importFileRef.current?.click(); setShowUserMenu(false); }} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={14} /> Importar Datos
                    </div>
                    <div onClick={() => { exportToCSV((msg) => showToast(msg), (msg) => showToast(msg, 'error')); setShowUserMenu(false); }} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileDown size={14} /> Exportar Datos
                    </div>
                 </div>

                 <div style={{ borderBottom: '1px solid #f1f5f9', padding: '4px 0' }}>
                    <div onClick={() => { setShowAppearanceModal(true); setShowUserMenu(false); }} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', cursor: 'pointer' }}>Configuración</div>
                    <div onClick={() => { setShowChangePasswordModal(true); setShowUserMenu(false); }} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)', cursor: 'pointer' }}>Cambiar contraseña</div>
                 </div>
                 <div style={{ padding: '4px 0' }}>
                    <div onClick={() => { router.push('/'); setShowUserMenu(false); }} style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#ef4444', cursor: 'pointer' }}>Cerrar sesión</div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </header>

      <main style={{ padding: '40px 60px' }}>{children}</main>

      {showAppearanceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '480px', background: 'white', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', color: 'white' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Apariencia institucional</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowAppearanceModal(false)} />
            </div>
            <div style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '100px', height: '100px', border: '2px dashed #e2e8f0', borderRadius: '20px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {institutionalConfig.logo ? <img src={institutionalConfig.logo} style={{ maxWidth: '100%' }} /> : <span style={{ color: 'var(--primary)', fontWeight: '900' }}>EduNexus</span>}
                </div>
                <input type="file" ref={logoInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onload = (ev) => setInstitutionalConfig((p: any) => ({ ...p, logo: ev.target?.result as string }));
                    r.readAsDataURL(file);
                  }
                }} />
                <button onClick={() => logoInputRef.current?.click()} style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Cargar logo</button>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>COLOR PRIMARIO</label>
                <input type="color" value={institutionalConfig.primaryColor} onChange={(e) => setInstitutionalConfig((p: any) => ({ ...p, primaryColor: e.target.value }))} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>SUBDOMINIO</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" value={institutionalConfig.subdomain} onChange={(e) => setInstitutionalConfig((p: any) => ({ ...p, subdomain: e.target.value }))} style={{ flex: 1, height: '40px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '0 12px' }} />
                  <span style={{ fontWeight: '700', color: '#94a3b8' }}>.edunexus.co</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowAppearanceModal(false)} style={{ flex: 1, height: '45px', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => { localStorage.setItem('edunexus_institutional_appearance', JSON.stringify(institutionalConfig)); setShowAppearanceModal(false); showToast('✅ Cambios guardados'); }} style={{ flex: 1, height: '45px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '400px', background: 'white', padding: '32px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px' }}>Cambiar contraseña</h2>
            <input type="password" placeholder="Contraseña actual" style={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 16px', marginBottom: '12px' }} />
            <input type="password" placeholder="Nueva contraseña" style={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 16px', marginBottom: '12px' }} />
            <input type="password" placeholder="Confirmar nueva contraseña" style={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 16px', marginBottom: '24px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowChangePasswordModal(false)} style={{ flex: 1, height: '45px', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: '700' }}>Cancelar</button>
              <button onClick={() => { setShowChangePasswordModal(false); showToast('✅ Contraseña cambiada'); }} style={{ flex: 1, height: '45px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '700' }}>Actualizar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { width: 100%; height: 48px; border-radius: 14px; border: 1px solid #e2e8f0; padding: 0 16px; outline: none; transition: 0.2s; font-size: 14px; font-weight: 600; }
        .input-premium:focus { border-color: var(--primary); background: white; }
        .toast-animate { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
