'use client';
import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { FileDown } from 'lucide-react';

const ALL_FIELDS = [
  'Código de matrícula', 'Tipo de documento',
  'Número de identificación', 'Grupo',
  'Primer nombre', 'Segundo nombre',
  'Primer apellido', 'Segundo apellido',
  'Estado', 'E-mail',
  'Celular', 'Municipio dirección',
  'Dirección', 'Sexo',
  'Barrio dirección', 'Estado civil',
  'Estrato', 'EPS',
  'Tipo de sangre', 'Aseguradora',
  'ARS', 'Zona',
  'Grupo étnico', 'Ocupación',
  'Nival de formación', 'Municipio de nacimiento',
  'Fecha de nacimiento', 'Discapacidad',
  'Man. Exp. Documento', 'Multiculturalidad',
  'Medio de transporte', 'Jornada',
  'Sede', 'Período',
  'Programa', 'Última fecha de actualización',
  'Nivel', 'Fecha graduado',
  'Fecha egresado', 'Foto graduado',
  'Acta graduado',
  'Diploma graduado',
];

export default function EgresadosGraduadosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [tipo, setTipo] = useState('Egresado');
  const [filtro, setFiltro] = useState('Fecha');
  const [fechaRango, setFechaRango] = useState('Este mes');
  const [sede, setSede] = useState('Todas');
  const [programa, setPrograma] = useState('Todos');
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
      alert('Reporte de Egresados - Graduados exportado exitosamente.');
    }, 1500);
  };

  const radioStyle = { accentColor: '#10b981', width: '15px', height: '15px' };
  const labelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' };
  const gridRowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' };

  return (
    <DashboardLayout>
      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
            Egresados - Graduados
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Permite exportar a un archivo de Excel la información de los egresados y graduados, teniendo la posibilidad de seleccionar los campos que requiere en el informe.
          </p>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Tipo */}
          <div style={gridRowStyle}>
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Tipo</label>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Egresado', 'Graduado'].map(opt => (
                <label key={opt} style={labelStyle}>
                  <input type="radio" name="tipo" value={opt} checked={tipo === opt} onChange={() => setTipo(opt)} style={radioStyle} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Filtro */}
          <div style={gridRowStyle}>
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Filtro</label>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Fecha', 'Período'].map(opt => (
                <label key={opt} style={labelStyle}>
                  <input type="radio" name="filtro" value={opt} checked={filtro === opt} onChange={() => setFiltro(opt)} style={radioStyle} />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Fechas — only when Filtro = Fecha */}
          {filtro === 'Fecha' && (
            <div style={gridRowStyle}>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Fechas</label>
              <div>
                <DateRangePicker value={fechaRango} onChange={setFechaRango} />
              </div>
            </div>
          )}

          {/* Período — only when Filtro = Período */}
          {filtro === 'Período' && (
            <div style={gridRowStyle}>
              <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Período</label>
              <div>
                <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <option value="2026-01">2026-01</option>
                  <option value="2026-02">2026-02</option>
                </select>
              </div>
            </div>
          )}

          {/* Sede */}
          <div style={gridRowStyle}>
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Sede</label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={sede} onChange={e => setSede(e.target.value)}>
                <option value="Todas">Todas</option>
              </select>
            </div>
          </div>

          {/* Programa */}
          <div style={{ ...gridRowStyle, marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <label style={{ textAlign: 'right', fontSize: '13px', fontWeight: '800', color: '#334155' }}>Programa</label>
            <div>
              <select className="input-premium" style={{ width: '100%', height: '42px', fontSize: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={programa} onChange={e => setPrograma(e.target.value)}>
                <option value="Todos">Todos</option>
              </select>
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
