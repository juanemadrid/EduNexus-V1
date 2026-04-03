'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Building2, BookOpen, Wallet, ChevronRight,
  MapPin, Monitor, Layers, Calendar, Users, 
  FileText, ShieldCheck, Database, Award, BookMarked,
  TrendingUp, FileBarChart, Briefcase, Landmark
} from 'lucide-react';

const tabs = [
  { id: 'institutional', label: 'Estructuración Institucional', icon: <Building2 size={20} />, color: '#3b82f6' },
  { id: 'academic', label: 'Estructuración Académica', icon: <BookOpen size={20} />, color: '#8b5cf6' },
  { id: 'treasury', label: 'Configuración Financiera', icon: <Wallet size={20} />, color: '#10b981' }
];

const configData = {
  institutional: [
    { title: 'Sedes y Jornadas', desc: 'Sedes físicas e infraestructura temporal.', icon: <MapPin />, href: '/dashboard/institutional/structuring/branches' },
    { title: 'Aulas de Clase', desc: 'Mapeo de salones y laboratorios.', icon: <Monitor />, href: '/dashboard/institutional/structuring/classrooms' },
    { title: 'Niveles Académicos', desc: 'Preescolar, Primaria, Bachillerato, etc.', icon: <Layers />, href: '/dashboard/institutional/structuring/levels' },
    { title: 'Periodos / Ciclos', desc: 'Trimestres, semestres o años lectivos.', icon: <Calendar />, href: '/dashboard/institutional/structuring/periods' },
    { title: 'Perfiles de Usuario', desc: 'Roles y permisos de la plataforma.', icon: <Users />, href: '/dashboard/institutional/structuring/profiles' },
    { title: 'Aliados Corporativos', desc: 'Empresas vinculadas, sponsors.', icon: <Briefcase />, href: '/dashboard/institutional/structuring/companies' },
    { title: 'Requisitos de Adm.', icon: <FileText />, desc: 'Documentos exigidos para el ingreso.', href: '/dashboard/institutional/structuring/digital-documents' },
    { title: 'Instituciones Educ.', icon: <Building2 />, desc: 'Colegios procedentes o en convenio.', href: '/dashboard/institutional/structuring/educational-institutions' },
    { title: 'Entidades Salud/Pension', icon: <ShieldCheck />, desc: 'Seguridad social (EPS/ARL).', href: '/dashboard/institutional/structuring/admin-entities' },
    { title: 'Informes Personalizados', icon: <FileBarChart />, desc: 'Formatos de reportes.', href: '/dashboard/institutional/structuring/reports-configuration' },
    { title: 'Categorías Digitales', icon: <Database />, desc: 'Carpetas de documentos.', href: '/dashboard/institutional/structuring/digital-categories' },
    { title: 'Preguntas Personal.', icon: <FileText />, desc: 'Campos personalizados extra.', href: '/dashboard/institutional/structuring/custom-questions' },
    { title: 'Ajustes Generales', icon: <Settings />, desc: 'NIT, Logo, Logosímbolo, Contacto.', href: '/dashboard/institutional/structuring/configuration' },
  ],
  academic: [
    { title: 'Programas (Carreras)', icon: <BookMarked />, desc: 'Gestor de programas académicos.', href: '/dashboard/academic/structuring/programs' },
    { title: 'Categorías de Prog.', icon: <Layers />, desc: 'Familias de programas.', href: '/dashboard/academic/structuring/program-categories' },
    { title: 'Cursos / Grados', icon: <Layers />, desc: 'Cursos como 1ro, 2do de primaria.', href: '/dashboard/academic/structuring/cursos' },
    { title: 'Asignaturas / Materias', icon: <BookOpen />, desc: 'Matemáticas, Física, etc.', href: '/dashboard/academic/structuring/subjects' },
    { title: 'Planilla de Grupos', icon: <Users />, desc: 'Composición de grupos de estudiantes.', href: '/dashboard/academic/structuring/grupos' },
    { title: 'Parámetros Evaluativos', icon: <FileBarChart />, desc: 'Criterios: Saber, Hacer, Ser.', href: '/dashboard/academic/structuring/eval-parameters' },
    { title: 'Condiciones de Matr.', icon: <ShieldCheck />, desc: 'Bloqueos por deuda, inhabilitaciones.', href: '/dashboard/academic/structuring/enrollment-conditions' },
    { title: 'Requisitos de Matr.', icon: <FileText />, desc: 'Listado de requisitos de ingreso.', href: '/dashboard/academic/structuring/enrollment-requirements' },
    { title: 'Reglas de Grado', icon: <Award />, desc: 'Exigencias para certificar grado.', href: '/dashboard/academic/structuring/graduation-requirements' },
    { title: 'Causales de Retiro', icon: <TrendingUp />, desc: 'Motivos de deserción / retiro.', href: '/dashboard/academic/structuring/cancellation-causes' },
  ],
  treasury: [
    { title: 'Productos y Rubros', icon: <Wallet />, desc: 'Pensiones, Matrículas, Uniformes.', href: '/dashboard/treasury/products' },
    { title: 'Impuestos y Retenciones', icon: <Landmark />, desc: 'Configuración tributaria global.', href: '/dashboard/treasury/structuring/taxes' },
    { title: 'Planes de Facturación', icon: <FileText />, desc: 'Lotes cíclicos, cortes mensuales.', href: '/dashboard/treasury/billing' },
    { title: 'Ajustes Cartera', icon: <Database />, desc: 'Opciones de cartera y deudores.', href: '/dashboard/treasury/structuring' },
  ]
};

export default function GlobalSettingsPage() {
  const [activeTab, setActiveTab] = useState('institutional');

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Premium Header */}
        <div style={{ marginBottom: '40px', position: 'relative' }}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '16px' }}>
              <Settings size={14} /> CENTRAL DE RECURSOS
            </div>
            <h1 className="heading-premium" style={{ fontSize: '46px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>
              Configuración <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Global</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '18px', fontWeight: '500', marginTop: '12px', maxWidth: '700px', lineHeight: 1.5 }}>
              Administra toda la arquitectura del colegio o corporación desde un solo centro neurálgico. Parametriza lo institucional, académico y financiero libremente.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scroll">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  background: isActive ? `${tab.color}15` : 'var(--bg-secondary)',
                  color: isActive ? tab.color : 'var(--text-dim)',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    style={{ position: 'absolute', inset: 0, border: `2px solid ${tab.color}50`, borderRadius: '16px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, type: 'spring' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}
          >
            {configData[activeTab as keyof typeof configData].map((item, index) => (
              <Link key={index} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div 
                  whileHover={{ scale: 1.02, translateY: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-panel module-card" 
                  style={{ 
                    padding: '24px', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '20px', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.3s, box-shadow 0.3s'
                  }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                    {React.cloneElement(item.icon as any, { size: 24, strokeWidth: 2 })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-dim)', margin: 0, fontWeight: '500', lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                  </div>
                  <div style={{ alignSelf: 'center', color: 'rgba(0,0,0,0.1)', transition: '0.3s' }} className="chevron-icon">
                    <ChevronRight size={20} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
      <style jsx global>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .module-card:hover {
          border-color: rgba(59, 130, 246, 0.3) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important;
        }
        .module-card:hover .chevron-icon {
          color: #3b82f6 !important;
          transform: translateX(4px);
        }
      `}</style>
    </DashboardLayout>
  );
}
