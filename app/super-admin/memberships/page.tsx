'use client';
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  MoreVertical,
  Clock,
  ShieldCheck,
  ShieldX,
  History,
  X
} from 'lucide-react';
import { db } from '@/lib/db';

export default function MembershipsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchTenants = async () => {
    try {
      // Enforce master db context before fetching
      sessionStorage.removeItem('edunexus_tenant_config');
      localStorage.removeItem('edunexus_tenant');
      const data = await db.list<any>('tenants');
      setTenants(data);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`¿Está seguro de cambiar el estado de la institución a ${newStatus}?`)) return;
    
    try {
      await db.update('tenants', id, { status: newStatus });
      fetchTenants();
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  const handleExtendDays = async (id: string, currentCreatedAt: number) => {
    const extension = 30 * 24 * 60 * 60 * 1000; // 30 days
    const newDate = (currentCreatedAt || Date.now()) + extension;
    
    if (!confirm("¿Desea extender la vigencia de esta suscripción por 30 días adicionales?")) return;

    try {
      await db.update('tenants', id, { createdAt: newDate });
      fetchTenants();
    } catch (err) {
      alert("Error al extender vigencia");
    }
  };

  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-1px' }}>Control de Membresías</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gestión de suscripciones, pagos y vigencias SaaS</p>
        </div>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="btn-premium" style={{ background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
           <History size={18} /> Ver Historial Global
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Buscar por institución o dominio..." 
              className="input-premium"
              style={{ paddingLeft: '48px', height: '48px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-premium" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Filtros
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Institución</th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Plan / Tipo</th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Vencimiento</th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: '16px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Cargando membresías...</td></tr>
            ) : filtered.length > 0 ? filtered.map((tenant) => {
              const expirationDate = new Date((tenant.createdAt || Date.now()) + (30 * 24 * 60 * 60 * 1000));
              const isExpired = expirationDate < new Date() && tenant.type === 'RENTAL';
              
              return (
                <tr key={tenant.id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <p style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{tenant.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{tenant.slug}.edunexus.co</p>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={14} color={tenant.type === 'RENTAL' ? '#3b82f6' : '#8b5cf6'} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                        {tenant.type === 'RENTAL' ? 'Alquiler Mensual' : 'Venta Vitalicia'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isExpired ? '#ef4444' : '#64748b' }}>
                      <Calendar size={14} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        {tenant.type === 'SALE' ? 'N/A (Vitalicio)' : expirationDate.toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      padding: '4px 10px', 
                      borderRadius: '50px',
                      background: tenant.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: tenant.status === 'ACTIVE' ? '#059669' : '#ef4444'
                    }}>
                      {tenant.status === 'ACTIVE' ? 'ACTIVA' : 'SUSPENDIDA'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {tenant.type === 'RENTAL' && (
                        <button 
                          onClick={() => handleExtendDays(tenant.id, tenant.createdAt)}
                          title="Extender suscripción"
                          style={{ background: '#eff6ff', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                        >
                          <Clock size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateStatus(tenant.id, tenant.status)}
                        title={tenant.status === 'ACTIVE' ? "Suspender acceso" : "Activar acceso"}
                        style={{ background: tenant.status === 'ACTIVE' ? '#fef2f2' : '#f0fdf4', border: 'none', color: tenant.status === 'ACTIVE' ? '#ef4444' : '#10b981', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                      >
                        {tenant.status === 'ACTIVE' ? <ShieldX size={18} /> : <ShieldCheck size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No se encontraron instituciones.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Global History Modal */}
      {isHistoryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '600px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button 
              onClick={() => setIsHistoryOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={16} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
                <History size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Historial Global</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Registro de actividad reciente de membresías</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {[
                { type: 'activation', tenant: 'Colegio Nuevo Horizonte', desc: 'Suscripción activada', date: 'Hace 2 horas', icon: ShieldCheck, color: '#10b981', bg: '#dcfce7' },
                { type: 'extension', tenant: 'Liceo Comercial del Norte', desc: 'Vigencia extendida por 30 días', date: 'Ayer, 14:30', icon: Clock, color: '#3b82f6', bg: '#eff6ff' },
                { type: 'suspension', tenant: 'Instituto de Innovación', desc: 'Acceso suspendido temporalmente', date: 'Hace 3 días', icon: ShieldX, color: '#ef4444', bg: '#fee2e2' },
                { type: 'activation', tenant: 'Colegio Santa María', desc: 'Cambio a plan Venta Vitalicia', date: 'Hace 5 días', icon: CreditCard, color: '#8b5cf6', bg: '#f3e8ff' }
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px', alignItems: 'flex-start' }}>
                  <div style={{ background: log.bg, color: log.color, padding: '10px', borderRadius: '12px' }}>
                    <log.icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{log.tenant}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{log.desc}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
