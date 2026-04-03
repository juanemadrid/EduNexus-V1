import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Inicio', icon: '🏠', active: true },
    { name: 'Institucional', icon: '🏛️' },
    { name: 'Académico', icon: '🎓' },
    { name: 'Tesorería', icon: '💰' },
    { name: 'Informes', icon: '📊' },
    { name: 'Mensajería', icon: '✉️' },
    { name: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="glass" style={{
      width: '260px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'fixed',
      left: '0',
      top: '0',
      borderRight: '1px solid var(--glass-border)',
      borderRadius: '0'
    }}>
      <div className="brand" style={{ marginBottom: '40px', paddingLeft: '12px' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          EduNexus
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <div 
            key={item.name}
            className="nav-item"
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: item.active ? 'var(--primary-glow)' : 'transparent',
              border: item.active ? '1px solid var(--primary)' : '1px solid transparent',
              transition: 'background 0.2s, border 0.2s'
            }}
            onMouseOver={(e) => {
              if (!item.active) e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseOut={(e) => {
              if (!item.active) e.target.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span style={{ fontWeight: '500', fontSize: '0.95rem', color: item.active ? 'white' : 'var(--text-muted)' }}>
              {item.name}
            </span>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '12px' }}>
        <div className="user-profile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
            AC
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Admin User</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
