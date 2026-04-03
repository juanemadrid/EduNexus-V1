'use client';
import React from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PermissionGateProps {
  permissionId: string;
  children: React.ReactNode;
}

export default function PermissionGate({ permissionId, children }: PermissionGateProps) {
  const { hasPermission, isLoading, isAdmin } = usePermissions();
  const router = useRouter();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner-premium"></div>
        <style jsx>{`
          .spinner-premium {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(16, 185, 129, 0.1);
            border-left-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!isAdmin && !hasPermission(permissionId)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '70vh',
        textAlign: 'center',
        padding: '20px' 
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#ef4444', 
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 10px 20px rgba(239, 68, 68, 0.1)'
        }}>
          <ShieldAlert size={40} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '12px', letterSpacing: '-0.5px' }}>Acceso Restringido</h1>
        <p style={{ color: '#64748b', maxWidth: '400px', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
          Lo sentimos, no tienes los permisos necesarios para acceder al módulo de <strong>{permissionId}</strong>. Contacta al administrador para solicitar acceso.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => router.back()}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', 
              color: '#64748b', fontWeight: '700', cursor: 'pointer' 
            }}
          >
            <ArrowLeft size={18} /> Volver
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              borderRadius: '12px', border: 'none', background: 'var(--primary)', 
              color: 'white', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 4px 12px var(--primary-glow)' 
            }}
          >
            <Home size={18} /> Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
