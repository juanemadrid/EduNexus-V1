'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const DEMO_PROGRAMS = [
  {
    id: 'prog-001', codigo: 'TECL-001', nombre: 'TÉCNICO LABORAL EN SISTEMAS E INFORMÁTICA',
    tipoEvaluacion: 'Cuantitativo', categoria: 'Técnico', estado: 'Activo',
    preinscripciones: 'Sí', grupos: 'Sí', notaAprobacion: '3.5', valorMaximo: '5.0', porcentajeInasistencia: '30',
    pensumSubjects: [
      { id: 'ps-1', subjectId: 's-10', codigo: '07ATEN', nombre: 'ATENCION Y SERVICIO AL CLIENTE', nivel: 'Bimestre N° 1', creditos: '3', ihSemanal: '4', ihTotal: '32' },
      { id: 'ps-2', subjectId: 's-12', codigo: '153', nombre: 'BASES DE DATOS', nivel: 'Bimestre N° 1', creditos: '4', ihSemanal: '6', ihTotal: '48' },
      { id: 'ps-3', subjectId: 's-1', codigo: '96', nombre: 'ACTIVIDADES, RECREO DEPORTIVAS Y ACUATICAS', nivel: 'Bimestre N° 2', creditos: '2', ihSemanal: '3', ihTotal: '24' },
    ]
  },
  {
    id: 'prog-002', codigo: 'AENF-001', nombre: 'AUXILIAR DE ENFERMERÍA',
    tipoEvaluacion: 'Cuantitativo', categoria: 'Técnico', estado: 'Activo',
    preinscripciones: 'Sí', grupos: 'Sí', notaAprobacion: '3.0', valorMaximo: '5.0', porcentajeInasistencia: '20',
    pensumSubjects: [
      { id: 'ps-4', subjectId: 's-2', codigo: '21 AMC', nombre: 'ADM. DE MEDICAMENTOS Y CARDEX', nivel: 'Bimestre N° 1', creditos: '4', ihSemanal: '6', ihTotal: '48' },
      { id: 'ps-5', subjectId: 's-9', codigo: '14 ANAT', nombre: 'ANATOMIA Y FISIOLOGIA DEL PACIENTE', nivel: 'Bimestre N° 1', creditos: '3', ihSemanal: '4', ihTotal: '32' },
      { id: 'ps-6', subjectId: 's-4', codigo: '26 ADM', nombre: 'ADMINISTRACION DE MEDICAMENTOS', nivel: 'Bimestre N° 2', creditos: '4', ihSemanal: '6', ihTotal: '48' },
    ]
  },
  {
    id: 'prog-003', codigo: 'ADMN-001', nombre: 'TÉCNICO AUXILIAR CONTABLE Y ADMINISTRATIVO',
    tipoEvaluacion: 'Cuantitativo', categoria: 'Técnico', estado: 'Activo',
    preinscripciones: 'No', grupos: 'Sí', notaAprobacion: '3.0', valorMaximo: '5.0', porcentajeInasistencia: '30',
    pensumSubjects: [
      { id: 'ps-7', subjectId: 's-6', codigo: '44', nombre: 'AFILIACION EN EL SISTEMA DE SALUD', nivel: 'Bimestre N° 1', creditos: '2', ihSemanal: '3', ihTotal: '24' },
      { id: 'ps-8', subjectId: 's-10', codigo: '07ATEN', nombre: 'ATENCION Y SERVICIO AL CLIENTE', nivel: 'Bimestre N° 2', creditos: '3', ihSemanal: '4', ihTotal: '32' },
    ]
  },
];

