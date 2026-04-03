import React from 'react';

const LoginPage = () => {
  return (
    <div className="login-root">
      {/* Aurora Background System */}
      <div className="aurora-container">
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
        <div className="aurora-blob"></div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        position: 'relative'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '50px 40px',
          textAlign: 'center'
        }}>
          <div className="logo-section" style={{ marginBottom: '40px' }}>
            <h1 className="heading-premium" style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              marginBottom: '4px'
            }}>
              EduNexus
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
              Plataforma de Nueva Generación
            </p>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '0.85rem', 
                color: 'var(--text-muted)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Correo Electrónico
              </label>
              <input 
                type="email" 
                placeholder="nombre@institucion.com"
                className="input-premium"
              />
            </div>

            <div className="input-group" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Contraseña
                </label>
                <a href="#" style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '600' }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="input-premium"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <input type="checkbox" id="remember" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
              <label htmlFor="remember" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Mantener sesión iniciada
              </label>
            </div>

            <button className="btn-premium" style={{ width: '100%', fontSize: '1rem' }}>
              Entrar al Portal
            </button>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px', 
              margin: '10px 0',
              color: 'var(--text-muted)',
              fontSize: '0.8rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
              o continuar con
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="input-premium" style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', padding: '12px' }}>
                Google
              </button>
              <button className="input-premium" style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', padding: '12px' }}>
                Microsoft
              </button>
            </div>
          </form>

          <div style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '25px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              © 2026 EduNexus · Innovación Educativa S.A.S.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
