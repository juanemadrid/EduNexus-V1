'use client';
import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Globe, 
  Mail, 
  Lock, 
  RefreshCw, 
  Save,
  ShieldCheck,
  Smartphone,
  Layout
} from 'lucide-react';

export default function GlobalSettingsPage() {
  const [appName, setAppName] = useState('EduNexus Oficial');
  const [supportEmail, setSupportEmail] = useState('soporte@edunexus.co');
  
  const handleSave = () => {
    alert("Configuración guardada exitosamente en Firestore Maestro.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-1px' }}>Configuración Global</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Ajustes maestros del sistema y mantenimiento de infraestructura</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* White Label Settings */}
        <div className="glass-panel" style={{ padding: '30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layout size={20} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Marca Blanco (White Label)</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>NOMBRE DE LA PLATAFORMA</label>
              <input 
                type="text" 
                className="input-premium" 
                value={appName} 
                onChange={(e) => setAppName(e.target.value)}
                style={{ width: '100%', height: '44px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>CORREO DE SOPORTE MAESTRO</label>
              <input 
                type="email" 
                className="input-premium" 
                value={supportEmail} 
                onChange={(e) => setSupportEmail(e.target.value)}
                style={{ width: '100%', height: '44px' }} 
              />
            </div>
            <button 
              onClick={handleSave}
              className="btn-premium" 
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '800' }}
            >
              <Save size={18} /> GUARDAR CAMBIOS
            </button>
          </div>
        </div>

        {/* Database Maintenance */}
        <div className="glass-panel" style={{ padding: '30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Mantenimiento DB</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-premium" style={{ width: '100%', textAlign: 'left', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={18} color="#3b82f6" /> Sincronizar Inquilinos (Cloud)
            </button>
            <button className="btn-premium" style={{ width: '100%', textAlign: 'left', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock size={18} color="#f59e0b" /> Auditar Permisos de API
            </button>
            <button className="btn-premium" style={{ width: '100%', textAlign: 'left', padding: '16px', borderRadius: '12px', border: '1px solid #fef2f2', background: '#fff1f1', fontSize: '14px', fontWeight: '700', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={18} /> Reparar Índices de Firestore
            </button>
          </div>
        </div>

        {/* Connectivity */}
        <div className="glass-panel" style={{ padding: '30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Canales de Notificación</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>WhatsApp Business</span>
              <span style={{ fontSize: '10px', fontWeight: '800', background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '50px' }}>CONECTADO</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Amazon SES (Email)</span>
              <span style={{ fontSize: '10px', fontWeight: '800', background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '50px' }}>SIN CONFIGURAR</span>
            </div>
            <button className="btn-premium" style={{ width: '100%', background: '#1e293b', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', marginTop: '10px' }}>
              CONFIGURAR API GATEWAY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
