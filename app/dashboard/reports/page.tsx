'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Star, Eye, GraduationCap, CircleDollarSign, LineChart, FileSpreadsheet, Shield, CheckCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// All reports organized by category
const CATEGORIES = [
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
      'Familiares codeudores estudiantes', 'Asignación académica docentes',
      'Consolidado de asistencias - asignaturas individuales',
      'Asistencia / inasistencia detallada por estudiante - asignaturas individuales',
      'Cancelados - desertores', 'Consolidado de inasistencias',
      'Consolidado de matriculados por semestre', 'Diseño curricular', 'Docentes pendientes por evaluar',
      'Estadística de matrículas', 'Estudiantes asignaturas reprobadas', 'Estudiantes Asignaturas Canceladas',
      'Estudiantes Cancelados por Inasistencia', 'Estudiantes con Dificultades', 'Estudiantes Matriculados',
      'Estudiantes nuevos en la institución', 'Estudiantes por Cursos', 'Habilitaciones',
      'Histórico de notas', 'Historico inasistencias', 'Homologaciones',
      'Informe Preguntas Personalizadas', 'Inscritos aún no matriculados', 'Listado de Cursos',
      'Listado de Matrículas', 'Planilla', 'Resultados académicos', 'Consolidado de pénsum'
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
      'Gestión operadores - CRM', 'Contactos por oportunidad', 'Oportunidades comerciales - CRM'
    ]
  },
  {
    id: 'excel',
    title: 'Comunidad en Excel',
    icon: <FileSpreadsheet size={20} color="#64748b" />,
    items: ['Administrativos', 'Estudiantes', 'Docentes', 'Preinscritos', 'Egresados - graduados', 'Informes SNIES']
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: <Shield size={20} color="#64748b" />,
    items: ['Permisos usuarios administrativos', 'Permisos asignados a perfiles']
  }
];

function toSlug(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('todos');
  const [editingFavorites, setEditingFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('edunexus_favorites') || '[]'); } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('edunexus_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (report: string) => {
    setFavorites(prev =>
      prev.includes(report) ? prev.filter(f => f !== report) : [...prev, report]
    );
  };

  const ReportItem = ({ report, showStar = false }: { report: string; showStar?: boolean }) => {
    const isFav = favorites.includes(report);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {(editingFavorites || showStar) && (
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(report); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Star size={15} color={isFav ? '#f59e0b' : '#cbd5e1'} fill={isFav ? '#f59e0b' : 'none'} />
          </button>
        )}
        <Link
          href={`/dashboard/reports/${toSlug(report)}`}
          style={{ textDecoration: 'none', flex: 1 }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid transparent',
              display: 'flex', alignItems: 'center', gap: '10px',
              color: '#475569', fontSize: '13px', fontWeight: '600',
              transition: 'all 0.2s ease', cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
            {report}
          </div>
        </Link>
      </div>
    );
  };

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
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Filtrar</label>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ⭐ FAVORITOS */}
          {(filterModule === 'todos') && (
            <div className="glass-panel" style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: favorites.length > 0 || editingFavorites ? '16px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
                    <Star size={20} color="#f59e0b" fill="#f59e0b" />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Favoritos</h2>
                </div>
                <button
                  onClick={() => setEditingFavorites(e => !e)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: editingFavorites ? '#f0fdf4' : 'none',
                    border: editingFavorites ? '1px solid #86efac' : 'none',
                    color: editingFavorites ? '#16a34a' : '#3b82f6',
                    fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    padding: '6px 14px', borderRadius: '8px', transition: 'all 0.2s'
                  }}
                >
                  {editingFavorites
                    ? <><CheckCheck size={14} /> Finalizar edición</>
                    : <><Star size={14} /> Editar favoritos</>
                  }
                </button>
              </div>

              {favorites.length === 0 && !editingFavorites && (
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                  Aquí puede establecer sus informes favoritos,{' '}
                  <span
                    onClick={() => setEditingFavorites(true)}
                    style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                  >
                    Editar favoritos
                  </span>.
                </p>
              )}

              {favorites.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4px' }}>
                  {favorites.map(report => (
                    <ReportItem key={report} report={report} showStar={true} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other Categories */}
          {CATEGORIES.map(category => {
            if (filterModule !== 'todos' && category.id !== filterModule) return null;

            const filteredItems = category.items.filter(item =>
              item.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (searchTerm && filteredItems.length === 0) return null;

            return (
              <div key={category.id} className="glass-panel" style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>
                    {category.icon}
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{category.title}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4px' }}>
                  {filteredItems.map(report => (
                    <ReportItem key={report} report={report} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
