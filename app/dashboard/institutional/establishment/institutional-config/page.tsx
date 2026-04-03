'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PermissionGate from '@/components/PermissionGate';
import { db } from '@/lib/db';
import { 
  Building, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  DollarSign, 
  Shield, 
  BookOpen, 
  CheckCircle,
  Users,
  Settings,
  Target,
  Tag
} from 'lucide-react';
import EduNexusEditor from '@/components/EduNexusEditor';

interface InstitutionalParameters {
  // 1. GESTIÓN FINANCIERA
  interesMora: string;
  penalizacionMora: string;
  obsOrdenesPagoBase: string;
  obsReciboPagoBase: string;
  interesCorriente: string;
  diasGracia: string;
  tipoPenalizacion: 'Una sola vez' | 'Por periodicidad';
  aplicaPenalizacion: boolean;
  aplicaVariacion: boolean;
  aplicaInteresMora: boolean;
  obsComprobanteEgreso: string;
  comentarioFactura: string;
  periodicidadCuotas: string;
  numeroCuotas: string;
  numeroResolucion: string;
  ordenesPeriodo: string;
  fechaResolucion: string;
  pagareCredito: string;
  prefijoNotasAjuste: string;

  // 2. SEGURIDAD
  passMayusculas: boolean;
  passMinusculas: boolean;
  passNumeros: boolean;
  passSimbolos: boolean;
  passLongitudMin: string;

  // 3. GESTIÓN ACADÉMICA
  crearHorarioSinDocente: boolean;
  registroInasistencias: boolean;
  justificacionInasistencias: boolean;
  valorMaxCalificacion: string;
  valorMinCalificacion: string;
  tipoFichaMatricula: 'Con Renovaciones' | 'Sin Renovaciones';
  cupoMaximoCursos: 'Advertencia' | 'No Permitir';
  porcentajeInasistencia: string;
  notaMinAprobacion: string;
  restringirAsistenciaDocentes: boolean;
  obsComprobanteMatricula: string;
  obsFichaMatricula: string;
  establecerCreditosMatricula: 'Por programa' | 'Por nivel';
  procesoGraduacion: boolean;

  // 4. ESTABLECIMIENTO
  razonSocial: string;
  nit: string;
  direccion: string;
  telefono: string;
  paginaWeb: string;
  mensajeLoginEstudiante: string;
  mensajeActivacionCuentaEstudiante: string;
  relacionProductosAcademica: boolean;
  anioLectivoPreinscripcion: string;
  mensajeBienvenida: string;
  lema: string;
  mensajeActivacionCuentaDocenteAdmin: string;
  mensajeLoginDocente: string;

  // 5. PREINSCRIPCIONES
  tituloPreinscripcion: string;
  mensajeBienvenidaPreinscripcion: string;
  mensajeConfirmacionPreinscripcion: string;

  // 6. GESTIÓN COMERCIAL
  oportunidadesEmailUnico: boolean;
  oportunidadesCelularUnico: boolean;

  updatedAt?: string;
}

