'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { MOCK_STUDENTS, MOCK_PAYMENTS } from '@/lib/mockData';
import { 
  User, Printer, Camera, Edit, ArrowLeft, 
  ChevronDown
} from 'lucide-react';

export default function StudentProfileView() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [localStudents, setLocalStudents] = useState<any[]>([]);
  
  React.useEffect(() => {
    const saved = localStorage.getItem('edunexus_registered_students');
    if (saved) setLocalStudents(JSON.parse(saved));
  }, []);

  const allStudents = [...localStudents];
  const student = allStudents.find(s => s.id === studentId) || allStudents[0];

  const [activeTab, setActiveTab] = useState('personal');
  const [activeSubTab, setActiveSubTab] = useState('basica');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  const [programCourses, setProgramCourses] = useState([
    { code: '103', name: 'FUNDAMENTOS DE MERCADEO', level: 'Bimestre N° 1', status: 'Pendiente' },
    { code: '104', name: 'MARKETING I', level: 'Bimestre N° 1', status: 'Pendiente' },
    { code: '105', name: 'ETIQUETA Y PROTOCOLO', level: 'Bimestre N° 1', status: 'Pendiente' },
    { code: '106', name: 'ESTUDIOS DE MERCADEO', level: 'Bimestre N° 2', status: 'Pendiente' },
    { code: '107', name: 'COMPORTAMIENTO DEL CONSUMIDOR', level: 'Bimestre N° 2', status: 'Pendiente' },
    { code: '67', name: 'ATENCION Y SERVICIO AL CLIENTE', level: 'Bimestre N° 2', status: 'Pendiente' },
    { code: '108', name: 'TECNICAS DE ESTUDIO ORAL Y ESCRITO - INGLES', level: 'Bimestre N° 3', status: 'Pendiente' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [editableData, setEditableData] = useState(() => {
    const names = student?.name?.split(' ') || [];
    const firstName = names.slice(0, 2).join(' ');
    const lastName = names.slice(2).join(' ') || (names.length > 1 ? names[1] : '');
    
    return {
      nombres: student?.details ? (student.name.split(' ').slice(0, names.length > 2 ? 2 : 1).join(' ')) : (student?.name || 'ACEVEDO ILCE'),
      apellidos: student?.details ? (student.name.split(' ').slice(names.length > 2 ? 2 : 1).join(' ')) : 'ALVAREZ MARIA',
      identificacion: student?.details ? `C.C. ${student.id}` : 'C.C. 1129185890',
      sexo: 'Femenino',
      telefono: '3238802870',
      celular: '3226897930',
      correo: student?.email?.toUpperCase() || '',
      direccion: 'CALLE 12 # 45-67',
      residencia: student?.details?.residence || 'Sampués',
      barrio: student?.details?.barrio || 'EL SOCORRO',
      nacimiento: '21/11/2007',
      lugarNacimiento: student?.details?.birthPlace || 'San Benito Abad',
      lugarExpedicion: 'San Benito Abad',
      estadoCivil: 'Unión libre',
      discapacidad: 'No Aplica',
      estrato: '1',
      transporte: 'Otro',
      formacion: 'Básica Secundaria',
      ocupacion: 'Independiente',
      sisben: 'A1',
      zona: 'Urbana',
      multiculturalidad: 'Indígena',
      eps: 'MUTUAL SER',
      ars: 'MUTUAL SER',
      aseguradora: 'POSITIVA',
      sangre: 'A+',
      hijos: '0',
      libreta: 'No Aplica'
    };
  });

  // Re-sync when student changes
  useEffect(() => {
    if (student && student.details) {
      const names = student.name.split(' ');
      const sliceIdx = names.length > 2 ? 2 : 1;
      setEditableData(prev => ({
        ...prev,
        nombres: names.slice(0, sliceIdx).join(' '),
        apellidos: names.slice(sliceIdx).join(' '),
        identificacion: `C.C. ${student.id}`,
        residencia: student.details.residence,
        barrio: student.details.barrio,
        lugarNacimiento: student.details.birthPlace,
        correo: student.email?.toUpperCase() || prev.correo
      }));
    }
  }, [student]);

  const handleHomologar = (code: string) => {
    setProgramCourses(prev => prev.map(c => 
      c.code === code ? { ...c, status: 'Homologada' } : c
    ));
  };

  const handleSave = () => {
    setIsEditing(false);
    setSnapshot(null);
  };

  const handleCancel = () => {
    if (snapshot) setEditableData(snapshot);
    setIsEditing(false);
    setSnapshot(null);
  };

  const startEditing = () => {
    setSnapshot({...editableData});
    setIsEditing(true);
  };

  const topTabs = [
    { id: 'personal', label: 'Información personal' },
    { id: 'academica', label: 'Información académica' },
    { id: 'virtualidad', label: 'Virtualidad' },
    { id: 'financiera', label: 'Información financiera' },
    { id: 'mas', label: 'Más...' },
  ];

  const getSubTabs = () => {
    if (activeTab === 'personal') {
      return [
        { id: 'basica', label: 'Información básica' },
        { id: 'preguntas', label: 'Preguntas personalizadas' },
        { id: 'familiares', label: 'Familiares y codeudores' },
        { id: 'laboral', label: 'Académica y laboral' },
        { id: 'documentos', label: 'Documentos digitales' },
        { id: 'requisitos', label: 'Requisitos de matrícula' },
      ];
    }
    if (activeTab === 'academica') {
      return [
        { id: 'programas', label: 'Programas' },
        { id: 'record', label: 'Récord académico' },
        { id: 'requisitos_grado', label: 'Requisitos de grado' },
      ];
    }
    return [];
  };

  const currentSubTabs = getSubTabs();

  if (!student) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
           <h2 style={{ fontWeight: '800' }}>Estudiante no encontrado</h2>
           <button onClick={() => router.back()} className="btn-secondary" style={{ marginTop: '20px' }}>Volver</button>
        </div>
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

  const sietGrid = [
    { label: 'Lugar de expedición del documento', value: editableData.lugarExpedicion, key: 'lugarExpedicion' },
    { label: 'Estado civil', value: editableData.estadoCivil, key: 'estadoCivil' },
    { label: 'Discapacidad', value: editableData.discapacidad, key: 'discapacidad' },
    { label: 'Estrato', value: editableData.estrato, key: 'estrato' },
    { label: 'Medio de transporte', value: editableData.transporte, key: 'transporte' },
    { label: 'Nivel de formación', value: editableData.formacion, key: 'formacion' },
    { label: 'Ocupación', value: editableData.ocupacion, key: 'ocupacion' },
    { label: 'Grupo Sisbén', value: editableData.sisben, key: 'sisben' },
    { label: 'Zona', value: editableData.zona, key: 'zona' },
    { label: 'Multiculturalidad', value: editableData.multiculturalidad, key: 'multiculturalidad' },
    { label: 'EPS', value: editableData.eps, key: 'eps' },
    { label: 'ARS', value: editableData.ars, key: 'ars' },
    { label: 'Aseguradora', value: editableData.aseguradora, key: 'aseguradora' },
    { label: 'Tipo de sangre', value: editableData.sangre, key: 'sangre' },
    { label: 'Número de hijos', value: editableData.hijos, key: 'hijos' },
    { label: 'Número libreta militar', value: editableData.libreta, key: 'libreta' },
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
        <button className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', background: 'var(--primary)' }}>
          + Registrar nuevo estudiante
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
               <input 
                 type="file" 
                 id="student-photo-input"
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
               <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{student.name.toUpperCase()}</h1>
               <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>
                  C.C. 112918{student.id.slice(-4)} • {student.level}
               </p>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: '#3b82f6', fontSize: '13px', fontWeight: '750' }}>
                  TECNICO EN MERCADERISTA E IMPULSADOR CON ENFASIS EN CAJA REGISTRADORA
                  <span style={{ background: '#3b82f620', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>v.1</span>
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
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'academica') setActiveSubTab('programas');
              else if (tab.id === 'personal') setActiveSubTab('basica');
              else setActiveSubTab('');
            }}
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

      {/* Information Sections */}
      <div className="glass-panel" style={{ padding: '40px', background: 'white' }}>
        {activeTab === 'personal' && (
          <>
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
                    <button 
                      onClick={handleSave}
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Guardar
                    </button>
                    <button 
                      onClick={handleCancel}
                      style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
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
                        onChange={(e) => setEditableData({...editableData, [item.key]: e.target.value})}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', color: '#334155', fontWeight: '750' }}>{item.value}</span>
                    )}
                 </div>
               ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginTop: '40px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ChevronDown size={18} /> INFORMACIÓN ADICIONAL (SIET)
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
               {sietGrid.map(item => (
                 <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '8px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textAlign: 'right', paddingRight: '20px' }}>{item.label}:</span>
                    {isEditing ? (
                      <input 
                        className="input-premium"
                        style={{ padding: '4px 8px', fontSize: '13px', width: '100%', background: 'white' }}
                        value={item.value}
                        onChange={(e) => setEditableData({...editableData, [item.key]: e.target.value})}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', color: '#334155', fontWeight: '750' }}>{item.value}</span>
                    )}
                 </div>
               ))}
            </div>
          </>
        )}

        {activeTab === 'academica' && (
          <>
            {activeSubTab === 'programas' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                   <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '16px' }}>
                     <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#334155' }}>TECNICO EN MERCADERISTA E IMPULSADOR CON ENFASIS EN CAJA REGISTRADORA</h3>
                   </div>
                   <span style={{ background: '#22c55e', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '750' }}>ACTIVE</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 40px', marginBottom: '30px' }}>
                  {[
                    { label: 'Código matrícula', value: '375' },
                    { label: 'Sede - jornada', value: 'Principal - Mañana' },
                    { label: 'Tipo de evaluación', value: 'Cuantitativa' },
                    { label: 'Nivel', value: 'Bimestre N° 1' },
                    { label: 'Fecha de matrícula', value: '13/01/2026' },
                    { label: 'Periodo', value: '2026-01' },
                    { label: 'Condición de matrícula', value: 'Nuevo' },
                    { label: 'Formalizada', value: 'Sí' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textAlign: 'right', paddingRight: '20px' }}>{item.label}:</span>
                      <span style={{ fontSize: '12px', color: '#334155', fontWeight: '750' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px', color: '#64748b' }}>Código</th>
                      <th style={{ padding: '10px', color: '#64748b' }}>Nombre</th>
                      <th style={{ padding: '10px', color: '#64748b' }}>Nivel</th>
                      <th style={{ padding: '10px', color: '#64748b' }}>Estado</th>
                      <th style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programCourses.map((course, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', color: '#64748b' }}>{course.code}</td>
                        <td style={{ padding: '10px', fontWeight: '600', color: '#334155' }}>{course.name}</td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{course.level}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '10px', 
                            fontWeight: '700', 
                            background: course.status === 'Homologada' ? '#e0f2fe' : '#f1f5f9', 
                            color: course.status === 'Homologada' ? '#0369a1' : '#64748b' 
                          }}>
                            {course.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', position: 'relative' }}>
                           <div className="action-dropdown" style={{ display: 'inline-block' }}>
                             <button style={{ color: '#3b82f6', border: 'none', background: 'none', fontSize: '11px', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                               Matricular <ChevronDown size={12} />
                             </button>
                             <div className="dropdown-content" style={{ position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 100, minWidth: '100px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <button 
                                  onClick={() => handleHomologar(course.code)}
                                  style={{ width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', fontSize: '12px', color: '#334155', cursor: 'pointer' }}
                                >
                                  Homologar
                                </button>
                             </div>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSubTab === 'record' && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', marginBottom: '16px' }}>RÉCORD ACADÉMICO</h3>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '750', color: '#1e40af' }}>
                      TECNICO EN MERCADERISTA E IMPULSADOR CON ENFASIS EN CAJA REGISTRADORA
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Plan de estudios: v.1</p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '12px', color: '#64748b' }}>Asignatura</th>
                      <th style={{ padding: '12px', color: '#64748b' }}>Créditos</th>
                      <th style={{ padding: '12px', color: '#64748b' }}>Nota</th>
                      <th style={{ padding: '12px', color: '#64748b' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'SERVICIO AL CLIENTE', credits: 4, grade: '4.5', status: 'Aprobada' },
                      { name: 'TECNICAS DE VENTA', credits: 3, grade: '4.2', status: 'Aprobada' },
                      { name: 'MANEJO DE CAJA', credits: 4, grade: '-', status: 'Cursando' },
                      { name: 'INGLES TECNICO', credits: 2, grade: '-', status: 'Pendiente' },
                    ].map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{item.name}</td>
                        <td style={{ padding: '12px' }}>{item.credits}</td>
                        <td style={{ padding: '12px', fontWeight: '750' }}>{item.grade}</td>
                        <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              fontSize: '11px', 
                              fontWeight: '700',
                              background: item.status === 'Aprobada' ? '#dcfce7' : item.status === 'Cursando' ? '#dbeafe' : '#f1f5f9',
                              color: item.status === 'Aprobada' ? '#166534' : item.status === 'Cursando' ? '#1e40af' : '#64748b'
                            }}>
                              {item.status.toUpperCase()}
                            </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'financiera' && (
          <>
            <div style={{ marginBottom: '24px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', marginBottom: '16px' }}>ESTADO COMERCIAL Y COBRANZA</h3>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600' }}>TOTAL CARTERA</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#ef4444' }}>$ 1.300.000</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600' }}>TOTAL ABONOS</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#22c55e' }}>$ 450.000</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600' }}>SALDO PENDIENTE</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#334155' }}>$ 850.000</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600' }}>ESTADO</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>MOROSO</p>
                  </div>
               </div>

               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                 <thead>
                   <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                     <th style={{ padding: '12px', color: '#64748b' }}>Referencia</th>
                     <th style={{ padding: '12px', color: '#64748b' }}>Concepto</th>
                     <th style={{ padding: '12px', color: '#64748b' }}>Fecha</th>
                     <th style={{ padding: '12px', color: '#64748b' }}>Valor</th>
                     <th style={{ padding: '12px', color: '#64748b' }}>Estado</th>
                   </tr>
                 </thead>
                 <tbody>
                   {MOCK_PAYMENTS.filter(p => p.student === student?.name).map((item, idx) => (
                     <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                       <td style={{ padding: '12px', fontWeight: '600' }}>{item.id}</td>
                       <td style={{ padding: '12px' }}>Pensión Mensual</td>
                       <td style={{ padding: '12px' }}>{item.date}</td>
                       <td style={{ padding: '12px', fontWeight: '750' }}>$ {item.amount.toLocaleString()}</td>
                       <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: '700',
                            background: item.status === 'paid' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: item.status === 'paid' ? '#166534' : item.status === 'pending' ? '#92400e' : '#991b1b'
                          }}>
                            {item.status === 'paid' ? 'PAGADO' : item.status === 'pending' ? 'PENDIENTE' : 'VENCIDO'}
                          </span>
                       </td>
                     </tr>
                   ))}
                   {MOCK_PAYMENTS.filter(p => p.student === student?.name).length === 0 && (
                     <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay registros financieros para este estudiante.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>
          </>
        )}

        {activeTab === 'virtual' && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
             <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', marginBottom: '16px' }}>EDUCACIÓN VIRTUAL</h3>
             <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: 0, color: '#64748b' }}>El estudiante no tiene cursos virtuales activos en este momento.</p>
                <button className="btn-premium" style={{ marginTop: '16px', background: 'var(--primary)', color: 'white' }}>Explorar Catálogo</button>
             </div>
          </div>
        )}

        {activeTab !== 'personal' && activeTab !== 'academica' && activeTab !== 'financiera' && activeTab !== 'virtual' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontWeight: '600' }}>Contenido de pestaña "{activeTab}" en desarrollo.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
