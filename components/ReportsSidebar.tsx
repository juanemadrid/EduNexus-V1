'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronRight, FileText } from 'lucide-react';

const REPORTS = [
  { group: 'Observador', items: ['Listado observador', 'Observador'] },
  { group: 'Gestión académica', items: [
    'Inasistencias por curso', 'Consolidado de notas', 'Informe requisitos de matrícula',
    'Fichas de matrículas', 'Seguimientos egresados', 'Estudiantes cancelados',
    'Familiares codeudores estudiantes', 'Asignación académica docentes',
    'Consolidado de asistencias - asignaturas individuales',
    'Asistencia / inasistencia detallada por estudiante - asignaturas individuales',
    'Cancelados - desertores', 'Consolidado de inasistencias',
    'Consolidado de matriculados por semestre', 'Diseño curricular', 'Docentes pendientes por evaluar',
    'Estadística de matrículas', 'Estudiantes asignaturas reprobadas', 'Estudiantes Asignaturas Canceladas',
    'Estudiantes Cancelados por Inasistencia', 'Estudiantes con Dificultades', 'Estudiantes Matriculados',
    'Estuantes nuevos en la institución', 'Estuantes por Cursos', 'Habilitaciones',
    'Histórico de notas', 'Historico inasistencias', 'Homologaciones',
    'Informe Preguntas Personalizadas', 'Inscritos aún no matriculados', 'Listado de Cursos',
    'Listado de Matrículas', 'Planilla', 'Resultados académicos', 'Consolidado de pénsum'
  ]},
  { group: 'Gestión financiera', items: [
    'Cartera general', 'Ingresos básicos', 'Ingresos consolidados',
    'Ingresos detallados por producto', 'Anulaciones y devoluciones', 'Cartera - pagos',
    'Notas crédito', 'Cuadre caja por producto', 'Cuadre de caja por cajero',
    'Descuentos', 'Egresos', 'Estuantes por estado financiero',
    'Ingresos', 'Notas crédito aplicadas', 'Informe paz y salvo establecidos',
    'Proyección de recaudo', 'Ingresos Detallados Por Formas'
  ]}
];

function toSlug(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export default function ReportsSidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();

  const filteredReports = REPORTS.map(group => ({
    ...group,
    items: group.items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
  })).filter(group => group.items.length > 0);

  return (
    <div style={{ 
      width: '300px', 
      background: 'white', 
      borderRight: '1px solid #e2e8f0', 
      height: 'calc(100vh - 64px)', 
      display: 'flex', 
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Search Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Informes
        </h2>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Buscar informes..." 
            style={{ 
              width: '100%', 
              height: '35px', 
              paddingLeft: '34px', 
              fontSize: '12px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              background: '#f8fafc',
              outline: 'none'
            }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reports List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {filteredReports.map(group => (
          <div key={group.group} style={{ marginBottom: '20px' }}>
            <h3 style={{ padding: '0 12px 8px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>
              {group.group}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map(item => {
                const slug = toSlug(item);
                const isActive = pathname.includes(slug);
                return (
                  <Link 
                    key={item} 
                    href={`/dashboard/reports/${slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      fontWeight: isActive ? '700' : '500', 
                      color: isActive ? '#059669' : '#475569', 
                      background: isActive ? '#ecfdf5' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: '0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={14} style={{ opacity: isActive ? 1 : 0.5 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
                          {item}
                        </span>
                      </div>
                      {isActive && <ChevronRight size={14} />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