const defaultParams: InstitutionalParameters = {
  interesMora: '0',
  penalizacionMora: '',
  obsOrdenesPagoBase: '',
  obsReciboPagoBase: '',
  interesCorriente: '0',
  diasGracia: '0',
  tipoPenalizacion: 'Una sola vez',
  aplicaPenalizacion: true,
  aplicaVariacion: false,
  aplicaInteresMora: true,
  obsComprobanteEgreso: '',
  comentarioFactura: '',
  periodicidadCuotas: 'Mensual',
  numeroCuotas: '0',
  numeroResolucion: '04381',
  ordenesPeriodo: '2025-1',
  fechaResolucion: '2009-09-19',
  pagareCredito: '',
  prefijoNotasAjuste: '',
  passMayusculas: false,
  passMinusculas: false,
  passNumeros: false,
  passSimbolos: false,
  passLongitudMin: '0',
  crearHorarioSinDocente: false,
  registroInasistencias: true,
  justificacionInasistencias: true,
  valorMaxCalificacion: '5',
  valorMinCalificacion: '0',
  tipoFichaMatricula: 'Sin Renovaciones',
  cupoMaximoCursos: 'No Permitir',
  porcentajeInasistencia: '30',
  notaMinAprobacion: '3.0',
  restringirAsistenciaDocentes: false,
  obsComprobanteMatricula: '',
  obsFichaMatricula: '',
  establecerCreditosMatricula: 'Por nivel',
  procesoGraduacion: true,
  razonSocial: 'CENTRO DE ESTUDIOS TECNICOS DE LA COSTA LTDA (2022)',
  nit: '',
  direccion: 'CARRERA 37 # 28 - 32 CALLE NARIÑO',
  telefono: '3004551307',
  paginaWeb: 'WWW.TECNISUCRE.EDU.CO',
  mensajeLoginEstudiante: '',
  mensajeActivacionCuentaEstudiante: '',
  relacionProductosAcademica: false,
  anioLectivoPreinscripcion: 'Indefinido',
  mensajeBienvenida: '',
  lema: '',
  mensajeActivacionCuentaDocenteAdmin: '',
  mensajeLoginDocente: '',
  tituloPreinscripcion: 'Preinscripción',
  mensajeBienvenidaPreinscripcion: '',
  mensajeConfirmacionPreinscripcion: '',
  oportunidadesEmailUnico: false,
  oportunidadesCelularUnico: false
};

const SectionHeader = ({ icon: Icon, title, desc, isExpanded, onToggle }: { icon: any, title: string, desc: string, isExpanded: boolean, onToggle: () => void }) => (
  <div 
    onClick={onToggle}
    style={{ 
      padding: '12px 24px', 
      background: isExpanded ? 'var(--primary-glow)' : 'white', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      cursor: 'pointer',
      borderBottom: isExpanded ? '1px solid var(--glass-border)' : 'none'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ 
        width: '38px', height: '38px', borderRadius: '10px', 
        background: isExpanded ? 'white' : 'var(--primary-glow)', 
        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={18} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500' }}>{desc}</p>
      </div>
    </div>
    {isExpanded ? <ChevronUp size={16} color="var(--text-dim)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
  </div>
);

const InputRow = ({ label, desc, children }: { label: string, desc: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', padding: '10px 24px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#334155' }}>{label}</p>
      <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'var(--text-dim)', maxWidth: '90%', lineHeight: '1.4' }}>{desc}</p>
    </div>
    <div style={{ width: '420px' }}>
      {children}
    </div>
  </div>
);

const EditorRow = ({ label, desc, value, onChange }: { label: string, desc: string, value: string, onChange: (v: string) => void }) => (
  <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ marginBottom: '12px' }}>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#334155' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.4' }}>{desc}</p>
    </div>
    <EduNexusEditor value={value} onChange={onChange} height="200px" />
  </div>
);

const Switch = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
  <div 
    onClick={() => onChange(!value)}
    style={{ 
      width: '46px', height: '24px', borderRadius: '50px', 
      background: value ? 'var(--primary)' : '#e2e8f0', 
      padding: '2px', cursor: 'pointer', display: 'flex', 
      justifyContent: value ? 'flex-end' : 'flex-start',
      transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
    }}
  >
    <div style={{ 
      width: '20px', height: '20px', borderRadius: '50%', background: 'white', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: '7.5px', fontWeight: '900', color: value ? 'var(--primary)' : '#94a3b8',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    }}>
      {value ? 'SI' : 'NO'}
    </div>
  </div>
);

