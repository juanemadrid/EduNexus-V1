'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';
import { motion } from 'framer-motion';
import { CircleDollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Download, Zap } from 'lucide-react';

export default function FinancialEcosystemPage() {
  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 40px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1px' }}>Ecosistema Financiero</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Control inteligente de ingresos, cartera morosa y proyecciones de tesorería.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '14px', 
              fontWeight: '800', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Zap size={18} />
            Cierre de Caja Inteligente
          </motion.button>
        </div>

        {/* Global KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '32px' }}>
          {/* Ingresos Netos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel" style={{ gridColumn: 'span 4', background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircleDollarSign size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Ingresos Brutos (Mes)</h3>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '900', color: '#1e293b', letterSpacing: '-1px' }}>$145.2M <span style={{ fontSize: '16px' }}>COP</span></p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: '700' }}>
              <ArrowUpRight size={16} />
              <span>+12.5% vs mes pasado</span>
            </div>
          </motion.div>

          {/* Egresos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ gridColumn: 'span 4', background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Egresos (Mes)</h3>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '900', color: '#1e293b', letterSpacing: '-1px' }}>$42.8M <span style={{ fontSize: '16px' }}>COP</span></p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', fontWeight: '700' }}>
              <ArrowUpRight size={16} />
              <span>+3.2% vs mes pasado</span>
            </div>
          </motion.div>

          {/* Cartera Morosa (Riesgo) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ gridColumn: 'span 4', background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Wallet size={20} />
                 </div>
                 <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>Cartera Vencida</h3>
               </div>
               <span style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>ALERTA MEDIA</span>
            </div>
            
            <p style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>$28.5M <span style={{ fontSize: '16px', color: '#94a3b8' }}>COP</span></p>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginTop: '16px' }}>
               <div style={{ width: '35%', height: '100%', background: '#f59e0b', borderRadius: '10px' }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>35% de morosidad +30 días recuperable vía NexusBot.</p>
          </motion.div>
        </div>

        {/* Charts & Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
          
          {/* Main Chart Simulation */}
          <div className="glass-panel" style={{ gridColumn: 'span 8', background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Flujo de Caja Anual</h3>
               <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', fontWeight: '600', color: '#475569', outline: 'none' }}>
                 <option>2026</option>
                 <option>2025</option>
               </select>
            </div>
            
            {/* CSS Mock Chart */}
            <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #f1f5f9' }}>
               {[40, 60, 45, 80, 50, 90, 75, 40, 65, 85, 55, 95].map((h, i) => (
                 <div key={i} style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '100%' }}>
                   {/* Ingreso */}
                   <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, duration: 0.5 }} style={{ width: '12px', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }} />
                   {/* Egreso */}
                   <motion.div initial={{ height: 0 }} animate={{ height: `${h * 0.4}%` }} transition={{ delay: (i * 0.05) + 0.1, duration: 0.5 }} style={{ width: '12px', background: '#e2e8f0', borderRadius: '4px 4px 0 0' }} />
                 </div>
               ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
               {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* Quick Actions & Gateway link */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Portal de Familias</h3>
               <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>El ecosistema está conectado con la pasarela de pagos para padres. Más de $40M han sido procesados automáticamente.</p>
               
               <a href="/dashboard/family-portal" target="_blank" style={{ textDecoration: 'none' }}>
                 <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '100px' }}>
                         <CreditCard size={20} />
                       </div>
                       <div>
                         <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Simular Portal</h4>
                         <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Abrir vista de pagos</p>
                       </div>
                    </div>
                    <ArrowUpRight size={18} color="#94a3b8" />
                 </div>
               </a>
            </div>

            <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', flex: 1 }}>
               <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Reportes Financieros</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {['Estado de Cartera', 'Detalle de Facturación PSE', 'Notas Crédito Cierre'].map((rep) => (
                    <div key={rep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1', cursor: 'pointer' }}>
                       <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{rep}</span>
                       <Download size={14} color="#3b82f6" />
                    </div>
                 ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
