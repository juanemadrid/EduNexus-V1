'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import DateRangePicker from '@/components/DateRangePicker';

const ALL_FIELDS = [
  'Código de matrícula', 'Primer nombre',
  'Segundo nombre', 'Primer apellido',
  'Segundo apellido', 'Tipo de identificación',
  'Número de identificación', 'Lugar de expedición del documento',
  'Fecha de nacimiento', 'Lugar de nacimiento',
  'Teléfono', 'Celular',
  'Correo electrónico', 'Dirección',
  'País', 'Lugar de residencia',
  'Barrio', 'Sexo',
  'Estrato', 'Estado civil',
  'Tipo de sangre', 'EPS',
  'ARS', 'Aseguradora',
  'Grupo Sisbén', 'Zona',
  'Nivel de formación', 'Ocupación',
  'Discapacidad', 'Medio de transporte',
  'Multiculturalidad', 'Estado',
  'Tipo de cancelación', 'Fecha de matrícula',
  'Sede', 'Formalizada',
  'Jornada', 'Programa',
  'Grupo', 'Cond. Matrícula',
  'Período', 'Nivel',
  'Usuario', 'Última fecha de actualización',
  'Edad', 'Pertenece al régimen contributivo'
];

export default function EstudiantesExcelPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    fechaMatricula: 'Todas',
    sede: 'Todas',
    programa: 'Todos',
    estado: 'Todos',
    incluir: 'Seleccione',
    incluirPersonalizaciones: false
  });
  
  const [selectedFields, setSelectedFields] = useState<string[]>([...ALL_FIELDS]);

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleExport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reporte de Estudiantes exportado exitosamente.');
    }, 1500);
  };

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
  };

  const labelStyle: React.CSSProperties = { textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' };
  const inputStyle: React.CSSProperties = { width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none' };
  const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Estudiantes
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite exportar a un archivo de Excel la información de los estudiantes, teniendo la posibilidad de seleccionar los campos que requiera en el informe.
          </p>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Fecha de matrícula */}
          <div style={rowStyle}>
            <label style={labelStyle}>Fecha de matrícula</label>
            <div>
              <DateRangePicker 
                value={form.fechaMatricula} 
                onChange={(val: string) => handleChange('fechaMatricula', val)} 
              />
            </div>
          </div>

          {/* Sede */}
          <div style={rowStyle}>
            <label style={labelStyle}>Sede</label>
            <div>
              <select style={inputStyle} value={form.sede} onChange={e => handleChange('sede', e.target.value)}>
                <option value="Todas">Todas</option>
              </select>
            </div>
          </div>

          {/* Programa */}
          <div style={rowStyle}>
            <label style={labelStyle}>Programa</label>
            <div>
              <select style={inputStyle} value={form.programa} onChange={e => handleChange('programa', e.target.value)}>
                <option value="Todos">Todos</option>
              </select>
            </div>
          </div>

          {/* Estado */}
          <div style={rowStyle}>
            <label style={labelStyle}>Estado</label>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              {['Todos', 'Activos', 'Inactivos', 'Cancelados o Retirados'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  <input type="radio" name="estado" value={opt} checked={form.estado === opt} onChange={() => handleChange('estado', opt)} style={{ accentColor: '#10b981', width: '15px', height: '15px' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Incluir */}
          <div style={rowStyle}>
            <label style={labelStyle}>Incluir</label>
            <div>
              <select style={inputStyle} value={form.incluir} onChange={e => handleChange('incluir', e.target.value)}>
                <option value="Seleccione">Seleccione</option>
              </select>
            </div>
          </div>

          {/* Incluir personalizaciones */}
          <div style={{ ...rowStyle, marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <label style={labelStyle}>Incluir personalizaciones</label>
            <div>
              <div
                onClick={() => handleChange('incluirPersonalizaciones', !form.incluirPersonalizaciones)}
                style={{ width: '60px', height: '24px', background: form.incluirPersonalizaciones ? '#10b981' : '#f1f5f9', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: form.incluirPersonalizaciones ? 'flex-end' : 'flex-start', padding: '0 2px', transition: 'background 0.2s' }}
              >
                <div style={{ width: '28px', height: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: form.incluirPersonalizaciones ? '#10b981' : '#64748b' }}>
                  {form.incluirPersonalizaciones ? 'Si' : 'No'}
                </div>
              </div>
            </div>
          </div>

          {/* Campos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Campos</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setSelectedFields([...ALL_FIELDS])} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>✓ Todos</button>
                <button onClick={() => setSelectedFields([])} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>□ Ninguno</button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px' }}>
              {ALL_FIELDS.map(field => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer', padding: '2px 0' }}>
                  <input type="checkbox" checked={selectedFields.includes(field)} onChange={() => toggleField(field)} style={{ accentColor: '#10b981', width: '15px', height: '15px', flexShrink: 0 }} />
                  {field}
                </label>
              ))}
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <button className="btn-premium" style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: '700', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer', border: 'none' }} onClick={handleExport} disabled={isLoading}>
            <FileDown size={18} />
            {isLoading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
