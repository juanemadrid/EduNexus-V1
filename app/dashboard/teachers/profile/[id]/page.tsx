'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import {
  User, Printer, Camera, Edit, ArrowLeft,
  ChevronDown
} from 'lucide-react';

export default function TeacherProfileView() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const [localTeachers, setLocalTeachers] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_teachers');
    if (saved) setLocalTeachers(JSON.parse(saved));
  }, []);

  const teacher = localTeachers.find(t => t.id === teacherId) || localTeachers[0];

  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [editableData, setEditableData] = useState<any>({
    nombres: '',
    apellidos: '',
    identificacion: '',
    sexo: '',
    telefono: '',
    celular: '',
    correo: '',
    direccion: '',
    residencia: '',
    barrio: '',
    nacimiento: '',
    lugarNacimiento: '',
    lugarExpedicion: '',
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
    correoInstitucional: '',
    tituloRecibido: '',
    sangre: '',
  });

  useEffect(() => {
    if (teacher) {
      const names = teacher.name.split(' ');
      const sliceIdx = names.length > 2 ? 2 : 1;
      const details = teacher.details || {};
      setEditableData({
        nombres: names.slice(0, sliceIdx).join(' '),
        apellidos: names.slice(sliceIdx).join(' '),
        identificacion: `C.C. ${teacher.id}`,
        sexo: details['Sexo *'] || '—',
        telefono: details['Teléfono *'] || '—',
        celular: details['Celular *'] || '—',
        correo: details['Correo electrónico *'] || teacher.email || '—',
        direccion: details['Dirección'] || '—',
        residencia: teacher.residenceCity || details.residence || '—',
        barrio: teacher.barrio || details.barrio || '—',
        nacimiento: details['Fecha de nacimiento *'] || '—',
        lugarNacimiento: details.birthPlace || '—',
        lugarExpedicion: '—',
        estadoCivil: '—',
        escalafon: '—',
        nivelAcademico: '—',
        especialidad: '—',
        calidadDesempeno: '—',
        tiempoLaboral: '—',
        fechaIngreso: '—',
        fechaRetiro: '—',
        tipoVinculacion: '—',
        origenVinculacion: '—',
        fuenteRecursos: '—',
        salario: '—',
        correoInstitucional: '—',
        tituloRecibido: '—',
        sangre: '—',
      });
    }
  }, [teacher]);

  const handleSave = () => { setIsEditing(false); setSnapshot(null); };
  const handleCancel = () => { if (snapshot) setEditableData(snapshot); setIsEditing(false); setSnapshot(null); };
  const startEditing = () => { setSnapshot({ ...editableData }); setIsEditing(true); };

  const topTabs = [
    { id: 'personal', label: 'Información personal' },
    { id: 'horario', label: 'Horario' },
    { id: 'mas', label: 'Más...' },
  ];

  const getSubTabs = () => {
    if (activeTab === 'personal') {
      return [
        { id: 'basica', label: 'Información básica' },
        { id: 'documentos', label: 'Documentos digitales' },
        { id: 'laboral', label: 'Académica y laboral' },
        { id: 'preguntas', label: 'Preguntas personalizadas' },
      ];
    }
    return [];
  };

  const [activeSubTab, setActiveSubTab] = useState('basica');
  const currentSubTabs = getSubTabs();

  if (!teacher && localTeachers.length > 0) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ fontWeight: '800' }}>Docente no encontrado</h2>
          <button onClick={() => router.back()} className="btn-secondary" style={{ marginTop: '20px' }}>Volver</button>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Cargando...</div>
      </DashboardLayout>
    );
  }

  const infoGrid = [
    { label: 'Nombres', value: editableData.nombres, key: 'nombres' },
    { label: 'Apellidos', value: editableData.apellidos, key: 'apellidos' },
    { label: 'Identificación', value: editableData.identificacion, key: 'identificacion' },
    { label: 'Sexo', value: editableData.sexo, key: 'sexo' },
    { label: 'Teléfono', value: editableData.telefono, key: 'telefono' },
    { label: 'Celular', value: editableData.celular, key: 'celular' },
    { label: 'Correo electrónico', value: editableData.correo, key: 'correo' },
    { label: 'Dirección', value: editableData.direccion, key: 'direccion' },
    { label: 'Lugar de residencia', value: editableData.residencia, key: 'residencia' },
    { label: 'Barrio', value: editableData.barrio, key: 'barrio' },
    { label: 'Fecha de nacimiento', value: editableData.nacimiento, key: 'nacimiento' },
    { label: 'Lugar de nacimiento', value: editableData.lugarNacimiento, key: 'lugarNacimiento' },
  ];

  const additionalGrid = [
    { label: 'Lugar de expedición del documento', value: editableData.lugarExpedicion, key: 'lugarExpedicion' },
    { label: 'Fecha de expedición del documento', value: '—', key: 'f_expedicion' },
    { label: 'Tipo de sangre', value: editableData.sangre, key: 'sangre' },
    { label: 'Estado civil', value: editableData.estadoCivil, key: 'estadoCivil' },
    { label: 'Escalafón', value: editableData.escalafon, key: 'escalafon' },
    { label: 'Nivel académico', value: editableData.nivelAcademico, key: 'nivelAcademico' },
    { label: 'Especialidad', value: editableData.especialidad, key: 'especialidad' },
    { label: 'Calidad de desempeño', value: editableData.calidadDesempeno, key: 'calidadDesempeno' },
    { label: 'Tiempo laboral', value: editableData.tiempoLaboral, key: 'tiempoLaboral' },
    { label: 'Fecha de ingreso', value: editableData.fechaIngreso, key: 'fechaIngreso' },
    { label: 'Fecha de retiro', value: editableData.fechaRetiro, key: 'fechaRetiro' },
    { label: 'Tipo de vinculación', value: editableData.tipoVinculacion, key: 'tipoVinculacion' },
    { label: 'Origen vinculación', value: editableData.origenVinculacion, key: 'origenVinculacion' },
    { label: 'Fuente de recursos', value: editableData.fuenteRecursos, key: 'fuenteRecursos' },
    { label: 'Salario', value: editableData.salario, key: 'salario' },
    { label: 'Correo institucional', value: editableData.correoInstitucional, key: 'correoInstitucional' },
    { label: 'Título recibido', value: editableData.tituloRecibido, key: 'tituloRecibido' },
  ];

  return (
    <DashboardLayout>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} /> Volver al listado
        </button>
        <Link
          href="/dashboard/teachers/register"
          className="btn-premium"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', background: 'var(--primary)', textDecoration: 'none', color: 'white', borderRadius: '10px', fontWeight: '700' }}
        >
          + Registrar nuevo docente
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                id="teacher-photo-input"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
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
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{teacher.name.toUpperCase()}</h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>
                C.C. {teacher.id}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--primary)', fontSize: '13px', fontWeight: '750' }}>
                DOCENTE
                <span style={{ background: '#10b98120', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'var(--primary)', fontWeight: '800' }}>ACTIVO</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Printer size={18} color="#64748b" /></button>
            <button style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}><ChevronDown size={18} color="#64748b" /></button>
          </div>
        </div>
      </div>

      {/* Two-Level Tabs */}
      <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', gap: '30px' }}>
        {topTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setActiveSubTab('basica'); }}
            style={{
              padding: '12px 0',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : 'none',
              color: activeTab === tab.id ? '#1e40af' : '#64748b',
              fontWeight: activeTab === tab.id ? '750' : '600',
              fontSize: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {currentSubTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeSubTab === tab.id ? '#f1f5f9' : 'none',
              color: activeSubTab === tab.id ? '#1e40af' : '#94a3b8',
              fontWeight: activeSubTab === tab.id ? '750' : '600',
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div className="glass-panel" style={{ padding: '40px', background: 'white' }}>
        {activeTab === 'personal' && (
          <>
            {/* Información personal section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ChevronDown size={18} /> INFORMACIÓN PERSONAL
              </h3>
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit size={14} /> Editar información personal
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={handleSave} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                    Guardar
                  </button>
                  <button onClick={handleCancel} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 60px', marginBottom: '40px' }}>
              {infoGrid.map(item => (
                <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '8px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textAlign: 'right', paddingRight: '20px' }}>{item.label}:</span>
                  {isEditing ? (
                    <input
                      className="input-premium"
                      style={{ padding: '4px 8px', fontSize: '13px', width: '100%', background: 'white' }}
                      value={item.value}
                      onChange={(e) => setEditableData({ ...editableData, [item.key]: e.target.value })}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: '750' }}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Información adicional */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginTop: '40px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ChevronDown size={18} /> INFORMACIÓN ADICIONAL
              </h3>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit size={14} /> Editar
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 60px' }}>
              {additionalGrid.map(item => (
                <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', padding: '8px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textAlign: 'right', paddingRight: '20px' }}>{item.label}:</span>
                  {isEditing ? (
                    <input
                      className="input-premium"
                      style={{ padding: '4px 8px', fontSize: '13px', width: '100%', background: 'white' }}
                      value={item.value}
                      onChange={(e) => setEditableData({ ...editableData, [item.key]: e.target.value })}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: '750' }}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab !== 'personal' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontWeight: '600' }}>Contenido de "{topTabs.find(t => t.id === activeTab)?.label}" en desarrollo.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
