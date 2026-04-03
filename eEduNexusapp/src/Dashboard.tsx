import React from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import GlassCard from './components/GlassCard';

const DashboardHome = () => {
  const stats = [
    { title: 'Estudiantes Activos', count: '1,280', trend: '+5%', color: 'var(--primary)' },
    { title: 'Docentes', count: '48', trend: 'Ok', color: 'var(--secondary)' },
    { title: 'Pagos del Mes', count: '$45,200', trend: '+12%', color: 'var(--accent)' },
    { title: 'Alertas Pendientes', count: '12', trend: 'Recientes', color: '#ef4444' },
  ];

  return (
    <div className="dashboard-root">
      {/* Aurora Background */}
      <div className="aurora-container">
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
      </div>

      <Sidebar />
      
      <div style={{ marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav />
        
        <main style={{ padding: '40px', flex: 1 }}>
          <header style={{ marginBottom: '40px' }}>
            <h1 className="heading-premium" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
              Panel de Control
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Bienvenido de nuevo, Administrador. Aquí tienes el estado global de la institución.
            </p>
          </header>

          <section style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '24px', 
            marginBottom: '40px' 
          }}>
            {stats.map((stat) => (
              <GlassCard key={stat.title} style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '900', color: stat.color }}>
                    {stat.count}
                  </span>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '700',
                    color: stat.trend.startsWith('+') ? 'var(--primary)' : 'var(--text-muted)',
                    background: stat.trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {stat.trend}
                  </span>
                </div>
              </GlassCard>
            ))}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            <GlassCard style={{ padding: '30px', minHeight: '450px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 className="heading-premium" style={{ fontSize: '1.4rem' }}>Tendencia de Inscripciones</h2>
                <button className="btn-premium" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Ver Reporte Full</button>
              </div>
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px dashed var(--glass-border)',
                borderRadius: '20px',
                color: 'var(--text-muted)'
              }}>
                [ Visualización de Datos de Inscripciones ]
              </div>
            </GlassCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <GlassCard style={{ padding: '30px' }}>
                <h2 className="heading-premium" style={{ fontSize: '1.4rem', marginBottom: '25px' }}>Acciones Rápidas</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['Nueva Matrícula', 'Subir Notas', 'Generar Factura', 'Ver Reportes Académicos'].map((action) => (
                    <button key={action} className="input-premium" style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {action}
                    </button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard style={{ padding: '25px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Soporte Premium</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  ¿Necesitas ayuda con la migración de datos?
                </p>
                <button className="btn-premium" style={{ width: '100%', background: 'var(--secondary)' }}>Contactar Asesor</button>
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardHome;
