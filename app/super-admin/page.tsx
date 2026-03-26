'use client';
import React from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Database,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await db.list<any>('tenants');
        setTenants(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      name: 'Instituciones Totales', 
      value: tenants.length.toString(), 
      icon: <Building2 />, 
      color: '#3b82f6', 
      trend: `+${tenants.filter(t => (Date.now() - (t.createdAt || 0)) < 2592000000).length} este mes` 
    },
    { 
      name: 'Suscripciones Activas', 
      value: tenants.filter(t => t.status === 'ACTIVE' && t.type === 'RENTAL').length.toString(), 
      icon: <CreditCard />, 
      color: '#10b981', 
      trend: 'Planes recurrentes' 
    },
    { 
      name: 'Ventas Únicas', 
      value: tenants.filter(t => t.type === 'SALE').length.toString(), 
      icon: <Database />, 
      color: '#8b5cf6', 
      trend: 'Licencias perpetuas' 
    },
    { 
      name: 'Alertas de Pago', 
      value: tenants.filter(t => t.status === 'INACTIVE' || t.status === 'EXPIRED').length.toString(), 
      icon: <ShieldAlert />, 
      color: '#ef4444', 
      trend: 'Requieren atención' 
    },
  ];

  const recentTenants = [...tenants].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel"
            style={{ 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              border: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: `${stat.color}15`, 
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: stat.color, background: `${stat.color}10`, padding: '4px 10px', borderRadius: '50px' }}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', margin: 0 }}>{stat.name}</p>
              <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', margin: 0 }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Recent Institutions */}
        <div className="glass-panel" style={{ padding: '30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Instituciones Recientes</h4>
            <Link href="/super-admin/institutions" style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {recentTenants.length > 0 ? recentTenants.map((inst, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px', 
                  borderRadius: '16px', 
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', fontWeight: '800', fontSize: '12px', color: '#3b82f6' }}>
                      {inst.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '14px' }}>{inst.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{inst.slug}.edunexus.co</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <span style={{ 
                       fontSize: '10px', 
                       fontWeight: '800', 
                       padding: '4px 10px', 
                       borderRadius: '50px',
                       background: inst.type === 'RENTAL' ? '#eff6ff' : '#f5f3ff',
                       color: inst.type === 'RENTAL' ? '#3b82f6' : '#8b5cf6'
                     }}>
                       {inst.type === 'RENTAL' ? 'ALQUILER' : 'VENTA'}
                     </span>
                     <span style={{ 
                       fontSize: '10px', 
                       fontWeight: '800', 
                       padding: '4px 10px', 
                       borderRadius: '50px',
                       background: inst.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                       color: inst.status === 'ACTIVE' ? '#059669' : '#ef4444'
                     }}>
                       {inst.status}
                     </span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                   No hay instituciones registradas aún.
                </div>
              )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ 
            padding: '30px', 
            background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
            color: 'white', 
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
             <h4 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>Nueva Institución</h4>
             <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Registra un nuevo cliente y configura su base de datos Firebase.</p>
             <Link href="/super-admin/institutions/create">
               <button className="btn-premium" style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <Plus size={18} /> CREAR AHORA
               </button>
             </Link>
          </div>

          <div className="glass-panel" style={{ padding: '30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
             <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>Mantenimiento</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', background: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                   Respaldar Base de Datos Global
                </button>
                <button style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', background: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                   Actualizar Nomenclatura RIPS
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
