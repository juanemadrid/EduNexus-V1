'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Star, Eye, GraduationCap, CircleDollarSign, LineChart, FileSpreadsheet, Shield, CheckCheck, BrainCircuit, AlertTriangle, TrendingDown, ChevronRight, Zap, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  {
    id: 'academica',
    title: 'Gestión académica (Históricos)',
    icon: <GraduationCap size={20} color="var(--primary)" />,
    items: [
      'Inasistencias por curso', 'Consolidado de notas', 'Informe requisitos de matrícula',
      'Fichas de matrículas', 'Asignación académica docentes',
      'Consolidado de asistencias', 'Diseño curricular', 'Docentes pendientes por evaluar',
      'Estadística de matrículas', 'Habilitaciones', 'Histórico de notas', 
      'Homologaciones', 'Listado de Cursos', 'Planilla', 'Consolidado de pénsum'
    ]
  },
  {
    id: 'financiera',
    title: 'Auditoría Financiera',
    icon: <CircleDollarSign size={20} color="#f59e0b" />,
    items: [
      'Ingresos Detallados', 'Anulaciones y devoluciones',
      'Notas crédito', 'Cuadre de caja por producto', 'Cuadre de caja por cajero',
      'Descuentos', 'Egresos', 'Informe paz y salvo establecidos'
    ]
  },
  {
    id: 'excel',
    title: 'Comunidad en Excel',
    icon: <FileSpreadsheet size={20} color="#10b981" />,
    items: ['Administrativos', 'Estudiantes', 'Docentes', 'Preinscritos', 'Egresados - graduados', 'Informes SNIES']
  },
  {
    id: 'seguridad',
    title: 'Seguridad y Accesos',
    icon: <Shield size={20} color="#ef4444" />,
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await db.get<any>('settings', 'report_favorites');
      if (data && data.list) setFavorites(data.list);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const toggleFavorite = async (report: string) => {
    const newFavorites = favorites.includes(report) 
      ? favorites.filter(f => f !== report) 
      : [...favorites, report];
    
    setFavorites(newFavorites);
    try {
      await db.update('settings', 'report_favorites', { list: newFavorites });
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const ReportItem = ({ report, showStar = false }: { report: string; showStar?: boolean }) => {
    const isFav = favorites.includes(report);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {(editingFavorites || showStar) && (
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(report); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0, transition: '0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Star size={16} color={isFav ? '#f59e0b' : '#cbd5e1'} fill={isFav ? '#f59e0b' : 'none'} />
          </button>
        )}
        <Link href={`/dashboard/reports/${toSlug(report)}`} style={{ textDecoration: 'none', flex: 1 }}>
          <div className="report-card-premium">
            <div className="dot" />
            <span className="text">{report}</span>
            <ChevronRight size={14} className="arrow" />
          </div>
        </Link>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
        
        {/* Elite Header */}
        <div style={{ marginBottom: '40px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: '34px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1.5px' }}>Centro de Informes</h1>
            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>Análisis institucional y reportes legales unificados</p>
          </motion.div>
        </div>

        {/* Global Search & Filter */}
        <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.03)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Escriba el nombre de un reporte..."
              className="input-premium"
              style={{ paddingLeft: '54px', height: '54px', background: '#f8fafc', width: '100%', fontSize: '15px', borderRadius: '18px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="input-premium" style={{ height: '54px', width: '240px', fontSize: '14.5px', borderRadius: '18px', padding: '0 20px', fontWeight: '700', color: '#1e293b' }} value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            <option value="todos">Todos los módulos</option>
            <option value="academica">Gestión Académica</option>
            <option value="financiera">Auditoría Financiera</option>
            <option value="excel">Comunidad en Excel</option>
            <option value="seguridad">Seguridad</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ⭐ AI NEXUS INSIGHTS (Phase 2 Elite) */}
          {(filterModule === 'todos' && !searchTerm) && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.05))', borderRadius: '32px', border: '1px solid rgba(139, 92, 246, 0.15)', boxShadow: '0 25px 50px -15px rgba(139,92,246,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#8b5cf6', padding: '12px', borderRadius: '16px', boxShadow: '0 10px 20px -5px rgba(139,92,246,0.4)' }}>
                    <Sparkles size={24} color="white" />
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>Nexus AI <span style={{ color: '#8b5cf6' }}>Insights</span></h2>
                     <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Análisis predictivo de la comunidad hoy</p>
                  </div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '6px 16px', borderRadius: '100px', letterSpacing: '1px' }}>VIVO</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                 {/* Academic Insight */}
                 <motion.div whileHover={{ y: -5 }} style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #fee2e2', display: 'flex', gap: '20px', alignItems: 'flex-start', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <TrendingDown size={22} />
                    </div>
                    <div>
                       <span style={{ fontSize: '10px', fontWeight: '900', color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.5px' }}>RIESGO ACADÉMICO</span>
                       <h4 style={{ margin: '12px 0 6px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>3 Alarmas por Promedio</h4>
                       <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: '1.5' }}>Se detectó una caída del 15% en el desempeño de Matemáticas (9° Grado). Andrés López presenta el riesgo más alto.</p>
                       <button className="insight-btn" style={{ color: '#ef4444' }}>Expediente del Grupo</button>
                    </div>
                 </motion.div>

                 {/* Financial Insight */}
                 <motion.div whileHover={{ y: -5 }} style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #ffedd5', display: 'flex', gap: '20px', alignItems: 'flex-start', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <Zap size={22} />
                    </div>
                    <div>
                       <span style={{ fontSize: '10px', fontWeight: '900', color: '#f97316', background: '#fff7ed', padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.5px' }}>OPTIMIZACIÓN FINANCIERA</span>
                       <h4 style={{ margin: '12px 0 6px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Flujo de Caja Proyectado</h4>
                       <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: '1.5' }}>Alta probabilidad de recaudo para el fin de mes ($12.5M). 8 familias pendientes por pago de transporte.</p>
                       <button className="insight-btn" style={{ color: '#f97316' }}>Ejecutar Cobro Inteligente</button>
                    </div>
                 </motion.div>
              </div>
            </motion.div>
          )}

          {/* ⭐ FAVORITES SECTION */}
          {(filterModule === 'todos' && favorites.length > 0) && (
            <div className="glass-panel" style={{ padding: '32px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '12px', color: '#f59e0b' }}>
                     <Star size={20} fill="#f59e0b" />
                   </div>
                   <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Accesos Directos</h2>
                </div>
                <button
                  onClick={() => setEditingFavorites(e => !e)}
                  className={`btn-premium ${editingFavorites ? 'active' : ''}`}
                  style={{ background: editingFavorites ? '#f0fdf4' : '#f8fafc', color: editingFavorites ? '#10b981' : '#6366f1', fontSize: '13px', fontWeight: '800', padding: '8px 16px', borderRadius: '12px' }}
                >
                  {editingFavorites ? 'Guardar Cambios' : 'Personalizar'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {favorites.map(report => (
                  <ReportItem key={report} report={report} showStar={true} />
                ))}
              </div>
            </div>
          )}

          {/* Main Categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
            {CATEGORIES.map(category => {
              if (filterModule !== 'todos' && category.id !== filterModule) return null;

              const filteredItems = category.items.filter(item =>
                item.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (searchTerm && filteredItems.length === 0) return null;

              return (
                <motion.div 
                  layout
                  key={category.id} 
                  className="glass-panel" 
                  style={{ padding: '32px', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', alignSelf: 'start' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                      {category.icon}
                    </div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>{category.title}</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                    {filteredItems.map(report => (
                      <ReportItem key={report} report={report} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .report-card-premium {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px;
          cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: #475569; position: relative;
        }
        .report-card-premium .dot { width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1; transition: 0.2s; }
        .report-card-premium .text { font-size: 13.5px; font-weight: 600; flex: 1; }
        .report-card-premium .arrow { opacity: 0; color: var(--primary); transform: translateX(-10px); transition: 0.3s; }
        
        .report-card-premium:hover { background: #fbfcfe; color: var(--primary); transform: translateX(4px); }
        .report-card-premium:hover .dot { background: var(--primary); transform: scale(1.3); }
        .report-card-premium:hover .arrow { opacity: 1; transform: translateX(0); }

        .insight-btn { margin-top: 16px; background: none; border: none; font-size: 13px; font-weight: 800; padding: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 4px; }
        .insight-btn:hover { filter: brightness(0.8); }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </DashboardLayout>
  );
}
