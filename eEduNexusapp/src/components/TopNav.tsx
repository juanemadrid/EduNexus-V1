import React from 'react';

const TopNav = () => {
  return (
    <div className="glass" style={{
      height: '70px',
      marginLeft: '260px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
      borderBottom: '1px solid var(--glass-border)',
      borderRadius: '0',
      position: 'sticky',
      top: '0',
      zIndex: 10
    }}>
      <div className="search-bar" style={{ width: '400px' }}>
        <input 
          type="text" 
          placeholder="Buscar estudiantes, notas, reportes..."
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            color: 'white',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ cursor: 'pointer', position: 'relative' }}>
          <span style={{ fontSize: '1.4rem' }}>🔔</span>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '-2px',
            width: '8px',
            height: '8px',
            background: 'var(--primary)',
            borderRadius: '50%',
            border: '2px solid var(--bg-deep)'
          }}></div>
        </div>
        
        <div style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '1.4rem' }}>❓</span>
        </div>
        
        <div style={{
          height: '24px',
          width: '1px',
          background: 'var(--glass-border)'
        }}></div>
        
        <div className="date-display" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>
    </div>
  );
};

export default TopNav;
