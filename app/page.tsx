'use client';
import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular inicio de sesión exitoso
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '48px', textAlign: 'center' }}>
        <h1 className="heading-premium" style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>EduNexus</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', marginBottom: '40px' }}>Modo Elite Light Activo</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>Correo Electrónico</label>
            <input 
              type="email" 
              className="input-premium" 
              placeholder="admin@edunexus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>Contraseña</label>
            <input 
              type="password" 
              className="input-premium" 
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-premium" disabled={isLoading}>
            {isLoading ? 'Autenticando...' : 'Entrar al Portal'}
          </button>
        </form>

        <div style={{ marginTop: '40px', fontSize: '12px', color: 'var(--text-dim)' }}>
           © 2026 EduNexus · Innovación Educativa S.A.S.
        </div>
      </div>
    </div>
  );
}
