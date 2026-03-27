'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  FileSpreadsheet,
  Download,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIPOS_IDENTIFICACION, GENEROS, SEDES, JORNADAS } from '@/lib/institutionalParams';

interface ImportRecord {
  id: string;
  name: string;
  email: string;
  status: 'valid' | 'invalid' | 'warning';
  errors: string[];
  originalData: any;
}

function ImportValidationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'students';
  
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [isValidating, setIsValidating] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Simulate reading from a temporary local store or parsing the uploaded file
    // In a real app, we'd parse the CSV/Excel here. 
    // For this demo, let's generate mock records to validate.
    setTimeout(() => {
      const mockData = [
        { id: '1001', name: 'Medina Carolina', email: 'carolinam@gmail.com', gender: 'Femenino', idType: 'CC' },
        { id: '1002', name: 'Zapata Juan Carlos', email: 'juancarlosz@gmail.com', gender: 'Masculino', idType: 'CC' },
        { id: '1001', name: 'Duplicate Record', email: 'error@gmail.com', gender: 'Otro', idType: 'CC' }, // Error: Duplicate ID
        { id: '1004', name: '', email: 'no-name@gmail.com', gender: 'Femenino', idType: 'TI' }, // Error: Missing Name
      ];

      const validated = mockData.map(item => {
        const errors = [];
        if (!item.name) errors.push('El nombre es obligatorio');
        if (!item.id) errors.push('La identificación es obligatoria');
        
        // Check for duplicates in the same batch
        const isDuplicate = mockData.filter(m => m.id === item.id).length > 1;
        if (isDuplicate && item.name === 'Duplicate Record') errors.push('Identificación duplicada en el archivo');

        return {
          id: item.id || 'N/A',
          name: item.name || 'S/N',
          email: item.email || 'S/E',
          status: errors.length > 0 ? 'invalid' : 'valid',
          errors,
          originalData: item
        } as ImportRecord;
      });

      setRecords(validated);
      setIsValidating(false);
    }, 1500);
  }, []);

  const handleImport = () => {
    setIsImporting(true);
    const validOnly = records.filter(r => r.status === 'valid').map(r => ({
      id: r.id,
      name: r.name,
      type: type === 'students' ? 'Estudiante' : 'Docente',
      isActive: true,
      registrationDate: new Date().toISOString(),
      details: r.originalData
    }));

    const key = type === 'students' ? 'edunexus_registered_students' : 'edunexus_registered_teachers';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...existing, ...validOnly]));

    setTimeout(() => {
      setIsImporting(false);
      router.push(`/dashboard/${type}/basic-info`);
    }, 2000);
  };

  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.includes(searchTerm)
  );

  const stats = {
    total: records.length,
    valid: records.filter(r => r.status === 'valid').length,
    invalid: records.filter(r => r.status === 'invalid').length
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                <FileUp size={20} />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>
                Validación de datos: {type === 'students' ? 'Estudiantes' : 'Docentes'}
              </h1>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px', fontWeight: '600' }}>
              Revise la información antes de procesar la importación definitiva.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '12px' }} onClick={() => router.back()}>Cancelar</button>
            <button 
              className="btn-premium" 
              style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: '800' }}
              onClick={handleImport}
              disabled={isImporting || stats.valid === 0}
            >
              {isImporting ? 'Importando...' : `Importar ${stats.valid} registros`}
            </button>
          </div>
        </header>

        {isValidating ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
               <FileSpreadsheet size={48} style={{ color: 'var(--primary)', opacity: 0.5 }} />
             </motion.div>
             <p style={{ marginTop: '20px', fontWeight: '700', color: 'var(--text-dim)' }}>Validando integridad de los datos...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Summary */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <StatCard label="Total registros" value={stats.total} icon={<FileSpreadsheet size={20} />} color="#64748b" />
              <StatCard label="Correctos" value={stats.valid} icon={<CheckCircle2 size={20} />} color="#10b981" />
              <StatCard label="Con errores" value={stats.invalid} icon={<AlertCircle size={20} />} color="#ef4444" />
            </div>

            {/* Toolbar */}
            <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ position: 'relative', width: '320px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input 
                    placeholder="Filtrar registros..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-premium"
                    style={{ paddingLeft: '48px', height: '44px' }}
                  />
               </div>
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Descargar reporte de errores
                  </button>
               </div>
            </div>

            {/* Grid */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(241, 245, 249, 0.5)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '900', color: '#64748b' }}>ESTADO</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '900', color: '#64748b' }}>NOMBRE</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '900', color: '#64748b' }}>IDENTIFICACIÓN</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '900', color: '#64748b' }}>CORREO</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '900', color: '#64748b' }}>OBSERVACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', background: record.status === 'invalid' ? 'rgba(239, 68, 68, 0.02)' : 'transparent' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px', 
                          padding: '4px 10px', borderRadius: '40px', fontSize: '10px', fontWeight: '900',
                          background: record.status === 'valid' ? '#ecfdf5' : '#fef2f2',
                          color: record.status === 'valid' ? 'var(--primary)' : '#ef4444'
                        }}>
                          {record.status === 'valid' ? <Check size={12} /> : <X size={12} />}
                          {record.status === 'valid' ? 'CORRECTO' : 'ERROR'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{record.name}</td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>{record.id}</td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{record.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        {record.errors.map((err, i) => (
                          <div key={i} style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>• {err}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>No hay registros para mostrar.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-premium { width: 100%; height: 48px; border-radius: 14px; border: 1px solid #e2e8f0; padding: 0 16px; outline: none; transition: 0.2s; font-size: 14px; font-weight: 600; }
        .input-premium:focus { border-color: var(--primary); }
      `}</style>
    </DashboardLayout>
  );
}

export default function ImportValidationPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Validando parámetros de importación...</div>}>
      <ImportValidationContent />
    </Suspense>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
       <div style={{ background: `${color}15`, color: color, padding: '12px', borderRadius: '14px' }}>
         {icon}
       </div>
       <div>
         <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
         <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{value}</h3>
       </div>
    </div>
  );
}
