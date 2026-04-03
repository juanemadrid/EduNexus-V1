'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';

interface StorageStats {
  maxLimitBytes: number;
  usedBytes: number;
  categories: {
    aulas_virtuales: number;
    documentos_digitales: number;
    documentos_solicitudes: number;
    educacion_virtual: number;
    educacion_virtual_v2: number;
    imagenes_cursos: number;
    respuestas_documentos: number;
    respuestas_foros: number;
    respuestas_tareas: number;
  }
}

const defaultStats: StorageStats = {
  maxLimitBytes: 100 * 1024 * 1024 * 1024, // 100 GB
  usedBytes: 0,
  categories: {
    aulas_virtuales: 0,
    documentos_digitales: 0,
    documentos_solicitudes: 0,
    educacion_virtual: 0,
    educacion_virtual_v2: 0,
    imagenes_cursos: 0,
    respuestas_documentos: 0,
    respuestas_foros: 0,
    respuestas_tareas: 0
  }
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0.00 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const CATEGORIES_METADATA = [
  { key: 'aulas_virtuales', label: 'Aulas Virtuales', color: '#0ea5e9' },
  { key: 'documentos_digitales', label: 'Documentos Digitales', color: '#eab308' },
  { key: 'documentos_solicitudes', label: 'Documentos Solicitudes', color: '#a3e635' }, // yellowish green
  { key: 'educacion_virtual', label: 'Educación Virtual', color: '#a8a29e' },
  { key: 'educacion_virtual_v2', label: 'Educación Virtual v2', color: '#f97316' },
  { key: 'imagenes_cursos', label: 'Imágenes de cursos', color: '#ef4444' },
  { key: 'respuestas_documentos', label: 'Respuestas Documentos Solicitudes', color: '#38bdf8' },
  { key: 'respuestas_foros', label: 'Respuestas de foros Educación Virtual', color: '#6366f1' },
  { key: 'respuestas_tareas', label: 'Respuestas de tareas Educación Virtual', color: '#8b5cf6' },
];

export default function StoragePage() {
  const [stats, setStats] = useState<StorageStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await db.get<StorageStats>('settings', 'storage_stats');
      if (data) {
        setStats({ ...defaultStats, ...data });
      } else {
        // Initialize empty if it doesn't exist
        await db.create('settings', { id: 'storage_stats', ...defaultStats });
        setStats(defaultStats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const freeBytes = Math.max(0, stats.maxLimitBytes - stats.usedBytes);
  const chartData = [
    { name: 'Espacio Usado', value: stats.usedBytes, color: stats.usedBytes > 0 ? '#8b5cf6' : '#e5e7eb' }, 
    { name: 'Espacio Libre', value: freeBytes, color: '#f8fafc' }, 
  ];

  const usedPercentage = stats.maxLimitBytes > 0 ? (stats.usedBytes / stats.maxLimitBytes) * 100 : 0;
  const freePercentage = Math.max(0, 100 - usedPercentage);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0 && payload[0]) {
      return (
        <div style={{ background: 'white', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{payload[0].name}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            {formatBytes(payload[0].value || 0)} ({((payload[0].value || 0) / stats.maxLimitBytes * 100).toFixed(2)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_esta_config">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>Almacenamiento en la Plataforma</h1>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
            <RefreshCw size={24} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', fontWeight: '600' }}>Cargando estadísticas...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px' }}>
            
            {/* Chart Area */}
            <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
               <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={chartData}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={100}
                       paddingAngle={0}
                       dataKey="value"
                       startAngle={90}
                       endAngle={-270}
                       stroke="none"
                     >
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip content={<CustomTooltip />} />
                   </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text overlay */}
                 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                   <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', color: 'var(--text-dim)' }}>USADO</p>
                   <p style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#8b5cf6' }}>{usedPercentage.toFixed(1)}%</p>
                 </div>
               </div>
               
               <div style={{ display: 'flex', gap: '24px', marginTop: '30px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Espacio Usado: {usedPercentage.toFixed(1)} %</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Espacio Libre: {freePercentage.toFixed(1)} %</span>
                 </div>
               </div>
            </div>

            {/* List and Footer Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {CATEGORIES_METADATA.map((cat, index) => {
                     const value = (stats.categories as any)[cat.key] || 0;
                     return (
                       <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: index < CATEGORIES_METADATA.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: cat.color }}></div>
                           <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                             {cat.label} 
                             {cat.key === 'documentos_digitales' && <span style={{ color: '#94a3b8', fontSize: '10.5px', fontWeight: '600', marginLeft: '6px' }}>(10 MB por persona)</span>}
                             {cat.key === 'educacion_virtual' && <span style={{ color: '#94a3b8', fontSize: '10.5px', fontWeight: '600', marginLeft: '6px' }}>(200 MB por aula virtual)</span>}
                           </span>
                         </div>
                         <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>
                           {formatBytes(value)}
                         </span>
                       </div>
                     );
                   })}
                 </div>
              </div>

              {/* Botones de total */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#8b5cf6', letterSpacing: '-0.5px' }}>{formatBytes(stats.usedBytes)}</p>
                  <p style={{ margin: '6px 0 0', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.5px' }}>Espacio Usado</p>
                </div>
                <div style={{ width: '1px', height: '50px', background: '#e2e8f0' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#8b5cf6', letterSpacing: '-0.5px' }}>{formatBytes(stats.maxLimitBytes, 0)}</p>
                  <p style={{ margin: '6px 0 0', fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.5px' }}>Almacenamiento Total</p>
                </div>
              </div>
            </div>

          </div>
        )}
        <style jsx global>{`
          @keyframes spin {
             100% { transform: rotate(360deg); }
          }
        `}</style>
      </PermissionGate>
    </DashboardLayout>
  );
}
