'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User, ArrowLeft, ChevronDown } from 'lucide-react';

export default function AdminProfileView() {
  const params = useParams();
  const router = useRouter();
  const adminId = params.id as string;
  
  const [localAdmins, setLocalAdmins] = useState<any[]>([]);
  
  React.useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_admins');
    if (saved) setLocalAdmins(JSON.parse(saved));
  }, []);

  const allAdmins = [...localAdmins];
  const admin = allAdmins.find(p => p.id === adminId) || allAdmins[0];

  if (!admin) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
           <h2 style={{ fontWeight: '800' }}>Administrativo no encontrado</h2>
           <button onClick={() => router.back()} className="btn-secondary" style={{ marginTop: '20px' }}>Volver</button>
        </div>
      </DashboardLayout>
    );
  }

  const infoGrid = [
    { label: 'Nombres', value: (admin.details?.primerNombre || '') + ' ' + (admin.details?.segundoNombre || '') },
    { label: 'Apellidos', value: (admin.details?.primerApellido || '') + ' ' + (admin.details?.segundoApellido || '') },
    { label: 'Identificación', value: `${admin.details?.tipoId || 'C.C.'} ${admin.id}` },
    { label: 'Sexo', value: admin.details?.sexo || 'N/A' },
    { label: 'Teléfono', value: admin.details?.telefono || 'N/A' },
    { label: 'Celular', value: admin.details?.celular || 'N/A' },
    { label: 'Correo electrónico', value: admin.correo || 'N/A' },
    { label: 'Dirección', value: admin.details?.direccion || 'N/A' },
    { label: 'Lugar de residencia', value: admin.details?.residence || 'N/A' },
    { label: 'Barrio', value: admin.details?.barrio || 'N/A' },
    { label: 'Fecha de nacimiento', value: admin.details?.fechaNacimiento || 'N/A' },
    { label: 'Lugar de nacimiento', value: admin.details?.lugarNacimiento || 'N/A' },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} /> Volver al listado
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
            <User size={60} color="#cbd5e1" strokeWidth={1} />
          </div>
          <div>
             <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{admin.name?.toUpperCase()}</h1>
             <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>
                {admin.details?.tipoId || 'C.C.'} {admin.id} • {admin.type || 'Administrativo'}
             </p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px', background: 'white' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <ChevronDown size={18} /> INFORMACIÓN PERSONAL
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 60px' }}>
           {infoGrid.map((item, idx) => (
             <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '8px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textAlign: 'right', paddingRight: '20px' }}>{item.label}:</span>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: '750' }}>{item.value || 'N/A'}</span>
             </div>
           ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
