'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Building2, 
  Save, 
  Globe, 
  ShieldCheck, 
  Palette, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface InstitutionalConfig {
  name: string;
  nit: string;
  legalRepresentative: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
}

const DEFAULT_CONFIG: InstitutionalConfig = {
  name: 'EDUNEXUS ACADEMY',
  nit: '900.123.456-7',
  legalRepresentative: 'JUAN PÉREZ GARCÍA',
  website: 'https://edunexus.edu.co',
  address: 'Calle 100 # 15-20, Bogotá',
  phone: '601 2345678',
  email: 'admin@edunexus.edu.co',
  primaryColor: '#0ea5e9',
  secondaryColor: '#6366f1',
  logo: ''
};

export default function ConfigurationPage() {
  const [config, setConfig] = useState<InstitutionalConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_inst_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    }
    return DEFAULT_CONFIG;
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('edunexus_inst_config', JSON.stringify(config));
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Configuración Institucional</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
            Estructuración institucional / <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Información Global</span>
          </p>
        </div>
        <button 
          className="btn-premium" 
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 32px' }}
        >
          {saving ? 'Guardando...' : success ? <CheckCircle size={20} /> : <Save size={20} />} 
          {success ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* General Information */}
          <section className="glass-panel" style={{ padding: '32px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                   <Building2 size={24} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Información de la Entidad</h2>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="input-group-premium">
                   <label>Nombre de la Institución *</label>
                   <input 
                      className="input-premium" 
                      value={config.name} 
                      onChange={e => setConfig({...config, name: e.target.value.toUpperCase()})} 
                   />
                </div>
                <div className="input-group-premium">
                   <label>NIT / Identificación *</label>
                   <input 
                      className="input-premium" 
                      value={config.nit} 
                      onChange={e => setConfig({...config, nit: e.target.value})} 
                   />
                </div>
                <div className="input-group-premium">
                   <label>Representante Legal</label>
                   <input 
                      className="input-premium" 
                      value={config.legalRepresentative} 
                      onChange={e => setConfig({...config, legalRepresentative: e.target.value.toUpperCase()})} 
                   />
                </div>
                <div className="input-group-premium">
                   <label>Sitio Web</label>
                   <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                      <input 
                         className="input-premium" 
                         style={{ paddingLeft: '44px' }}
                         value={config.website} 
                         onChange={e => setConfig({...config, website: e.target.value})} 
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* Contact Details */}
          <section className="glass-panel" style={{ padding: '32px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                   <Globe size={24} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Ubicación y Contacto</h2>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div className="input-group-premium">
                   <label>Dirección Principal</label>
                   <input 
                      className="input-premium" 
                      value={config.address} 
                      onChange={e => setConfig({...config, address: e.target.value})} 
                   />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                   <div className="input-group-premium">
                      <label>Teléfono de Contacto</label>
                      <input 
                         className="input-premium" 
                         value={config.phone} 
                         onChange={e => setConfig({...config, phone: e.target.value})} 
                      />
                   </div>
                   <div className="input-group-premium">
                      <label>Correo Electrónico de Notificaciones</label>
                      <input 
                         className="input-premium" 
                         value={config.email} 
                         onChange={e => setConfig({...config, email: e.target.value})} 
                      />
                   </div>
                </div>
             </div>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {/* Branding Panel */}
           <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Palette size={18} /> Identidad Visual
              </h3>
              
              <div style={{ marginBottom: '24px' }}>
                 <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '10px', display: 'block' }}>Logo de la Institución</label>
                 <div style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', background: 'rgba(0,0,0,0.03)', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }} className="logo-upload">
                    <ImageIcon size={32} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)' }}>SUBIR IMAGEN</span>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Color Primario</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                       <input type="color" value={config.primaryColor} onChange={e => setConfig({...config, primaryColor: e.target.value})} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                       <span style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>{config.primaryColor.toUpperCase()}</span>
                    </div>
                 </div>
                 <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>Color Secundario</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                       <input type="color" value={config.secondaryColor} onChange={e => setConfig({...config, secondaryColor: e.target.value})} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                       <span style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>{config.secondaryColor.toUpperCase()}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Legal Panel */}
           <div className="glass-panel" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <ShieldCheck size={24} style={{ color: '#059669', flexShrink: 0 }} />
                 <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: '#065f46' }}>Estado de Validación</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#065f46', opacity: 0.8, lineHeight: '1.4' }}>
                       Los datos institucionales han sido validados ante el Ministerio de Educación.
                    </p>
                 </div>
              </div>
           </div>
        </aside>
      </div>

      <style jsx>{`
        .input-group-premium {
           display: flex;
           flex-direction: column;
           gap: 8px;
        }
        .input-group-premium label {
           font-size: 12px;
           font-weight: 800;
           color: var(--text-dim);
           text-transform: uppercase;
           letter-spacing: 0.5px;
        }
        .logo-upload:hover {
           background: rgba(14, 165, 233, 0.05) !important;
           border-color: var(--primary) !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