const DEMO_SUBJECTS = [
  { id: 's-1', codigo: '96', nombre: 'ACTIVIDADES, RECREO DEPORTIVAS Y ACUATICAS', abreviacion: 'ARDA', estado: 'Activa' },
  { id: 's-2', codigo: '21 AMC', nombre: 'ADM. DE MEDICAMENTOS Y CARDEX', abreviacion: 'ADMON MED', estado: 'Activa' },
  { id: 's-3', codigo: '101', nombre: 'ADMINISTRACION Y ORGANIZACION DE EVENTOS', abreviacion: 'AOE', estado: 'Activa' },
  { id: 's-4', codigo: '26 ADM', nombre: 'ADMINISTRACION DE MEDICAMENTOS', abreviacion: 'ADMON MED', estado: 'Activa' },
  { id: 's-5', codigo: '06ADM', nombre: 'ADMISION AL USUARIO', abreviacion: 'ADM USUA', estado: 'Activa' },
  { id: 's-6', codigo: '44', nombre: 'AFILIACION EN EL SISTEMA DE SALUD', abreviacion: 'ASD', estado: 'Activa' },
  { id: 's-7', codigo: '49', nombre: 'AFILIACION SISTEMA PENSION, ARL Y PREPAG', abreviacion: 'ASPPAPRCS', estado: 'Activa' },
  { id: 's-8', codigo: '150', nombre: 'ANATOMIA Y FISIOLOGIA ANIMAL', abreviacion: 'AFI', estado: 'Activa' },
  { id: 's-9', codigo: '14 ANAT', nombre: 'ANATOMIA Y FISIOLOGIA DEL PACIENTE', abreviacion: 'FISIO PAC', estado: 'Activa' },
  { id: 's-10', codigo: '07ATEN', nombre: 'ATENCION Y SERVICIO AL CLIENTE', abreviacion: 'ATEN CLIEN', estado: 'Activa' },
  { id: 's-11', codigo: '67', nombre: 'ATENCION AL CLIENTE Y CALIDAD', abreviacion: 'ASC', estado: 'Activa' },
  { id: 's-12', codigo: '153', nombre: 'BASES DE DATOS', abreviacion: 'BD', estado: 'Activa' },
  { id: 's-13', codigo: '155', nombre: 'REDES Y COMUNICACIONES', abreviacion: 'RC', estado: 'Activa' },
  { id: 's-14', codigo: '160', nombre: 'PROGRAMACION BASICA', abreviacion: 'PROG', estado: 'Activa' },
  { id: 's-15', codigo: '170', nombre: 'ETICA Y VALORES PROFESIONALES', abreviacion: 'EVP', estado: 'Activa' },
];

const DEMO_TEACHERS = [
  {
    id: 't-001', nombres: 'Carlos Alberto', apellidos: 'Ramírez Torres', email: 'c.ramirez@corptech.edu.co',
    telefono: '3001234567', documento: '79456123', tipoDocumento: 'CC',
    especialidad: 'Sistemas e Informática', estado: 'Activo'
  },
  {
    id: 't-002', nombres: 'María Isabel', apellidos: 'Herrera Quintero', email: 'm.herrera@corptech.edu.co',
    telefono: '3107654321', documento: '43218765', tipoDocumento: 'CC',
    especialidad: 'Ciencias de la Salud', estado: 'Activo'
  },
  {
    id: 't-003', nombres: 'Jorge Luis', apellidos: 'Ospina Morales', email: 'j.ospina@corptech.edu.co',
    telefono: '3209876543', documento: '70123456', tipoDocumento: 'CC',
    especialidad: 'Administración y Contabilidad', estado: 'Activo'
  },
];

const DEMO_STUDENTS = [
  {
    id: 'est-001', nombres: 'Maria Fernanda', apellidos: 'González Pérez',
    tipoDocumento: 'CC', documento: '1023456789', email: 'mfgonzalez@gmail.com',
    telefono: '3115678901', programa: 'TÉCNICO LABORAL EN SISTEMAS E INFORMÁTICA',
    estado: 'Activo', fechaIngreso: '2025-01-15'
  },
  {
    id: 'est-002', nombres: 'Alejandro', apellidos: 'Ríos Martínez',
    tipoDocumento: 'CC', documento: '1098765432', email: 'a.rios@gmail.com',
    telefono: '3125432109', programa: 'AUXILIAR DE ENFERMERÍA',
    estado: 'Activo', fechaIngreso: '2025-01-15'
  },
  {
    id: 'est-003', nombres: 'Laura Sofía', apellidos: 'Mendoza Vargas',
    tipoDocumento: 'CC', documento: '1034512678', email: 'lmendoza@hotmail.com',
    telefono: '3135678901', programa: 'TÉCNICO AUXILIAR CONTABLE Y ADMINISTRATIVO',
    estado: 'Activo', fechaIngreso: '2025-02-01'
  },
  {
    id: 'est-004', nombres: 'Juan Pablo', apellidos: 'Cárdenas Torres',
    tipoDocumento: 'TI', documento: '987654321', email: 'jcardenas@gmail.com',
    telefono: '3145678901', programa: 'TÉCNICO LABORAL EN SISTEMAS E INFORMÁTICA',
    estado: 'Activo', fechaIngreso: '2025-02-10'
  },
  {
    id: 'est-005', nombres: 'Valentina', apellidos: 'Duque Sierra',
    tipoDocumento: 'CC', documento: '1045678901', email: 'vduque@gmail.com',
    telefono: '3155556789', programa: 'AUXILIAR DE ENFERMERÍA',
    estado: 'Activo', fechaIngreso: '2025-03-01'
  },
];

