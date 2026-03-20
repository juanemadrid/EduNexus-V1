'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, GraduationCap, DollarSign, AlertCircle, ArrowUpRight, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { getDashboardStats, DashboardStats, getAcademicActivity, Activity } from '@/lib/data';
import { MOCK_PAYMENTS } from '@/lib/mockData';
import TimeAgo from '@/components/TimeAgo';

export default function DashboardPage() {
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
      trend: statsData?.students.trend || '', 
      icon: <Users size={24} />, 
      color: 'var(--primary)' 
    },
    { 
      label: 'Docentes', 
      value: statsData?.teachers.value || '...', 
      trend: statsData?.teachers.trend || '', 
      icon: <GraduationCap size={24} />, 
      color: '#3b82f6' 
    },
    { 
      label: 'Pagos Mes', 
      value: statsData?.payments.value || '...', 
      trend: statsData?.payments.trend || '', 
      icon: <DollarSign size={24} />, 
      color: '#8b5cf6' 
    },
    { 
      label: 'Alertas', 
      value: statsData?.alerts.value || '...', 
      trend: statsData?.alerts.trend || '', 
      icon: <AlertCircle size={24} />, 
      color: '#ef4444' 
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-premium" style={{ fontSize: '32px', fontWeight: '800' }}>Panel General</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Bienvenido al centro de mando de EduNexus.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="glass-panel" 
            style={{ 
              padding: '24px', 
              opacity: loading ? 0.7 : 1, 
              transition: 'all 0.3s',
              cursor: stat.label === 'Alertas' ? 'pointer' : 'default',
              transform: (stat.label === 'Alertas' && showAlertDetails) ? 'scale(1.02)' : 'none',
              border: (stat.label === 'Alertas' && showAlertDetails) ? '2px solid #ef4444' : '1px solid var(--glass-border)'
            }}
            onClick={() => stat.label === 'Alertas' && setShowAlertDetails(!showAlertDetails)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ color: stat.color, background: `${stat.color}15`, padding: '10px', borderRadius: '12px' }}>
                 {stat.icon}
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: stat.color }}>{stat.trend}</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800' }}>{stat.value}</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontWeight: '600' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alertas Detail Panel */}
      {showAlertDetails && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.05)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '20px', 
          padding: '24px', 
          marginBottom: '40px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <h4 style={{ color: '#ef4444', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> FACTURACIÓN VENCIDA
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {MOCK_PAYMENTS.filter(p => p.status === 'overdue').map(p => (
              <div key={p.id} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{p.student}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Referencia: {p.id} • {p.date}</p>
                </div>
                <p style={{ margin: 0, fontWeight: '800', color: '#ef4444' }}>$ {p.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <h3 style={{ fontWeight: '800', fontSize: '20px' }}>Actividad Académica</h3>
             <button style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
               Ver reportes <ArrowUpRight size={16} />
             </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {activities.map((act) => (
               <div key={act.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '16px', background: 'rgba(255,255,255,0.4)' }}>
                 <div style={{ 
                   background: act.type === 'grade' ? '#dcfce7' : act.type === 'attendance' ? '#dbeafe' : act.type === 'payment' ? '#f3e8ff' : '#fee2e2',
                   color: act.type === 'grade' ? '#166534' : act.type === 'attendance' ? '#1e40af' : act.type === 'payment' ? '#6b21a8' : '#991b1b',
                   width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}>
                   {act.type === 'grade' ? <BookOpen size={20} /> : act.type === 'attendance' ? <Clock size={20} /> : act.type === 'payment' ? <DollarSign size={20} /> : <CheckCircle size={20} /> }
                 </div>
                 <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{act.user}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}><TimeAgo timestamp={act.timestamp} /></span>
                   </div>
                   <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>{act.detail}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '24px' }}>Centro de Optimización</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '24px' }}>
            Tu plataforma está operando con la última tecnología de EduNexus para garantizar el mejor rendimiento.
          </p>
          <button className="btn-premium" style={{ width: '100%', background: 'var(--primary)' }}>Contactar Soporte</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
