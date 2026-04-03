'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, GraduationCap, DollarSign, AlertCircle, ArrowUpRight, BookOpen, Clock, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { getDashboardStats, DashboardStats, getAcademicActivity, Activity } from '@/lib/data';
import { MOCK_PAYMENTS } from '@/lib/mockData';
import TimeAgo from '@/components/TimeAgo';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [stats, active] = await Promise.all([
          getDashboardStats(),
          getAcademicActivity()
        ]);
        setStatsData(stats);
        setActivities(active);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { 
      label: 'Estudiantes', 
      value: statsData?.students.value || '...', 
      trend: statsData?.students.trend || '+12% este mes', 
      icon: <Users size={28} />, 
      color: '#3b82f6',
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.0))'
    },
    { 
      label: 'Docentes', 
      value: statsData?.teachers.value || '...', 
      trend: statsData?.teachers.trend || '+3 nuevos', 
      icon: <GraduationCap size={28} />, 
      color: '#8b5cf6',
      bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.0))'
    },
    { 
      label: 'Ingresos Mensuales', 
      value: statsData?.payments.value || '...', 
      trend: statsData?.payments.trend || '+5% esperado', 
      icon: <DollarSign size={28} />, 
      color: '#10b981',
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.0))'
    },
    { 
      label: 'Alertas', 
      value: statsData?.alerts.value || '...', 
      trend: statsData?.alerts.trend || 'Acción requerida', 
      icon: <AlertCircle size={28} />, 
      color: '#ef4444',
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.0))'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '16px' }}>
              <Sparkles size={14} /> EDUNEXUS PREMIUM
            </div>
            <h1 className="heading-premium" style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>
              Hola de nuevo, <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Director</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '18px', fontWeight: '500', marginTop: '8px' }}>
              Aquí tienes el pulso de tu institución hoy.
            </p>
          </div>
          <button 
            className="btn-premium"
            onClick={() => router.push('/dashboard/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}
          >
            Ajustar Sistema
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}
        >
          {stats.map((stat) => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              key={stat.label} 
              className="glass-panel" 
              style={{ 
                padding: '28px', 
                position: 'relative',
                overflow: 'hidden',
                opacity: loading ? 0.7 : 1, 
                cursor: stat.label === 'Alertas' ? 'pointer' : 'default',
                transform: (stat.label === 'Alertas' && showAlertDetails) ? 'scale(1.02)' : 'none',
                borderColor: (stat.label === 'Alertas' && showAlertDetails) ? '#ef4444' : 'var(--glass-border)',
                boxShadow: (stat.label === 'Alertas' && showAlertDetails) ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 10px 30px rgba(0,0,0,0.02)'
              }}
              onClick={() => stat.label === 'Alertas' && setShowAlertDetails(!showAlertDetails)}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: '50%', background: stat.bg, filter: 'blur(40px)', zIndex: 0 }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ color: stat.color, background: `${stat.color}15`, padding: '14px', borderRadius: '16px' }}>
                    {stat.icon}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: stat.color, background: `${stat.color}10`, padding: '4px 12px', borderRadius: '100px', height: 'fit-content' }}>
                    {stat.trend}
                  </span>
                </div>
                <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 4px', color: 'var(--text-main)' }}>
                  {stat.value}
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '600', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Alertas Detail Panel */}
        <AnimatePresence>
          {showAlertDetails && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.03)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '24px', 
                padding: '32px', 
                marginBottom: '40px',
              }}>
                <h4 style={{ color: '#ef4444', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                  <AlertCircle size={22} /> ACCIÓN REQUERIDA: FACTURACIÓN VENCIDA
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {MOCK_PAYMENTS.filter(p => p.status === 'overdue').map(p => (
                    <div key={p.id} style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', border: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.05)' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>{p.student}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Ref: {p.id} • Venció: {p.date}</p>
                      </div>
                      <p style={{ margin: 0, fontWeight: '900', color: '#ef4444', fontSize: '18px' }}>$ {p.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel" 
            style={{ padding: '32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontWeight: '900', fontSize: '22px', margin: '0 0 4px', color: 'var(--text-main)' }}>Actividad Reciente</h3>
                <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '14px', fontWeight: '500' }}>Últimos movimientos en el ecosistema</p>
              </div>
              <button 
                onClick={() => router.push('/dashboard/reports')}
                style={{ color: '#3b82f6', border: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Ver historial completo <ArrowUpRight size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {activities.length > 0 ? activities.map((act) => (
                 <div key={act.id} style={{ display: 'flex', gap: '20px', padding: '20px', border: '1px solid var(--glass-border)', borderRadius: '20px', background: 'var(--bg-secondary)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
                   <div style={{ 
                     background: act.type === 'grade' ? '#dcfce7' : act.type === 'attendance' ? '#dbeafe' : act.type === 'payment' ? '#f3e8ff' : '#fee2e2',
                     color: act.type === 'grade' ? '#166534' : act.type === 'attendance' ? '#1e40af' : act.type === 'payment' ? '#6b21a8' : '#991b1b',
                     width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                   }}>
                     {act.type === 'grade' ? <BookOpen size={24} /> : act.type === 'attendance' ? <Clock size={24} /> : act.type === 'payment' ? <Wallet size={24} /> : <AlertCircle size={24} /> }
                   </div>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{act.user}</p>
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '600' }}><TimeAgo timestamp={act.timestamp} /></span>
                     </div>
                     <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-dim)', fontWeight: '500' }}>{act.detail}</p>
                   </div>
                 </div>
               )) : (
                 <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontWeight: '600' }}>
                   No hay actividad reciente.
                 </div>
               )}
            </div>
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  );
}
