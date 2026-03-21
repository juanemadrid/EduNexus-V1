'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';

const ALL_FIELDS = [
  'Tipo de identificación', 'Número de identificación',
  'Primer nombre', 'Segundo nombre',
  'Primer apellido', 'Segundo apellido',
  'Teléfono', 'Celular',
  'Correo electrónico', 'Dirección',
  'País', 'Lugar de residencia',
  'Barrio', 'Fecha de nacimiento',
  'Lugar de expedición del documento', 'Fecha de expedición de documento',
  'Sexo', 'Lugar de nacimiento',
  'Tipo de sangre', 'Escalafón',
  'Estado civil', 'Calidad de desempeño',
  'Estado', 'Fecha de ingreso',
  'Fecha de retiro', 'Tiempo laboral',
  'Tipo de vinculación', 'Origen vinculación',
  'Correo institucional', 'Título recibido',
  'Nivel académico', 'Especialidad',
  'Fuente de recursos', 'Salario',
  'Usuario',
];

export default function DocentesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [estado, setEstado] = useState('Todos');
  const [incluirPersonal, setIncluirPersonal] = useState(false);
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
      alert('Reporte de Docentes exportado exitosamente.');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Docentes
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite exportar a un archivo de Excel la información de los docentes registrados en la plataforma, teniendo la posibilidad de seleccionar los campos que requiera en el informe.
          </p>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Estado */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Estado</label>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              {['Todos', 'Activos', 'Inactivos'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  <input type="radio" name="estado" value={opt} checked={estado === opt} onChange={() => setEstado(opt)} style={{ accentColor: '#10b981', width: '15px', height: '15px' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Incluir personalizaciones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Incluir personalizaciones</label>
            <div>
              <div
                onClick={() => setIncluirPersonal(p => !p)}
                style={{ width: '60px', height: '24px', background: incluirPersonal ? '#10b981' : '#f1f5f9', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: incluirPersonal ? 'flex-end' : 'flex-start', padding: '0 2px', transition: 'background 0.2s' }}
              >
                <div style={{ width: '28px', height: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: incluirPersonal ? '#10b981' : '#64748b' }}>
                  {incluirPersonal ? 'Si' : 'No'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px' }}>
              {ALL_FIELDS.map(field => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer', padding: '4px 0' }}>
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
