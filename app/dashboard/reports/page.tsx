'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Filter, Star, Edit, Eye, GraduationCap, CircleDollarSign, LineChart, FileSpreadsheet, Shield } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';

const REPORT_CATEGORIES = [
  {
    id: 'favoritos',
    title: 'Favoritos',
    icon: <Star size={20} color="#f59e0b" fill="#f59e0b" />,
    description: 'Aquí puede establecer sus informes favoritos, editar favoritos.',
    action: { label: 'Editar favoritos', icon: <Edit size={14} /> },
    items: []
  },
  {
    id: 'observador',
    title: 'Observador',
    icon: <Eye size={20} color="#64748b" />,
    items: ['Listado observador', 'Observador']
  },
  {
    id: 'academica',
    title: 'Gestión académica',
    icon: <GraduationCap size={20} color="#64748b" />,
    items: [
      'Inasistencias por curso', 'Consolidado de notas', 'Informe requisitos de matrícula',
      'Fichas de matrículas', 'Seguimientos egresados', 'Estudiantes cancelados',
      'Familiares codeudores estudiantes', 'Asignación académica docentes', 'Consolidado de asistencias - asignaturas individuales',
      'Asistencia / inasistencia detallada por estudiante - asignaturas individuales', 'Cancelados - desertores', 'Consolidado de inasistencias',
      'Consolidado de matriculados por semestre', 'Diseño curricular',      'Docentes pendientes por evaluar',
      'Estadística de matrículas', 'Estudiantes asignaturas reprobadas',      'Estudiantes Asignaturas Canceladas',
      'Estudiantes Cancelados por Inasistencia',
      'Estudiantes con Dificultades',
      'Estudiantes Matriculados',
      'Estudiantes nuevos en la institución',
      'Estudiantes por Cursos',
      'Habilitaciones',
      'Histórico de notas',
      'Historico inasistencias',
      'Homologaciones',
      'Informe Preguntas Personalizadas', 'Inscritos aún no matriculados', 'Listado de Cursos',
      'Listado de Matrículas',
      'Planilla',
      'Resultados académicos',
      'Consolidado de pénsum'
    ]
  },
  {
    id: 'financiera',
    title: 'Gestión financiera',
    icon: <CircleDollarSign size={20} color="#64748b" />,
    items: [
      'Cartera general', 'Ingresos básicos', 'Ingresos consolidados',
      'Ingresos detallados por producto', 'Anulaciones y devoluciones', 'Cartera - pagos',
      'Notas crédito', 'Cuadre caja por producto', 'Cuadre de caja por cajero',
      'Descuentos', 'Egresos', 'Estudiantes por estado financiero',
      'Ingresos', 'Notas crédito aplicadas', 'Informe paz y salvo establecidos',
      'Proyección de recaudo', 'Ingresos Detallados Por Formas'
    ]
  },
  {
    id: 'comercial',
    title: 'Gestión comercial',
    icon: <LineChart size={20} color="#64748b" />,
    items: [
      'Actividades por oportunidades - CRM', 'Ventas por vendedor - CRM',
      'Gestión operadores - CRM', 'Contactos por oportunidad',
      'Oportunidades comerciales - CRM'
    ]
  },
  {
    id: 'excel',
    title: 'Comunidad en Excel',
    icon: <FileSpreadsheet size={20} color="#64748b" />,
    items: [
      'Administrativos', 'Estudiantes', 'Docentes', 'Preinscritos',
      'Egresados - graduados', 'Informes SNIES'
    ]
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: <Shield size={20} color="#64748b" />,
    items: [
       'Permisos usuarios administrativos', 'Permisos asignados a perfiles'
    ]
  }
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('todos');

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 60px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Informes</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Centro de reportes y estadísticas unificado</p>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar reportes..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '48px', background: '#f8fafc', width: '100%', fontSize: '14px' }}
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Filtrar por:</label>
            <select className="input-premium" style={{ height: '48px', width: '200px', fontSize: '14px' }} value={filterModule} onChange={e => setFilterModule(e.target.value)}>
               <option value="todos">Todos los módulos</option>
               <option value="academica">Gestión académica</option>
               <option value="financiera">Gestión financiera</option>
               <option value="comercial">Gestión comercial</option>
               <option value="excel">Comunidad en Excel</option>
               <option value="seguridad">Seguridad</option>
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {REPORT_CATEGORIES.map(category => {
            if (filterModule !== 'todos' && category.id !== filterModule) return null;

            const filteredItems = category.items.filter(item => 
              item.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (searchTerm && filteredItems.length === 0 && category.id !== 'favoritos') {
              return null;
            }

            return (
              <div key={category.id} className="glass-panel" style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: category.description || filteredItems.length > 0 ? '20px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>
                      {category.icon}
                    </div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{category.title}</h2>
                  </div>
                  {category.action && (
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#3b82f6', fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      {category.action.icon} {category.action.label}
                    </button>
                  )}
                </div>

                {category.description && (
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    {category.description}
                  </p>
                )}

                {filteredItems.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                    gap: '12px'
                  }}>
                    {filteredItems.map(report => (
                      <Link 
                        key={report} 
                        href={`/dashboard/reports/${report.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{ 
                          padding: '12px 16px', 
                          borderRadius: '10px', 
                          border: '1px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#475569',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.color = '#475569';
                          e.currentTarget.style.transform = 'none';
                        }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                          {report}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
