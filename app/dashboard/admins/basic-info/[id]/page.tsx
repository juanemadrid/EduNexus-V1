'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  User, 
  ArrowLeft, 
  ChevronDown, 
  Plus, 
  Search, 
  Mail, 
  Camera, 
  Edit3, 
  Printer,
  Edit,
  CloudUpload,
  PenTool,
  Shield,
  Trash2,
  Settings
} from 'lucide-react';

export default function AdminProfileView() {
  const params = useParams();
  const router = useRouter();
  const adminId = params.id as string;
  
  const [localAdmins, setLocalAdmins] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Información básica');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showMasMenu, setShowMasMenu] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [adminRoles, setAdminRoles] = useState<string[]>(['Administrativo']);
  const [showAgregarRolModal, setShowAgregarRolModal] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [firmaImage, setFirmaImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);
  const masMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (masMenuRef.current && !masMenuRef.current.contains(e.target as Node)) {
        setShowMasMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load admin data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_admins');
    if (saved) {
      const admins = JSON.parse(saved);
      setLocalAdmins(admins);
      // Load persisted roles for this admin
      const thisAdmin = admins.find((a: any) => a.id === adminId);
      if (thisAdmin?.roles) setAdminRoles(thisAdmin.roles);
    }
    // Load persisted profile image
    const img = localStorage.getItem(`edunexus_profile_image_${adminId}`);
    if (img) setProfileImage(img);
    // Load persisted signature
    const sign = localStorage.getItem(`edunexus_signature_${adminId}`);
    if (sign) setFirmaImage(sign);
  }, [adminId]);

  // Persist roles whenever they change
  useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_admins');
    if (!saved) return;
    const admins = JSON.parse(saved);
    const updated = admins.map((a: any) =>
      a.id === adminId ? { ...a, roles: adminRoles } : a
    );
    localStorage.setItem('edunexus_registered_admins', JSON.stringify(updated));
  }, [adminRoles, adminId]);

  const admin = localAdmins.find(p => p.id === adminId) || localAdmins[0];

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    sexo: '',
    telefono: '',
    celular: '',
    correo: '',
    direccion: '',
    residence: '',
    barrio: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    lugarExpedicion: '',
    fechaExpedicion: '',
    sangre: '',
    estadoCivil: '',
    escalafon: '',
    nivelAcademico: '',
    especialidad: '',
    calidadDesempeno: '',
    tiempoLaboral: '',
    fechaIngreso: '',
    fechaRetiro: '',
    tipoVinculacion: '',
    origenVinculacion: '',
    fuenteRecursos: '',
    salario: '',
    cargo: ''
  });

  useEffect(() => {
    if (admin) {
      setEditableData({
        primerNombre: admin.details?.primerNombre || '',
        segundoNombre: admin.details?.segundoNombre || '',
        primerApellido: admin.details?.primerApellido || '',
        segundoApellido: admin.details?.segundoApellido || '',
        sexo: admin.details?.sexo || '',
        telefono: admin.details?.telefono || '',
        celular: admin.details?.celular || '',
        correo: admin.correo || '',
        direccion: admin.details?.direccion || '',
        residence: admin.details?.residence || '',
        barrio: admin.details?.barrio || '',
        fechaNacimiento: admin.details?.fechaNacimiento || '',
        lugarNacimiento: admin.details?.lugarNacimiento || '',
        lugarExpedicion: admin.details?.lugarExpedicion || '',
        fechaExpedicion: admin.details?.fechaExpedicion || '',
        sangre: admin.details?.sangre || '',
        estadoCivil: admin.details?.estadoCivil || '',
        escalafon: admin.details?.escalafon || '',
        nivelAcademico: admin.details?.nivelAcademico || '',
        especialidad: admin.details?.especialidad || '',
        calidadDesempeno: admin.details?.calidadDesempeno || '',
        tiempoLaboral: admin.details?.tiempoLaboral || '',
        fechaIngreso: admin.details?.fechaIngreso || '',
        fechaRetiro: admin.details?.fechaRetiro || '',
        tipoVinculacion: admin.details?.tipoVinculacion || '',
        origenVinculacion: admin.details?.origenVinculacion || '',
        fuenteRecursos: admin.details?.fuenteRecursos || '',
        salario: admin.details?.salario || '',
        cargo: admin.details?.cargo || ''
      });
    }
  }, [admin]);

  const handleSave = () => {
    const saved = localStorage.getItem('edunexus_registered_admins');
    if (!saved) return;
    const admins = JSON.parse(saved);
    const updated = admins.map((a: any) =>
      a.id === adminId ? { 
        ...a, 
        name: `${editableData.primerNombre} ${editableData.segundoNombre} ${editableData.primerApellido} ${editableData.segundoApellido}`.replace(/\s+/g, ' ').trim(),
        correo: editableData.correo,
        details: { ...a.details, ...editableData } 
      } : a
    );
    localStorage.setItem('edunexus_registered_admins', JSON.stringify(updated));
    setLocalAdmins(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

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

  // Save profile image as base64 for persistence
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        localStorage.setItem(`edunexus_profile_image_${adminId}`, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete admin and navigate back
  const handleDeleteAdmin = () => {
    if (!confirm(`¿Eliminar al administrativo ${admin.name}? Esta acción no se puede deshacer.`)) return;
    const saved = localStorage.getItem('edunexus_registered_admins');
    const admins = saved ? JSON.parse(saved) : [];
    const updated = admins.filter((a: any) => a.id !== adminId);
    localStorage.setItem('edunexus_registered_admins', JSON.stringify(updated));
    localStorage.removeItem(`edunexus_profile_image_${adminId}`);
    router.push('/dashboard/admins/basic-info');
  };

  const infoTabs = [
    { id: 'Información básica', label: 'Información básica' },
    { id: 'Académica y laboral', label: 'Académica y laboral' },
    { id: 'Documentos digitales', label: 'Documentos digitales' },
    { id: 'Preguntas personalizadas', label: 'Preguntas personalizadas' },
  ];

  const DropdownItem = ({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean }) => (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: danger ? '#ef4444' : '#334155', textAlign: 'left', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? '#fef2f2' : '#f8fafc')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ color: danger ? '#ef4444' : '#64748b' }}>{icon}</span>
      {label}
    </button>
  );

  const LabelValue = ({ label, value, field }: { label: string, value: string, field?: string }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '10px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textAlign: 'right', paddingRight: '20px', textTransform: 'uppercase' }}>{label}:</span>
      {isEditing && field ? (
        <input 
          type="text"
          value={value}
          onChange={(e) => setEditableData((prev: any) => ({ ...prev, [field]: e.target.value }))}
          className="input-premium"
          style={{ padding: '4px 8px', fontSize: '13px', width: '100%', background: 'white' }}
        />
      ) : (
        <span style={{ fontSize: '13px', color: '#334155', fontWeight: '750' }}>{value || ''}</span>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Elite Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} /> Volver al listado
        </button>
        <button
          className="btn-premium"
          onClick={() => router.push('/dashboard/admins/basic-info?openModal=true')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', background: 'var(--primary)', color: 'white' }}
        >
          <Plus size={18} /> Registrar nuevo administrativo
        </button>
      </div>

      {/* Main Profile Card (Elite Glass Style) */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
               <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 style={{ width: '100px', height: '100px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', cursor: 'pointer', overflow: 'hidden' }}
               >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={60} color="#cbd5e1" strokeWidth={1} />
                  )}
               </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', padding: '6px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                >
                   <Camera size={16} color="#64748b" />
                </button>
             </div>
             <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, textTransform: 'lowercase' }}>
                  {(admin.details?.primerNombre || '')} {(admin.details?.segundoNombre || '')}
                </h1>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#64748b', margin: '2px 0 6px', textTransform: 'lowercase' }}>
                  {(admin.details?.primerApellido || '')} {(admin.details?.segundoApellido || '')}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '14px', fontWeight: '800' }}>
                   {admin.details?.tipoId || 'C.C.'} {admin.id} 
                   <span style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>ADMINISTRATIVO</span>
                </div>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
             <span style={{
               padding: '6px 14px',
               background: admin.isActive !== false ? '#dcfce7' : '#fee2e2',
               color: admin.isActive !== false ? '#166534' : '#991b1b',
               fontSize: '11px', fontWeight: '900', borderRadius: '8px', textTransform: 'uppercase'
             }}>
               {admin.isActive !== false ? 'Activo' : 'Inactivo'}
             </span>
             <button
               onClick={() => { if (admin.correo) window.location.href = `mailto:${admin.correo}`; }}
               title={admin.correo || 'Sin correo'}
               style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
             >
               <Mail size={18} color="#64748b" />
             </button>
             <button
               onClick={() => window.print()}
               title="Imprimir perfil"
               style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
             >
               <Printer size={18} color="#64748b" />
             </button>
             <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Camera size={18} color="#64748b" /></button>
             {/* Más... Dropdown */}
             <div ref={masMenuRef} style={{ position: 'relative' }}>
               <button
                 onClick={() => setShowMasMenu(v => !v)}
                 style={{ padding: '8px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#334155' }}
               >
                 Más... <ChevronDown size={14} style={{ transform: showMasMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
               </button>
               {showMasMenu && (
                 <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 500, minWidth: '200px', overflow: 'hidden' }}>
                   <DropdownItem icon={<PenTool size={15} />} label="Cargar firma" onClick={() => { setShowFirmaModal(true); setShowMasMenu(false); }} />
                   <DropdownItem icon={<Shield size={15} />} label="Administrar roles" onClick={() => { setShowRolesModal(true); setShowMasMenu(false); }} />
                   <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                   <DropdownItem icon={<Camera size={15} />} label="Cargar foto" onClick={() => { fileInputRef.current?.click(); setShowMasMenu(false); }} />
                   <DropdownItem icon={<Settings size={15} />} label="Gestión usuario Q10" onClick={() => setShowMasMenu(false)} />
                   <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                   <DropdownItem icon={<Trash2 size={15} />} label="Eliminar administrativo" onClick={() => { setShowMasMenu(false); handleDeleteAdmin(); }} danger />
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Pill-style Sub-tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {infoTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '12px',
              background: activeTab === tab.id ? '#f1f5f9' : 'none',
              color: activeTab === tab.id ? '#1e40af' : '#94a3b8',
              fontWeight: activeTab === tab.id ? '900' : '600',
              fontSize: '13px',
              border: activeTab === tab.id ? '1px solid #e2e8f0' : '1px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: '0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Information Content Card */}
      <div className="glass-panel" style={{ padding: '40px', background: 'white' }}>
        {activeTab === 'Información básica' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ChevronDown size={20} color="var(--primary)" /> INFORMACIÓN PERSONAL
               </h3>
               {!isEditing ? (
                 <button 
                   onClick={() => setIsEditing(true)}
                   style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                 >
                    <Edit size={14} /> Editar información personal
                 </button>
               ) : (
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <button onClick={handleSave} className="btn-premium" style={{ padding: '6px 16px', fontSize: '12px' }}>Guardar</button>
                   <button onClick={handleCancel} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '12px' }}>Cancelar</button>
                 </div>
               )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 60px', marginBottom: '40px' }}>
               <LabelValue label="Nombres" value={editableData.primerNombre + ' ' + editableData.segundoNombre} field="primerNombre" />
               <LabelValue label="Apellidos" value={editableData.primerApellido + ' ' + editableData.segundoApellido} field="primerApellido" />
               <LabelValue label="Identificación" value={`${admin.details?.tipoId || 'C.C.'} ${admin.id}`} />
               <LabelValue label="Sexo" value={editableData.sexo} field="sexo" />
               <LabelValue label="Teléfono" value={editableData.telefono} field="telefono" />
               <LabelValue label="Celular" value={editableData.celular} field="celular" />
               <LabelValue label="Correo electrónico" value={editableData.correo} field="correo" />
               <LabelValue label="Dirección" value={editableData.direccion} field="direccion" />
               <LabelValue label="Lugar de residencia" value={editableData.residence} field="residence" />
               <LabelValue label="Barrio" value={editableData.barrio} field="barrio" />
               <LabelValue label="Fecha de nacimiento" value={editableData.fechaNacimiento} field="fechaNacimiento" />
               <LabelValue label="Lugar de nacimiento" value={editableData.lugarNacimiento} field="lugarNacimiento" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginTop: '20px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ChevronDown size={20} color="var(--primary)" /> INFORMACIÓN ADICIONAL
               </h3>
               {!isEditing && (
                 <button 
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                 >
                    <Edit size={14} /> Editar
                 </button>
               )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 60px' }}>
               <LabelValue label="Lugar de expedición" value={editableData.lugarExpedicion} field="lugarExpedicion" />
               <LabelValue label="Fecha de expedición" value={editableData.fechaExpedicion} field="fechaExpedicion" />
               <LabelValue label="Tipo de sangre" value={editableData.sangre} field="sangre" />
               <LabelValue label="Estado civil" value={editableData.estadoCivil} field="estadoCivil" />
               <LabelValue label="Escalafón" value={editableData.escalafon} field="escalafon" />
               <LabelValue label="Nivel académico" value={editableData.nivelAcademico} field="nivelAcademico" />
               <LabelValue label="Especialidad" value={editableData.especialidad} field="especialidad" />
               <LabelValue label="Calidad de desempeño" value={editableData.calidadDesempeno} field="calidadDesempeno" />
               <LabelValue label="Tiempo laboral" value={editableData.tiempoLaboral} field="tiempoLaboral" />
               <LabelValue label="Fecha de ingreso" value={editableData.fechaIngreso} field="fechaIngreso" />
               <LabelValue label="Fecha de retiro" value={editableData.fechaRetiro} field="fechaRetiro" />
               <LabelValue label="Tipo de vinculación" value={editableData.tipoVinculacion} field="tipoVinculacion" />
               <LabelValue label="Origen vinculación" value={editableData.origenVinculacion} field="origenVinculacion" />
               <LabelValue label="Fuente de recursos" value={editableData.fuenteRecursos} field="fuenteRecursos" />
               <LabelValue label="Salario" value={editableData.salario} field="salario" />
               <LabelValue label="Cargo" value={editableData.cargo} field="cargo" />
            </div>
          </>
        )}

        {activeTab === 'Académica y laboral' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             {/* Información Laboral */}
             <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                   <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                      <ChevronDown size={20} color="var(--primary)" /> INFORMACIÓN LABORAL
                   </h3>
                   <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={14} /> Registrar información laboral
                   </button>
                </div>
                <div style={{ padding: '24px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#fcfcfc', textAlign: 'center' }}>
                   <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                      No hay registros, <span style={{ color: '#2563eb', cursor: 'pointer' }}>cree uno nuevo</span>
                   </p>
                </div>
             </div>

             {/* Información Académica */}
             <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                   <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                      <ChevronDown size={20} color="var(--primary)" /> INFORMACIÓN ACADÉMICA
                   </h3>
                   <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={14} /> Registrar información académica
                   </button>
                </div>
                <div style={{ padding: '24px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#fcfcfc', textAlign: 'center' }}>
                   <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                      No hay registros, <span style={{ color: '#2563eb', cursor: 'pointer' }}>cree uno nuevo</span>
                   </p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Documentos digitales' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {/* Plugin Alert Banner */}
             <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '12px', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0369a1', fontSize: '13px', fontWeight: '600' }}>
                   <div style={{ background: 'white', borderRadius: '50%', padding: '4px' }}>
                      <ChevronDown size={14} style={{ color: '#0369a1', transform: 'rotate(-90deg)' }} />
                   </div>
                   Para escanear documentos es necesario instalar un plugin, para información sobre la instalación <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>ingrese aquí</span>
                </div>
                <button style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', opacity: 0.6 }}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
             </div>

             {/* Documents Toolbar */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#334155', margin: 0 }}>Documentos digitales</h3>
                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <CloudUpload size={18} /> Subir documento
                </button>
             </div>

             <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                   <input type="text" placeholder="Buscar documentos..." className="input-premium" style={{ width: '100%', height: '42px', paddingRight: '120px' }} />
                   <div style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', display: 'flex', gap: '8px' }}>
                      <button style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Search size={16} />
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer', paddingRight: '8px' }}>
                         Búsqueda avanzada <ChevronDown size={12} />
                      </button>
                   </div>
                </div>
                
                <div style={{ width: '200px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>
                      <span>Usando 0,0 B de 20 MB</span>
                      <span style={{ color: '#2563eb' }}>0%</span>
                   </div>
                   <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', background: '#2563eb' }} />
                   </div>
                </div>
             </div>

             {/* Empty State Table */}
             <div style={{ marginTop: '20px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#fcfcfc', padding: '40px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                   No hay registros, verifique los filtros de la consulta o <span style={{ color: '#2563eb', cursor: 'pointer' }}>suba un documento</span>
                </p>
             </div>
          </div>
        )}

        {activeTab === 'Preguntas personalizadas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <ChevronDown size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#334155', margin: 0 }}>PREGUNTAS PERSONALIZADAS</h3>
             </div>
             <div style={{ padding: '24px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#fcfcfc', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>No hay preguntas parametrizadas.</p>
             </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ ADMINISTRAR ROLES MODAL ━━━━━━━━━━ */}
      {showRolesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ background: '#10b981', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Administrar roles</h2>
              <button onClick={() => setShowRolesModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Roles actuales:</span>
                <button
                  onClick={() => setShowAgregarRolModal(true)}
                  style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Agregar rol
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '48px', padding: '8px', border: '1px solid #f1f5f9', borderRadius: '10px', background: '#fafafa' }}>
                {adminRoles.map((role, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                    {role}
                    <button
                      onClick={() => setAdminRoles(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8', lineHeight: 1 }}
                    >
                      <Plus size={12} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                  </span>
                ))}
                {adminRoles.length === 0 && (
                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', alignSelf: 'center', padding: '0 4px' }}>Sin roles asignados</span>
                )}
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRolesModal(false)} style={{ padding: '9px 22px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━ AGREGAR ROL SUB-MODAL ━━━━━━━━━━ */}
      {showAgregarRolModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ background: '#10b981', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Agregar rol</h2>
              <button onClick={() => { setShowAgregarRolModal(false); setSelectedNewRole(''); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Seleccionar nuevo rol:</label>
              <select
                value={selectedNewRole}
                onChange={e => setSelectedNewRole(e.target.value)}
                className="input-premium"
                style={{ width: '100%', fontSize: '13px', height: '40px', appearance: 'none' }}
              >
                <option value="">Agregar rol</option>
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
                <option value="Familiar">Familiar</option>
                <option value="Codeudor">Codeudor</option>
                <option value="Contacto">Contacto</option>
                <option value="Administrador de asistencia digital">Administrador de asistencia digital</option>
              </select>
            </div>
            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setShowAgregarRolModal(false); setSelectedNewRole(''); }} style={{ padding: '9px 22px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button
                onClick={() => {
                  if (selectedNewRole && !adminRoles.includes(selectedNewRole)) {
                    setAdminRoles(prev => [...prev, selectedNewRole]);
                  }
                  setShowAgregarRolModal(false);
                  setSelectedNewRole('');
                }}
                disabled={!selectedNewRole}
                style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: selectedNewRole ? '#10b981' : '#cbd5e1', color: 'white', fontWeight: '800', cursor: selectedNewRole ? 'pointer' : 'not-allowed', fontSize: '14px' }}
              >Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━ CARGAR FIRMA DIGITAL MODAL ━━━━━━━━━━ */}
      {showFirmaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ background: '#10b981', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Cargar firma digital</h2>
              <button onClick={() => setShowFirmaModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <input 
                type="file" 
                ref={signInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      setFirmaImage(base64);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <div style={{ 
                width: '100%', 
                height: '200px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                background: '#f8fafc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                {firmaImage ? (
                  <img src={firmaImage} alt="Firma" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '13px', color: '#64748b', maxWidth: '200px', fontWeight: '500' }}>
                    Actualmente la persona no tiene firma cargada.
                  </span>
                )}
              </div>
              <button 
                onClick={() => signInputRef.current?.click()}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  margin: '0 auto',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <CloudUpload size={16} /> Cargar firma
              </button>
            </div>
            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowFirmaModal(false)} style={{ padding: '9px 22px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button 
                onClick={() => {
                  if (firmaImage) {
                    localStorage.setItem(`edunexus_signature_${adminId}`, firmaImage);
                  }
                  setShowFirmaModal(false);
                }} 
                style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