export default function DemoInitPage() {
  const router = useRouter();
  const [steps, setSteps] = useState([
    { label: 'Cargando asignaturas (15 materias técnicas)', status: 'pending' },
    { label: 'Cargando 3 programas técnicos laborales con Pensum', status: 'pending' },
    { label: 'Cargando 3 docentes especializados', status: 'pending' },
    { label: 'Cargando 5 estudiantes matriculados', status: 'pending' },
    { label: 'Configuración institucional corporativa', status: 'pending' },
  ]);
  const [done, setDone] = useState(false);

  const updateStep = (i: number, status: string) => {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status } : s));
  };

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 500));
      updateStep(0, 'loading');
      localStorage.setItem('edunexus_academic_subjects', JSON.stringify(DEMO_SUBJECTS));
      updateStep(0, 'done');

      await new Promise(r => setTimeout(r, 600));
      updateStep(1, 'loading');
      localStorage.setItem('edunexus_academic_programs', JSON.stringify(DEMO_PROGRAMS));
      updateStep(1, 'done');

      await new Promise(r => setTimeout(r, 600));
      updateStep(2, 'loading');
      localStorage.setItem('edunexus_teachers', JSON.stringify(DEMO_TEACHERS));
      updateStep(2, 'done');

      await new Promise(r => setTimeout(r, 600));
      updateStep(3, 'loading');
      localStorage.setItem('edunexus_students', JSON.stringify(DEMO_STUDENTS));
      updateStep(3, 'done');

      await new Promise(r => setTimeout(r, 600));
      updateStep(4, 'loading');
      localStorage.setItem('edunexus_institution_name', 'CORPORACIÓN TÉCNICA LABORAL Y DEL CONOCIMIENTO');
      localStorage.setItem('edunexus_institution_nit', '900.456.123-4');
      updateStep(4, 'done');

      await new Promise(r => setTimeout(r, 800));
      setDone(true);
    };
    run();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        padding: '48px', maxWidth: '600px', width: '100%', textAlign: 'center'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px auto', fontSize: '32px'
        }}>🏫</div>

        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '900', marginBottom: '8px' }}>
          CORPORACIÓN TÉCNICA LABORAL
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '40px' }}>
          Cargando datos de simulación en EduNexus...
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '40px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px', borderRadius: '12px',
              background: step.status === 'done' ? 'rgba(16,185,129,0.1)' : 
                          step.status === 'loading' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${step.status === 'done' ? 'rgba(16,185,129,0.3)' : step.status === 'loading' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`
            }}>
              {step.status === 'done' ? <CheckCircle size={22} color="#10b981" /> :
               step.status === 'loading' ? <Loader2 size={22} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} /> :
               <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #334155' }} />}
              <span style={{
                color: step.status === 'done' ? '#10b981' : step.status === 'loading' ? '#a5b4fc' : '#64748b',
                fontSize: '14px', fontWeight: step.status !== 'pending' ? '700' : '400'
              }}>{step.label}</span>
            </div>
          ))}
        </div>

        {done && (
          <div>
            <div style={{
              padding: '20px', borderRadius: '16px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              marginBottom: '24px'
            }}>
              <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#10b981', fontWeight: '800', fontSize: '16px', margin: '0 0 4px' }}>
                ¡Simulación lista!
              </p>
              <p style={{ color: '#6ee7b7', fontSize: '13px', margin: 0 }}>
                Todos los datos han sido cargados correctamente
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => router.push('/dashboard')} style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px'
              }}>
                🏠 Ver Dashboard
              </button>
              <button onClick={() => router.push('/dashboard/academic/structuring/programs')} style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px'
              }}>
                📚 Ver Programas
              </button>
              <button onClick={() => router.push('/dashboard/institutional/students/basic-info')} style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px'
              }}>
                👨‍🎓 Ver Estudiantes
              </button>
              <button onClick={() => router.push('/dashboard/institutional/teachers/basic-info')} style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px'
              }}>
                👨‍🏫 Ver Docentes
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
