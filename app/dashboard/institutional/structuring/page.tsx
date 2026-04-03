'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/db';
import Link from 'next/link';
import { 
  Database,
  MapPin,
  Monitor,
  Layers,
  Calendar,
  Users,
  Building2,
  FileText,
  HelpCircle,
  FolderTree,
  ShieldCheck,
  FileBarChart,
  Settings,
  ArrowRight,
  Plus
} from 'lucide-react';

interface ModuleStats {
  name: string;
  count: number;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function StructuringDashboard() {
  const [stats, setStats] = useState<ModuleStats[]>([
    { name: 'Sedes', count: 0, label: 'Sedes y Jornadas', icon: <MapPin />, href: '/dashboard/institutional/structuring/branches', color: '#3b82f6' },
    { name: 'Aulas', count: 0, label: 'Aulas y Espacios', icon: <Monitor />, href: '/dashboard/institutional/structuring/classrooms', color: '#10b981' },
    { name: 'Niveles', count: 0, label: 'Niveles Académicos', icon: <Layers />, href: '/dashboard/institutional/structuring/levels', color: '#8b5cf6' },
    { name: 'Periodos', count: 0, label: 'Ciclos Escolares', icon: <Calendar />, href: '/dashboard/institutional/structuring/periods', color: '#f59e0b' },
    { name: 'Perfiles', count: 0, label: 'Roles de Usuario', icon: <Users />, href: '/dashboard/institutional/structuring/profiles', color: '#ec4899' },
    { name: 'Empresas', count: 0, label: 'Aliados Corp.', icon: <Building2 />, href: '/dashboard/institutional/structuring/companies', color: '#6366f1' },
    { name: 'Documentos', count: 0, label: 'Requisitos Digitales', icon: <FileText />, href: '/dashboard/structuring/digital-documents', color: '#0ea5e9' },
    { name: 'Preguntas', count: 0, label: 'Campos Pers.', icon: <HelpCircle />, href: '/dashboard/institutional/structuring/custom-questions', color: '#f43f5e' },
  ]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsInitialLoading(true);
      try {
        const [
          branches, 
          classrooms, 
          levels, 
          periods, 
          profiles, 
          companies, 
          docs, 
          questions
        ] = await Promise.all([
          db.list('branch_shifts'),
          db.list('classrooms'),
          db.list('levels'),
          db.list('periods'),
          db.list('profiles'),
          db.list('companies'),
          db.list('doc_requirements'),
          db.list('custom_questions')
        ]);

        setStats([
          { name: 'Sedes', count: branches.length, label: 'Sedes y Jornadas', icon: <MapPin />, href: '/dashboard/institutional/structuring/branches', color: '#3b82f6' },
          { name: 'Aulas', count: classrooms.length, label: 'Aulas y Espacios', icon: <Monitor />, href: '/dashboard/institutional/structuring/classrooms', color: '#10b981' },
          { name: 'Niveles', count: levels.length, label: 'Niveles Académicos', icon: <Layers />, href: '/dashboard/institutional/structuring/levels', color: '#8b5cf6' },
          { name: 'Periodos', count: periods.length, label: 'Ciclos Escolares', icon: <Calendar />, href: '/dashboard/institutional/structuring/periods', color: '#f59e0b' },
          { name: 'Perfiles', count: profiles.length, label: 'Roles de Usuario', icon: <Users />, href: '/dashboard/institutional/structuring/profiles', color: '#ec4899' },
          { name: 'Empresas', count: companies.length, label: 'Aliados Corp.', icon: <Building2 />, href: '/dashboard/institutional/structuring/companies', color: '#6366f1' },
          { name: 'Documentos', count: docs.length, label: 'Requisitos Digitales', icon: <FileText />, href: '/dashboard/structuring/digital-documents', color: '#0ea5e9' },
          { name: 'Preguntas', count: questions.length, label: 'Campos Pers.', icon: <HelpCircle />, href: '/dashboard/institutional/structuring/custom-questions', color: '#f43f5e' },
        ]);
      } catch (error) {
        console.error("Error loading structuring stats:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-premium" style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-2px', margin: 0, background: 'linear-gradient(to right, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Estructuración Institucional</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '18px', fontWeight: '500', marginTop: '8px', maxWidth: '800px' }}>
          Configuración maestra del ecosistema EduNexus. Administre el esqueleto organizativo, académico y digital desde un solo lugar.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} style={{ textDecoration: 'none' }}>
            <div className="glass-panel module-card" style={{ padding: '32px', height: '100%', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {/* Accents */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stat.color }} />
              <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: stat.color, opacity: 0.03, filter: 'blur(30px)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {React.cloneElement(stat.icon as any, { size: 28 })}
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)', display: 'block', lineHeight: 1 }}>{stat.count}</span>
                   <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Registros</span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px' }}>{stat.name}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: '500', margin: 0 }}>{stat.label}</p>
              </div>

              <div className="card-arrow" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: stat.color, fontWeight: '800', fontSize: '13px', opacity: 0.8 }}>
                 Gestionar <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
        
        {/* Secondary Modules Grid */}
        <div style={{ gridColumn: '1 / -1', marginTop: '40px' }}>
           <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={22} className="text-primary" /> Configuraciones Avanzadas
           </h2>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              {[
                { name: 'Instituciones Educativas', icon: <Building2 />, href: '/dashboard/institutional/structuring/educational-institutions', desc: 'Gestionar convenios y colegios vinculados.' },
                { name: 'Categorías Digitales', icon: <FolderTree />, href: '/dashboard/institutional/structuring/digital-categories', desc: 'Clasificación de carpetas y archivos.' },
                { name: 'Entidades Adm.', icon: <ShieldCheck />, href: '/dashboard/institutional/structuring/admin-entities', desc: 'EPS, Fondos, y entidades de salud.' },
                { name: 'Informes Personalizados', icon: <FileBarChart />, href: '/dashboard/institutional/structuring/reports-configuration', desc: 'Títulos y formatos de reporte.' },
                { name: 'Configuración Institucional', icon: <Settings />, href: '/dashboard/structuring/configuration', desc: 'Logo, NIT, Colores y datos básicos.' },
              ].map(sub => (
                <Link key={sub.name} href={sub.href} style={{ textDecoration: 'none' }}>
                  <div className="glass-panel sub-module-row" style={{ padding: '20px 24px', display: 'flex', gap: '18px', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}>
                     <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {React.cloneElement(sub.icon as any, { size: 20 })}
                     </div>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{sub.name}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', fontWeight: '500' }}>{sub.desc}</p>
                     </div>
                     <ChevronRight size={18} style={{ color: 'rgba(0,0,0,0.1)' }} />
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </div>

      <style jsx global>{`
        .module-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border-color: rgba(255, 255, 255, 0.4);
        }
        .module-card:hover .card-arrow {
          gap: 12px !important;
          opacity: 1 !important;
        }
        .sub-module-row:hover {
          background: rgba(14, 165, 233, 0.04) !important;
          border-color: rgba(14, 165, 233, 0.2);
          padding-left: 30px !important;
        }
      `}</style>
    </DashboardLayout>
  );
}

function ChevronRight({ size, style }: { size: number, style?: any }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

