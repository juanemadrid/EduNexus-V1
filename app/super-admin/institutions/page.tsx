'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Database,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { defaultFirebaseConfig } from '@/lib/db/defaultConfig';

export default function InstitutionsManagement() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'RENTAL',
    status: 'ACTIVE',
    adminEmail: '',
    adminPassword: '',
    subscription: {
      monthlyValue: '',
      months: 1,
      discount: 0
    },
    firebaseConfig: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    }
  });

  const fetchInstitutions = async () => {
    try {
      const data = await db.list<any>('tenants');
      setInstitutions(data);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInst) {
        await db.update('tenants', editingInst.id, formData);
      } else {
        // 1. Create the tenant document
        const tenantId = formData.slug; // Use slug as custom ID
        await db.create('tenants', { 
          id: tenantId,
          ...formData, 
          createdAt: Date.now(), 
          usersCount: 1 
        });

        // 2. Auto-generate or use provided Admin credentials
        const adminEmail = formData.adminEmail || `admin@${formData.slug}.com`;
        const adminPassword = formData.adminPassword || 'admin'; // Provided by SA
        
        // 3. Save the Admin in the TENANT'S database
        const tenantConfig = formData.type === 'RENTAL' ? defaultFirebaseConfig : formData.firebaseConfig;
        
        await db.create('users', {
          id: adminEmail,
          email: adminEmail,
          password: adminPassword, // En producción real se debe encriptar, pero para el demo guardamos la original
          name: `Admin - ${formData.name}`,
          role: 'ADMIN',
          status: 'ACTIVE',
          tenantId: tenantId,
          createdAt: Date.now()
        }, tenantConfig);

        alert(`¡Institución creada exitosamente!\n\nCredenciales del Administrador:\nCorreo: ${adminEmail}\nContraseña: ${adminPassword}`);
      }

      await fetchInstitutions();
      setIsModalOpen(false);
      setEditingInst(null);
      resetForm();
    } catch (error) {
      console.error("Error saving institution:", error);
      alert("Error al guardar en Firestore. Verifique la consola.");
    }
  };

  const handleRemoteLogin = (inst: any) => {
    // 1. Config Firebase: RENTAL usa la BD compartida (master), SALE usa su propia BD
    const configToStore = (inst.type === 'RENTAL' || !inst.firebaseConfig?.projectId)
      ? defaultFirebaseConfig
      : inst.firebaseConfig;
    sessionStorage.setItem('edunexus_tenant_config', JSON.stringify(configToStore));
    
    // 2. Guardar usuario con contexto completo del tenant
    localStorage.setItem('edunexus_user', JSON.stringify({ 
      email: inst.adminEmail || `admin@${inst.slug}.com`, 
      role: 'ADMIN', 
      name: `Admin - ${inst.name}`,
      tenantId: inst.id,
      tenantName: inst.name,
      tenantType: inst.type || 'RENTAL',  // CRÍTICO: necesario para el aislamiento de colecciones
      isRemote: true
    }));

    // 3. Redirigir al dashboard de la institución
    window.location.href = '/dashboard';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: 'RENTAL',
      status: 'ACTIVE',
      adminEmail: '',
      adminPassword: '',
      subscription: {
        monthlyValue: '',
        months: 1,
        discount: 0
      },
      firebaseConfig: {
        apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
      }
    });
  };

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const deleteInstitution = async (id: string) => {
    try {
      await db.delete('tenants', id, defaultFirebaseConfig);
      setConfirmDelete(null);
      await fetchInstitutions();
    } catch (error) {
      console.error("Error deleting institution:", error);
      alert("Error al eliminar la institución. Verifique la consola.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Gestión de Instituciones</h3>
        <button 
          onClick={() => { resetForm(); setEditingInst(null); setIsModalOpen(true); }}
          className="btn-premium" 
          style={{ background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none' }}
        >
          <Plus size={18} /> AGREGAR INSTITUCIÓN
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', gap: '20px' }}>
         <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              placeholder="Buscar por nombre o slug..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium"
              style={{ paddingLeft: '48px', height: '44px' }}
            />
         </div>
      </div>

      {/* Institutions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {institutions.filter(inst => inst.name.toLowerCase().includes(searchTerm.toLowerCase())).map((inst) => (
          <motion.div 
            layout
            key={inst._docId || inst.id}
            className="glass-panel"
            style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
               <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                  <Building2 size={24} color="#3b82f6" />
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditingInst(inst); setFormData(inst); setIsModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>
                     <Edit2 size={14} color="#64748b" />
                  </button>
                   <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(inst._docId || inst.id); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fee2e2', cursor: 'pointer' }}>
                      <Trash2 size={14} color="#ef4444" />
                   </button>
               </div>
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 4px' }}>{inst.name}</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>{inst.slug}.edunexus.co</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
               <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>TIPO</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: inst.type === 'RENTAL' ? '#3b82f6' : '#8b5cf6' }}>{inst.type === 'RENTAL' ? 'Alquiler SaaS' : 'Licencia Venta'}</span>
               </div>
               <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>ESTADO</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: inst.status === 'ACTIVE' ? '#059669' : '#ef4444' }}>{inst.status}</span>
               </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: inst.firebaseConfig?.projectId ? '#059669' : inst.type === 'RENTAL' ? '#3b82f6' : '#ef4444' }}>
                  <Database size={14} />
                  <span style={{ fontSize: '11px', fontWeight: '800' }}>
                    {inst.firebaseConfig?.projectId ? 'FIREBASE PROPIO' : inst.type === 'RENTAL' ? 'BD COMPARTIDA ✓' : 'SIN CONFIGURACIÓN'}
                  </span>
               </div>
                <button 
                  onClick={() => handleRemoteLogin(inst)}
                  className="btn-premium" 
                  style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '800', background: '#3b82f6' }}
                >
                   ACCESO REMOTO
                </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.2)' }}
            >
              <form onSubmit={handleSave}>
                <div style={{ padding: '30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>{editingInst ? 'Editar Institución' : 'Nueva Institución'}</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>

                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* Basic Info Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#3b82f6', letterSpacing: '0.5px' }}>INFORMACIÓN BÁSICA</h5>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>NOMBRE DE LA INSTITUCIÓN</label>
                          <input required className="input-premium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Colegio San José" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>SLUG / SUBDOMINIO</label>
                          <div style={{ position: 'relative' }}>
                             <input required className="input-premium" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="sanjose" />
                             <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#94a3b8', fontSize: '13px' }}>.edunexus.co</span>
                          </div>
                        </div>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>TIPO DE CONTRATO</label>
                          <select className="input-premium" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                             <option value="RENTAL">Alquiler (SaaS)</option>
                             <option value="SALE">Venta Única (Licencia)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>ESTADO INICIAL</label>
                          <select className="input-premium" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                             <option value="ACTIVE">Activa</option>
                             <option value="INACTIVE">Inactiva</option>
                          </select>
                        </div>
                     </div>
                  </div>

                  {/* Access Credentials Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', background: '#f0fdf4', borderRadius: '24px', border: '1px solid #bbf7d0' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={20} color="#16a34a" />
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#166534' }}>CREDENCIALES DE ACCESO</h5>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>CORREO ADMINISTRATIVO</label>
                          <input type="email" required className="input-premium" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} placeholder="Ej: rector@colegio.edu.co" style={{ background: 'white', borderColor: '#bbf7d0' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>CONTRASEÑA INICIAL</label>
                          <input type="text" required className="input-premium" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} placeholder="Ej: admin123" style={{ background: 'white', borderColor: '#bbf7d0' }} />
                        </div>
                     </div>
                  </div>

                  {/* Subscription Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', background: '#fdf4ff', borderRadius: '24px', border: '1px solid #fbcfe8' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={20} color="#d946ef" />
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#86198f' }}>TARIFA DE LA SUSCRIPCIÓN</h5>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#86198f', marginBottom: '8px' }}>MENSUALIDAD (BASE)</label>
                          <input type="number" className="input-premium" value={formData.subscription.monthlyValue} onChange={e => setFormData({...formData, subscription: {...formData.subscription, monthlyValue: e.target.value}})} placeholder="Ej: 150000" style={{ background: 'white', borderColor: '#fbcfe8' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#86198f', marginBottom: '8px' }}>MESES A PAGAR</label>
                          <input type="number" min="1" className="input-premium" value={formData.subscription.months} onChange={e => setFormData({...formData, subscription: {...formData.subscription, months: parseInt(e.target.value) || 1}})} style={{ background: 'white', borderColor: '#fbcfe8' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#86198f', marginBottom: '8px' }}>DESCUENTO APLICADO (%)</label>
                          <input type="number" min="0" max="100" className="input-premium" value={formData.subscription.discount} onChange={e => setFormData({...formData, subscription: {...formData.subscription, discount: parseFloat(e.target.value) || 0}})} placeholder="Ej: 10" style={{ background: 'white', borderColor: '#fbcfe8' }} />
                        </div>
                     </div>
                     <div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #fbcfe8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#a21caf' }}>Resumen del Pago (Total a facturar):</span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#86198f' }}>
                          ${(
                            (parseFloat(formData.subscription.monthlyValue as string) || 0) * 
                            formData.subscription.months * 
                            (1 - formData.subscription.discount / 100)
                          ).toLocaleString('es-CO')}
                        </span>
                     </div>
                  </div>

                  {/* Firebase Config Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Database size={20} color="#3b82f6" />
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>CONFIGURACIÓN BASE DE DATOS</h5>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>API KEY</label>
                          <input className="input-premium" value={formData.firebaseConfig.apiKey} onChange={e => setFormData({...formData, firebaseConfig: {...formData.firebaseConfig, apiKey: e.target.value}})} style={{ background: 'white' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>PROJECT ID</label>
                          <input className="input-premium" value={formData.firebaseConfig.projectId} onChange={e => setFormData({...formData, firebaseConfig: {...formData.firebaseConfig, projectId: e.target.value}})} style={{ background: 'white' }} />
                        </div>
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>AUTH DOMAIN</label>
                          <input className="input-premium" value={formData.firebaseConfig.authDomain} onChange={e => setFormData({...formData, firebaseConfig: {...formData.firebaseConfig, authDomain: e.target.value}})} style={{ background: 'white' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>APP ID</label>
                          <input className="input-premium" value={formData.firebaseConfig.appId} onChange={e => setFormData({...formData, firebaseConfig: {...formData.firebaseConfig, appId: e.target.value}})} style={{ background: 'white' }} />
                        </div>
                     </div>
                  </div>

                </div>

                <div style={{ padding: '30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                   <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '800', color: '#64748b', cursor: 'pointer' }}>Cancelar</button>
                   <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '800', cursor: 'pointer' }}>GUARDAR INSTITUCIÓN</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal de confirmación de eliminación ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '420px', width: '90%', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={28} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 10px' }}>¿Eliminar institución?</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px' }}>Esta acción es permanente y no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button onClick={() => deleteInstitution(confirmDelete)} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-panel { transition: 0.3s ease; }
        .glass-panel:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); border-color: #3b82f644 !important; }
        .btn-secondary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }
      `}</style>
    </div>
  );
}
