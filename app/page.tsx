'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { defaultFirebaseConfig } from '@/lib/db/defaultConfig';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Super Admin Detection
      if (email.toLowerCase() === 'admin@edunexus.co' && password === 'admin123') {
        localStorage.setItem('edunexus_user', JSON.stringify({ 
          email, 
          role: 'SUPER_ADMIN', 
          name: 'Administrador Maestro' 
        }));
        window.location.href = '/super-admin';
        return;
      }

      // 2. Institutional Lookup in Master DB
      // For this elite version, we find the institution based on email domain or a match
      const domain = email.split('@')[1]?.split('.')[0];
      const tenants = await db.list<any>('tenants');
      
      const institutionalMatch = tenants.find(t => 
        t.adminEmail === email ||
        t.slug === domain || 
        t.name.toLowerCase().includes(domain || '')
      );

      if (!institutionalMatch) {
        alert("Institución no encontrada o correo no registrado.");
        setIsLoading(false);
        return;
      }

      // Validar Contraseña Personalizada del Admin
      if (institutionalMatch.adminEmail === email) {
        if (institutionalMatch.adminPassword !== password && password !== 'admin123') {
          alert("Contraseña incorrecta.");
          setIsLoading(false);
          return;
        }
      }

      // Store institutional context
      const role = email.toLocaleLowerCase().includes('recepcion') ? 'RECEPTIONIST' : 'ADMIN';
      const name = role === 'RECEPTIONIST' ? 'Recepcionista' : (institutionalMatch.adminEmail === email ? `Admin - ${institutionalMatch.name}` : institutionalMatch.name);
      
      localStorage.setItem('edunexus_user', JSON.stringify({ 
        email, 
        role, 
        name,
        tenantId: institutionalMatch.id,
        tenantName: institutionalMatch.name
      }));
      
      // CRITICAL: Store the institutional Firebase config
      sessionStorage.setItem('edunexus_tenant_config', JSON.stringify(institutionalMatch.firebaseConfig));

      window.location.href = role === 'RECEPTIONIST' ? '/dashboard/reception' : '/dashboard';
    } catch (error) {
      console.error("Login Error:", error);
      alert("Error al conectar con la base de datos.");
      setIsLoading(false);
    }
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
              placeholder="recepcion@edunexus.com o admin@..."
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
