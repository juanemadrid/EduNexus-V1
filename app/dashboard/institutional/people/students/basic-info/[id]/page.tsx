'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { MOCK_PAYMENTS } from '@/lib/mockData';
import { 
  User, Printer, Camera, Edit, ArrowLeft, 
  ChevronDown, Search, Plus, UserPlus, X, Check, Trash2, Mail, Phone, MapPin, Calendar, CreditCard, ShieldCheck, GraduationCap
} from 'lucide-react';
import { db } from '@/lib/db';

export default function StudentProfileView() {
  const params = useParams();
  const router = useRouter();
  const studentId = (params.id as string) || '';
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await db.get<any>('students', studentId);
      if (data) {
        setStudent(data);
        if (data.photo) setProfileImage(data.photo);
      }
      
      const savedLinks = await db.list<any>('student_family_links', { studentId });
      setLinks(savedLinks);

      const savedFamily = await db.list<any>('family');
      setAvailableFamily(savedFamily);
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('personal');
  const [activeSubTab, setActiveSubTab] = useState('basica');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Linkage state
  const [links, setLinks] = useState<any[]>([]);
  const [availableFamily, setAvailableFamily] = useState<any[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [familySearch, setFamilySearch] = useState('');
  const [linkForm, setLinkForm] = useState({
    parentesco: 'Padre',
    esCodeudor: false
  });

  // Removed redundant useEffect that used localStorage

  const handleCreateLink = async (familiar: any) => {
    const newLink = {
      studentId,
      familiarId: familiar.id,
      familiarName: familiar.name,
      parentesco: linkForm.parentesco,
      esCodeudor: linkForm.esCodeudor,
      date: new Date().toISOString()
    };

    try {
      await db.create('student_family_links', newLink);
      const updatedLinks = await db.list<any>('student_family_links', { studentId });
      setLinks(updatedLinks);
      setShowLinkModal(false);
      alert('Familiar vinculado exitosamente.');
    } catch (error) {
      console.error("Error creating link:", error);
    }
  };

  const handleUnlink = async (linkId: string) => {
    if (!confirm('¿Está seguro de desvincular a este familiar?')) return;
    try {
      await db.delete('student_family_links', linkId);
      setLinks(prev => prev.filter((l: any) => l.id !== linkId));
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

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
    // Update local storage with editable data if needed
    saveStudentData(editableData);
  };

  const saveStudentData = async (data: any, newPhoto?: string) => {
    try {
      const updateData: any = {
        name: `${data.nombres} ${data.apellidos}`.trim(),
      };
      if (newPhoto !== undefined) updateData.photo = newPhoto;
      
      await db.update('students', studentId, updateData);
      setStudent((prev: any) => ({ ...prev, ...updateData }));
    } catch (error) {
       console.error("Error updating student:", error);
    }
  };

  const handleSavePhoto = async () => {
    if (profileImage) {
      await saveStudentData(editableData, profileImage);
      alert('Foto guardada correctamente');
    }
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
                {profileImage && profileImage.startsWith('blob:') && (
                  <button 
                    onClick={handleSavePhoto}
                    style={{ 
                      position: 'absolute',
                      top: '110%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      zIndex: 10
                    }}
                  >
                    Guardar Foto
                  </button>
                )}
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
            {activeSubTab === 'basica' && (
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

            {activeSubTab === 'familiares' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <ChevronDown size={18} /> FAMILIARES Y CODEUDORES VINCULADOS
                    </h3>
                    <button 
                      onClick={() => setShowLinkModal(true)}
                      className="btn-premium"
                      style={{ background: '#3b82f6', color: 'white', padding: '6px 16px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                       <Plus size={16} /> Vincular Familiar
                    </button>
                 </div>

                 {links.length > 0 ? (
                   <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Nombre Completo</th>
                            <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Parentesco</th>
                            <th style={{ textAlign: 'center', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>¿Es Codeudor?</th>
                            <th style={{ textAlign: 'center', padding: '14px 24px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {links.map(l => (
                            <tr key={l.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                               <td style={{ padding: '14px 24px' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{l.familiarName}</div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {l.familiarId}</div>
                               </td>
                               <td style={{ padding: '14px 24px', fontSize: '13px', color: '#475569' }}>{l.parentesco}</td>
                               <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                  <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '12px', 
                                    fontSize: '10px', 
                                    fontWeight: '800', 
                                    background: l.esCodeudor ? '#ecfdf5' : '#f1f5f9', 
                                    color: l.esCodeudor ? '#10b981' : '#64748b' 
                                  }}>
                                    {l.esCodeudor ? 'SÍ - RESPONSABLE' : 'NO'}
                                  </span>
                               </td>
                               <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                  <button 
                                    onClick={() => handleUnlink(l.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   </div>
                 ) : (
                   <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '16px', background: '#fcfcfc', borderStyle: 'dashed' }}>
                      <UserPlus size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                      <p style={{ margin: 0, fontWeight: '700', color: '#64748b' }}>No se registran familiares vinculados a este estudiante.</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Vincule un acudiente o codeudor para generar reportes institucionales.</p>
                   </div>
                 )}

                 {/* ━━━━━━━━━━ LINKING MODAL ━━━━━━━━━━ */}
                 {showLinkModal && (
                   <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                     <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
                        <div style={{ background: '#3b82f6', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white' }}>Vincular Familiar / Codeudor</h2>
                           <button onClick={() => setShowLinkModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={22} /></button>
                        </div>

                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                           <div style={{ marginBottom: '24px' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Buscar Familiar en Base de Datos</label>
                              <div style={{ position: 'relative' }}>
                                 <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                 <input 
                                   type="text" 
                                   placeholder="Nombre o identificación..." 
                                   className="input-premium" 
                                   style={{ width: '100%', height: '48px', paddingLeft: '48px', background: '#f8fafc' }} 
                                   value={familySearch}
                                   onChange={e => setFamilySearch(e.target.value)}
                                 />
                              </div>
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                              <div>
                                 <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Parentesco</label>
                                 <select className="input-premium" style={{ width: '100%', height: '42px', background: '#f8fafc' }} value={linkForm.parentesco} onChange={e => setLinkForm({...linkForm, parentesco: e.target.value})}>
                                    <option>Padre</option>
                                    <option>Madre</option>
                                    <option>Tío(a)</option>
                                    <option>Abuelo(a)</option>
                                    <option>Hermano(a)</option>
                                    <option>Otro</option>
                                 </select>
                              </div>
                              <div>
                                 <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Configuración</label>
                                 <label style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '42px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                    <input 
                                      type="checkbox" 
                                      style={{ width: '18px', height: '18px' }} 
                                      checked={linkForm.esCodeudor}
                                      onChange={e => setLinkForm({...linkForm, esCodeudor: e.target.checked})}
                                    />
                                    Definir como Codeudor
                                 </label>
                              </div>
                           </div>

                           <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Resultados de búsqueda</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 {availableFamily.filter(f => f.name.toLowerCase().includes(familySearch.toLowerCase()) || f.id.includes(familySearch)).length > 0 ? (
                                   availableFamily.filter(f => f.name.toLowerCase().includes(familySearch.toLowerCase()) || f.id.includes(familySearch)).slice(0, 5).map(f => (
                                     <div key={f.id} style={{ padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                           <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{f.name}</div>
                                           <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {f.id} • {f.parentesco || 'Familiar'}</div>
                                        </div>
                                        <button 
                                          onClick={() => handleCreateLink(f)}
                                          className="btn-premium"
                                          style={{ padding: '6px 16px', background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: '800' }}
                                        >
                                          Vincular
                                        </button>
                                     </div>
                                   ))
                                 ) : (
                                   <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>No hay familiares que coincidan con la búsqueda.</div>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', background: '#fafafa', textAlign: 'right' }}>
                           <button onClick={() => setShowLinkModal(false)} style={{ padding: '10px 24px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Cerrar</button>
                        </div>
                     </div>
                   </div>
                 )}
              </div>
            )}
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
                   {MOCK_PAYMENTS.filter((p: any) => p.student === student?.name).map((item: any, idx: number) => (
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
                   {MOCK_PAYMENTS.filter((p: any) => p.student === student?.name).length === 0 && (
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
