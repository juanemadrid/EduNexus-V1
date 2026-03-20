'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ClipboardCheck,
  Search,
  BookOpen,
  PieChart
} from 'lucide-react';
import React from 'react';

const ReportCategory = ({ title, icon: Icon, items }: { title: string, icon: any, items: string[] }) => (
  <div style={{ marginBottom: '40px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
       <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
          <Icon size={20} />
       </div>
       <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
       {items.map(item => (
         <div key={item} className="glass-panel" style={{ 
           padding: '16px 20px', 
           cursor: 'pointer',
           fontSize: '13.5px',
           fontWeight: '600',
           color: 'var(--text-dim)',
           transition: '0.2s',
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center'
         }}
         onMouseEnter={(e) => {
           e.currentTarget.style.background = 'white';
           e.currentTarget.style.color = 'var(--primary)';
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
           e.currentTarget.style.color = 'var(--text-dim)';
         }}
         >
           {item}
           <FileText size={14} opacity={0.4} />
         </div>
       ))}
    </div>
  </div>
);

export default function ReportsDashboard() {
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px' }}>Centro de Informes</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Inteligencia de datos y reportes reglamentarios.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input className="input-premium" placeholder="Filtrar informes..." style={{ width: '280px', paddingLeft: '40px' }} />
        </div>
      </div>

      <ReportCategory 
        title="Gestión académica" 
        icon={BookOpen} 
        items={[
          'Inasistencias por curso', 'Fichas de matrículas', 'Familiares codeudores', 
          'Asistencia detallada', 'Estadística de matrículas', 'Estudiantes nuevos',
          'Histórico de notas', 'Planillas de estudiantes', 'Resultados académicos'
        ]} 
      />

      <ReportCategory 
        title="Gestión financiera" 
        icon={DollarSign} 
        items={[
          'Cartera general', 'Ingresos detallados', 'Notas crédito', 
          'Descuentos aplicados', 'Cuadro de caja', 'Proyección de recaudo'
        ]} 
      />

      <ReportCategory 
        title="Gestión comercial" 
        icon={TrendingUp} 
        items={[
          'Prospectos CRM', 'Ventas por vendedor', 'Oportunidades comerciales',
          'Contactos por oportunidad', 'Gestión de operadores'
        ]} 
      />

    </DashboardLayout>
  );
}