export default function InstitutionalConfigPage() {
  const [params, setParams] = useState<InstitutionalParameters>(defaultParams);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('financiera');

  useEffect(() => {
    const loadParams = async () => {
      setIsLoading(true);
      try {
        const data = await db.get<InstitutionalParameters>('settings', 'institutional_parameters');
        if (data) {
          setParams({ ...defaultParams, ...data });
        }
      } catch (error) {
        console.error("Error loading institutional parameters:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadParams();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.update('settings', 'institutional_parameters', { ...params, updatedAt: new Date().toISOString() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving institutional parameters:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PermissionGate permissionId="inst_esta_config">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 className="heading-premium" style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>Parámetros Institución</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontWeight: '500' }}>
              Gestión de parámetros y configuraciones globales para el funcionamiento del sistema.
            </p>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontSize: '12px' }}>
            {isSaving ? 'Guardando...' : success ? <CheckCircle size={16} /> : <Save size={16} />} 
            {success ? 'Sincronizado' : 'Guardar cambios'}
          </button>
        </div>

        {isLoading ? <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', fontWeight: '600' }}>Sincronizando con el servidor...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* 1. GESTIÓN FINANCIERA */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader icon={DollarSign} title="Gestión Financiera" desc="Configuración de intereses, penalizaciones y aspectos contables." isExpanded={expandedSection === 'financiera'} onToggle={() => setExpandedSection(expandedSection === 'financiera' ? null : 'financiera')} />
              {expandedSection === 'financiera' && (
                <div style={{ background: 'white' }}>
                  <InputRow label="Interés mora" desc="Permite establecer el interés que se cobrará por mora.">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.interesMora} onChange={e => setParams({...params, interesMora: e.target.value})} />
                  </InputRow>
                  <InputRow label="Penalización por mora" desc="Permite definir el valor que se cobrará por los días de mora.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.penalizacionMora} onChange={e => setParams({...params, penalizacionMora: e.target.value})} />
                  </InputRow>
                  <InputRow label="Observaciones órdenes pagos" desc="Observaciones de las órdenes de pagos.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.obsOrdenesPagoBase} onChange={e => setParams({...params, obsOrdenesPagoBase: e.target.value})} />
                  </InputRow>
                  <InputRow label="Observación para el recibo de pago" desc="Permite definir la observación que se verá reflejada en el recibo de pago.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.obsReciboPagoBase} onChange={e => setParams({...params, obsReciboPagoBase: e.target.value})} />
                  </InputRow>
                  <InputRow label="Interés corriente" desc="Permite establecer el porcentaje de interés corriente que se cobrará en los créditos.">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.interesCorriente} onChange={e => setParams({...params, interesCorriente: e.target.value})} />
                  </InputRow>
                  <InputRow label="Días de gracia" desc="Permite determinar la cantidad de días de gracia que se otorgará pasadas las fechas de pago programadas.">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.diasGracia} onChange={e => setParams({...params, diasGracia: e.target.value})} />
                  </InputRow>
                  <InputRow label="Tipo de penalización" desc="permite definir qué tipo de cobro por penalización manejará la institución.">
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {['Una sola vez', 'Por periodicidad'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>
                          <input type="radio" checked={params.tipoPenalizacion === opt} onChange={() => setParams({...params, tipoPenalizacion: opt as any})} /> {opt}
                        </label>
                      ))}
                    </div>
                  </InputRow>
                  <InputRow label="¿Aplica penalización?" desc="Permite seleccionar si la institución habilitará el uso de penalización en los pagos.">
                    <Switch value={params.aplicaPenalizacion} onChange={v => setParams({...params, aplicaPenalizacion: v})} />
                  </InputRow>
                  <InputRow label="¿Aplica variación?" desc="Permite seleccionar si se aplicará variación en los planes de pago.">
                    <Switch value={params.aplicaVariacion} onChange={v => setParams({...params, aplicaVariacion: v})} />
                  </InputRow>
                  <InputRow label="¿Aplica interés por mora?" desc="Permite seleccionar si se habilitará el uso de interés por mora.">
                    <Switch value={params.aplicaInteresMora} onChange={v => setParams({...params, aplicaInteresMora: v})} />
                  </InputRow>
                  <InputRow label="Observación del comprobante de egreso" desc="Establecer la observación que aplicará para el comprobante de egreso">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.obsComprobanteEgreso} onChange={e => setParams({...params, obsComprobanteEgreso: e.target.value})} />
                  </InputRow>
                  <InputRow label="Comentario de la factura" desc="Establecer un comentario que se visualizará en las facturas generadas.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.comentarioFactura} onChange={e => setParams({...params, comentarioFactura: e.target.value})} />
                  </InputRow>
                  <InputRow label="Periodicidad de cuotas" desc="Permite seleccionar la periodicidad de las cuotas con las cuales se registrarán los créditos.">
                    <select className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.periodicidadCuotas} onChange={e => setParams({...params, periodicidadCuotas: e.target.value})}>
                      <option>Mensual</option><option>Bimestral</option><option>Semestral</option>
                    </select>
                  </InputRow>
                  <InputRow label="Número de cuotas" desc="Permite establecer el número de cuotas que tendrán por defecto los créditos">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.numeroCuotas} onChange={e => setParams({...params, numeroCuotas: e.target.value})} />
                  </InputRow>
                  <InputRow label="Número resolución institucional" desc="Establecer el número de resolución con el que cuenta la institución.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.numeroResolucion} onChange={e => setParams({...params, numeroResolucion: e.target.value})} />
                  </InputRow>
                  <InputRow label="Ordenes : periodo" desc="Permite saber cuál es el periodo de la orden de pago">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.ordenesPeriodo} onChange={e => setParams({...params, ordenesPeriodo: e.target.value})} />
                  </InputRow>
                  <InputRow label="Fecha resolución institucional" desc="Establecer la fecha de resolución institucional.">
                    <input type="date" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.fechaResolucion} onChange={e => setParams({...params, fechaResolucion: e.target.value})} />
                  </InputRow>
                  <InputRow label="Prefijo para notas de ajuste" desc="Permite definir el prefijo que utilizarán las notas de ajuste en la numeración.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.prefijoNotasAjuste} onChange={e => setParams({...params, prefijoNotasAjuste: e.target.value})} />
                  </InputRow>
                  <EditorRow label="Pagaré del crédito" desc="En este parámetro se ingresa la plantilla del pagaré del crédito." value={params.pagareCredito} onChange={v => setParams({...params, pagareCredito: v})} />
                </div>
              )}
            </div>

            {/* 2. SEGURIDAD */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader icon={Shield} title="Seguridad" desc="Control de políticas de contraseñas y accesos." isExpanded={expandedSection === 'seguridad'} onToggle={() => setExpandedSection(expandedSection === 'seguridad' ? null : 'seguridad')} />
              {expandedSection === 'seguridad' && (
                <div style={{ background: 'white' }}>
                  <InputRow label="Contraseña requiere mayúsculas" desc="Permite saber si la contraseña requiere mayúsculas">
                    <Switch value={params.passMayusculas} onChange={v => setParams({...params, passMayusculas: v})} />
                  </InputRow>
                  <InputRow label="Contraseña requiere minúsculas" desc="Permite saber si la contraseña requiere minúsculas">
                    <Switch value={params.passMinusculas} onChange={v => setParams({...params, passMinusculas: v})} />
                  </InputRow>
                  <InputRow label="Contraseña requiere números" desc="Permite saber si la contraseña requiere números">
                    <Switch value={params.passNumeros} onChange={v => setParams({...params, passNumeros: v})} />
                  </InputRow>
                  <InputRow label="Contraseña requiere símbolos" desc="Permite saber si la contraseña requiere símbolos">
                    <Switch value={params.passSimbolos} onChange={v => setParams({...params, passSimbolos: v})} />
                  </InputRow>
                  <InputRow label="Contraseña requiere longitud mínima" desc="Permite indicar cuál es la cantidad mínima para las contraseñas.">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.passLongitudMin} onChange={e => setParams({...params, passLongitudMin: e.target.value})} />
                  </InputRow>
                </div>
              )}
            </div>

            {/* 3. GESTIÓN ACADÉMICA */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader icon={BookOpen} title="Gestión Académica" desc="Reglas de evaluación, asistencia y cupos." isExpanded={expandedSection === 'academica'} onToggle={() => setExpandedSection(expandedSection === 'academica' ? null : 'academica')} />
              {expandedSection === 'academica' && (
                <div style={{ background: 'white' }}>
                  <InputRow label="Creación horario para aulas virtual sin docente relacionado" desc="Permite crear horarios en aulas virtuales sin un docente asignado al curso">
                    <Switch value={params.crearHorarioSinDocente} onChange={v => setParams({...params, crearHorarioSinDocente: v})} />
                  </InputRow>
                  <InputRow label="Registro de inasistencias" desc="Permite definir si el registro de inasistencias se ingresará con base en el horario asignado al curso.">
                    <Switch value={params.registroInasistencias} onChange={v => setParams({...params, registroInasistencias: v})} />
                  </InputRow>
                  <InputRow label="Justificación de inasistencias" desc="Permite establecer si se habilitará el ingreso de justificaciones al momento de registrar la inasistencia.">
                    <Switch value={params.justificacionInasistencias} onChange={v => setParams({...params, justificacionInasistencias: v})} />
                  </InputRow>
                  <InputRow label="Valor máximo de calificación" desc="Permite establecer cuál será el valor máximo que se podrá ingresar al momento de calificar.">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.valorMaxCalificacion} onChange={e => setParams({...params, valorMaxCalificacion: e.target.value})} />
                  </InputRow>
                  <InputRow label="Valor mínimo de calificación" desc="Permite establecer cuál será el valor mínimo que se podrá ingresar al momento de calificar.">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.valorMinCalificacion} onChange={e => setParams({...params, valorMinCalificacion: e.target.value})} />
                  </InputRow>
                  <InputRow label="Tipo de ficha de matrícula" desc="Seleccionar el tipo de ficha de matrícula que usará la institución.">
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {['Con Renovaciones', 'Sin Renovaciones'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>
                          <input type="radio" checked={params.tipoFichaMatricula === opt} onChange={() => setParams({...params, tipoFichaMatricula: opt as any})} /> {opt}
                        </label>
                      ))}
                    </div>
                  </InputRow>
                  <InputRow label="Cupo máximo en los cursos" desc="Permite establecer que acción se realizará al momento que el curso haya alcanzado su cupo máximo.">
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {['Advertencia', 'No Permitir'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>
                          <input type="radio" checked={params.cupoMaximoCursos === opt} onChange={() => setParams({...params, cupoMaximoCursos: opt as any})} /> {opt}
                        </label>
                      ))}
                    </div>
                  </InputRow>
                  <InputRow label="Porcentaje de inasistencia" desc="Permite definir cuál será el porcentaje de inasistencia con el que un estudiante perderá la asignatura.">
                    <input type="number" className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.porcentajeInasistencia} onChange={e => setParams({...params, porcentajeInasistencia: e.target.value})} />
                  </InputRow>
                  <InputRow label="Nota mínima de aprobación" desc="Permite definir cuál será la nota mínima con la que un estudiante aprobará la asignatura.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.notaMinAprobacion} onChange={e => setParams({...params, notaMinAprobacion: e.target.value})} />
                  </InputRow>
                  <InputRow label="Restringir registro de asistencia a docentes" desc="Deshabilita el ingreso de asistencia detallado a docentes.">
                    <Switch value={params.restringirAsistenciaDocentes} onChange={v => setParams({...params, restringirAsistenciaDocentes: v})} />
                  </InputRow>
                  <InputRow label="¿Cómo establecer los créditos disponibles para permitir matricularle los cursos al estudiante?" desc="Permite establecer si la cantidad de créditos disponibles de un estudiante al momento de matricularle a un curso será definida por el nivel o será fija por el programa.">
                     <div style={{ display: 'flex', gap: '20px' }}>
                      {['Por programa', 'Por nivel'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>
                          <input type="radio" checked={params.establecerCreditosMatricula === opt} onChange={() => setParams({...params, establecerCreditosMatricula: opt as any})} /> {opt}
                        </label>
                      ))}
                    </div>
                  </InputRow>
                  <EditorRow label="Observación comprobante de matrícula" desc="Permite definir la observación que se verá reflejada en el comprobante de matrícula." value={params.obsComprobanteMatricula} onChange={v => setParams({...params, obsComprobanteMatricula: v})} />
                  <EditorRow label="Observación ficha de matrícula" desc="Permite definir la observación que se verá reflejada en la ficha de matrícula de los estudiantes." value={params.obsFichaMatricula} onChange={v => setParams({...params, obsFichaMatricula: v})} />
                  <InputRow label="Proceso de graduación" desc="Permite saber si la institución maneja el proceso de graduación.">
                    <Switch value={params.procesoGraduacion} onChange={v => setParams({...params, procesoGraduacion: v})} />
                  </InputRow>
                </div>
              )}
            </div>

            {/* 4. ESTABLECIMIENTO */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader icon={Building} title="Establecimiento" desc="Datos de identidad legal y plantillas de comunicación." isExpanded={expandedSection === 'establecimiento'} onToggle={() => setExpandedSection(expandedSection === 'establecimiento' ? null : 'establecimiento')} />
              {expandedSection === 'establecimiento' && (
                <div style={{ background: 'white' }}>
                  <InputRow label="Razón social" desc="Establecer la razón social de la institución.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.razonSocial} onChange={e => setParams({...params, razonSocial: e.target.value})} />
                  </InputRow>
                  <InputRow label="NIT" desc="Establecer el NIT de la institución.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.nit} onChange={e => setParams({...params, nit: e.target.value})} />
                  </InputRow>
                  <InputRow label="Dirección" desc="Establecer la dirección actual de la institución.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.direccion} onChange={e => setParams({...params, direccion: e.target.value})} />
                  </InputRow>
                  <InputRow label="Teléfono" desc="Establecer el número telefónico de la institución.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.telefono} onChange={e => setParams({...params, telefono: e.target.value})} />
                  </InputRow>
                  <InputRow label="Página web" desc="Establecer la página web de la institución.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.paginaWeb} onChange={e => setParams({...params, paginaWeb: e.target.value})} />
                  </InputRow>
                  <EditorRow label="Mensaje en la página principal del estudiante" desc="Definir el mensaje que aparecerá a los estudiantes al iniciar sesión en la plataforma." value={params.mensajeLoginEstudiante} onChange={v => setParams({...params, mensajeLoginEstudiante: v})} />
                  <EditorRow label="Mensaje activación cuenta estudiante" desc="Establecer el mensaje que se le enviará al estudiante una vez se le cree la cuenta de usuario." value={params.mensajeActivacionCuentaEstudiante} onChange={v => setParams({...params, mensajeActivacionCuentaEstudiante: v})} />
                  <InputRow label="Relación de productos con la gestión académica" desc="Permite definir si existirá relación entre el producto y el programa o asignatura.">
                    <Switch value={params.relacionProductosAcademica} onChange={v => setParams({...params, relacionProductosAcademica: v})} />
                  </InputRow>
                  <InputRow label="Año lectivo para la preinscripción" desc="Permite seleccionar el año lectivo que se tendrá en cuenta para generar la orden de pago por concepto de inscripción en la preinscripción.">
                    <select className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.anioLectivoPreinscripcion} onChange={e => setParams({...params, anioLectivoPreinscripcion: e.target.value})}>
                      <option>Indefinido</option><option>2024</option><option>2025</option>
                    </select>
                  </InputRow>
                  <EditorRow label="Mensaje de bienvenida" desc="Establecer el mensaje de bienvenida." value={params.mensajeBienvenida} onChange={v => setParams({...params, mensajeBienvenida: v})} />
                  <InputRow label="Lema" desc="Establecer el lema de la institución.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.lema} onChange={e => setParams({...params, lema: e.target.value})} />
                  </InputRow>
                  <EditorRow label="Mensaje activación cuenta docente o administrativo" desc="Establecer el mensaje que se le enviará al docente o al administrativo una vez se le cree la cuenta de usuario" value={params.mensajeActivacionCuentaDocenteAdmin} onChange={v => setParams({...params, mensajeActivacionCuentaDocenteAdmin: v})} />
                  <EditorRow label="Mensaje en la página principal del docente" desc="Permite definir el mensaje que se mostrará a los docentes al iniciar sesión en la plataforma." value={params.mensajeLoginDocente} onChange={v => setParams({...params, mensajeLoginDocente: v})} />
                </div>
              )}
            </div>

            {/* 5. PREINSCRIPCIONES */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader icon={Users} title="Preinscripciones" desc="Configuración de inscripciones públicas y seguimiento." isExpanded={expandedSection === 'preinscripciones'} onToggle={() => setExpandedSection(expandedSection === 'preinscripciones' ? null : 'preinscripciones')} />
              {expandedSection === 'preinscripciones' && (
                <div style={{ background: 'white' }}>
                  <InputRow label="Título de preinscripción" desc="Establecer el título que se verá reflejado al momento de realizar una preinscripción.">
                    <input className="input-premium" style={{ height: '36px', fontSize: '13px' }} value={params.tituloPreinscripcion} onChange={e => setParams({...params, tituloPreinscripcion: e.target.value})} />
                  </InputRow>
                  <EditorRow label="Mensaje de bienvenida en preinscripción" desc="Permite definir el mensaje de bienvenida que tendrá la preinscripción." value={params.mensajeBienvenidaPreinscripcion} onChange={v => setParams({...params, mensajeBienvenidaPreinscripcion: v})} />
                  <EditorRow label="Mensaje de confirmación en la preinscripción" desc="Permite establecer el texto que se verá reflejado al confirmar la preinscripción." value={params.mensajeConfirmacionPreinscripcion} onChange={v => setParams({...params, mensajeConfirmacionPreinscripcion: v})} />
                </div>
              )}
            </div>

             {/* 6. GESTIÓN COMERCIAL */}
             <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader icon={Target} title="Gestión Comercial" desc="Seguimiento de oportunidades y CRM institucional." isExpanded={expandedSection === 'comercial'} onToggle={() => setExpandedSection(expandedSection === 'comercial' ? null : 'comercial')} />
              {expandedSection === 'comercial' && (
                <div style={{ background: 'white' }}>
                  <InputRow label="Oportunidades con correo único" desc="Permite definir si se restringirá la creación de oportunidades cuando el correo electrónico ingresado pertenezca a otra oportunidad.">
                    <Switch value={params.oportunidadesEmailUnico} onChange={v => setParams({...params, oportunidadesEmailUnico: v})} />
                  </InputRow>
                  <InputRow label="Oportunidades con celular único" desc="Permite definir si se restringirá la creación de oportunidades cuando el celular ingresado pertenezca a otra oportunidad.">
                    <Switch value={params.oportunidadesCelularUnico} onChange={v => setParams({...params, oportunidadesCelularUnico: v})} />
                  </InputRow>
                </div>
              )}
            </div>

          </div>
        )}
      </PermissionGate>

      <style jsx global>{`
        .input-premium:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--primary-glow) !important;
          background: white !important;
        }
        .btn-premium:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        select.input-premium {
          padding-left: 12px;
          cursor: pointer;
        }
      `}</style>
    </DashboardLayout>
  );
}
