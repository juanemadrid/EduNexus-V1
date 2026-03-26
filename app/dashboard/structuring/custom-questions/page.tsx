'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  HelpCircle, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  Eye,
  EyeOff,
  UserCircle,
  Users,
  Briefcase,
  ChevronRight,
  Settings2,
  Calendar,
  Layers
} from 'lucide-react';

interface CustomQuestion {
  id: string;
  category: 'Estudiante' | 'Docente' | 'Administrativo';
  question: string;
  type: string;
  required: boolean;
  status: 'Activa' | 'Inactiva';
}

const QUESTION_TYPES = ['Texto corto', 'Texto largo', 'Número', 'Fecha', 'Selección única', 'Selección múltiple'];

export default function CustomQuestionsPage() {
  const [questions, setQuestions] = useState<CustomQuestion[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edunexus_custom_questions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'Estudiante' | 'Docente' | 'Administrativo'>('Estudiante');
  const [includeInactive, setIncludeInactive] = useState({
    Estudiante: false,
    Docente: false,
    Administrativo: false
  });
  const [showModal, setShowModal] = useState(false);
  const [modalCategory, setModalCategory] = useState<'Estudiante' | 'Docente' | 'Administrativo'>('Estudiante');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    question: '',
    type: 'Texto corto',
    required: false,
    status: 'Activa' as 'Activa' | 'Inactiva'
  });

  useEffect(() => {
    localStorage.setItem('edunexus_custom_questions', JSON.stringify(questions));
  }, [questions]);

  const handleSave = () => {
    if (!form.question) {
      alert('Por favor ingrese la pregunta.');
      return;
    }

    const newQuestion: CustomQuestion = {
      id: Date.now().toString(),
      category: modalCategory,
      question: form.question,
      type: form.type,
      required: form.required,
      status: form.status
    };

    setQuestions([...questions, newQuestion]);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setForm({ question: '', type: 'Texto corto', required: false, status: 'Activa' });
    }, 1500);
  };

  const getFilteredQuestions = (cat: 'Estudiante' | 'Docente' | 'Administrativo') => {
    return questions.filter(q => {
      const matchesCat = q.category === cat;
      const matchesStatus = includeInactive[cat] ? true : q.status === 'Activa';
      return matchesCat && matchesStatus;
    });
  };

  const Section = ({ title, cat, icon: Icon }: { title: string, cat: 'Estudiante' | 'Docente' | 'Administrativo', icon: any }) => {
    const sectionQuestions = getFilteredQuestions(cat);
    
    return (
      <div className="glass-panel" style={{ padding: '0', marginBottom: '32px', overflow: 'hidden' }}>
        {/* Header Section */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Icon size={24} />
             </div>
             <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{title}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', fontWeight: '500' }}>{sectionQuestions.length} preguntas configuradas</p>
             </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--text-dim)' }}>
                <input 
                  type="checkbox" 
                  checked={includeInactive[cat]}
                  onChange={e => setIncludeInactive({...includeInactive, [cat]: e.target.checked})}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                Incluir inactivos
             </label>
             <button 
               onClick={() => { setModalCategory(cat); setShowModal(true); }}
               style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '750', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
             >
                <Plus size={18} strokeWidth={3} /> Crear pregunta
             </button>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ minHeight: '120px' }}>
          {sectionQuestions.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center' }}>
               <p style={{ color: 'var(--text-dim)', fontSize: '14px', fontWeight: '500' }}>
                 No hay registros en esta categoría, verifique los filtros o <span onClick={() => { setModalCategory(cat); setShowModal(true); }} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>cree una nueva</span>
               </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.01)', borderBottom: '1px solid var(--glass-border)' }}>
                  {['Pregunta', 'Tipo de campo', 'Obligatoria', 'Estado', 'Acciones'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '16px 32px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '800', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sectionQuestions.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{q.question}</span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: '600' }}>
                          <Layers size={14} /> {q.type}
                       </div>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                       <span style={{ color: q.required ? '#dc2626' : 'var(--text-dim)', fontWeight: '750', fontSize: '12px' }}>
                         {q.required ? 'SÍ' : 'NO'}
                       </span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '10px', 
                        fontWeight: '800',
                        background: q.status === 'Activa' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: q.status === 'Activa' ? '#059669' : '#dc2626'
                      }}>
                        {q.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', color: 'var(--text-dim)' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} title="Editar"><Edit size={16} /></button>
                          <button 
                            onClick={() => {
                              if (confirm('¿Eliminar esta pregunta?')) {
                                setQuestions(questions.filter(item => item.id !== q.id));
                              }
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} 
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="heading-premium" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>Preguntas Personalizadas</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', fontWeight: '500', marginTop: '4px' }}>
          Gestión de campos de datos adicionales para perfiles institucionales
        </p>
      </div>

      <Section title="Preguntas personalizadas estudiantes" cat="Estudiante" icon={Users} />
      <Section title="Preguntas personalizadas docentes" cat="Docente" icon={UserCircle} />
      <Section title="Preguntas personalizadas administrativos" cat="Administrativo" icon={Briefcase} />

      {/* Modal Creating Question */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Crear pregunta personalizada</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '13px', fontWeight: '500' }}>Para: <span style={{ textTransform: 'uppercase', textDecoration: 'underline' }}>{modalCategory}S</span></p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                   <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={40} />
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>¡Pregunta Creada!</h3>
                   <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>El campo se ha configurado correctamente.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Pregunta *</label>
                    <input 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px' }} 
                      placeholder="Ej. ¿Tipo de sangre?"
                      value={form.question}
                      onChange={e => setForm({...form, question: e.target.value})}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de respuesta</label>
                    <select 
                      className="input-premium" 
                      style={{ width: '100%', height: '48px', padding: '0 16px' }}
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value})}
                    >
                      {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <input 
                        type="checkbox" 
                        id="required-check"
                        checked={form.required}
                        onChange={e => setForm({...form, required: e.target.checked})}
                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                     />
                     <label htmlFor="required-check" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}>Pregunta obligatoria</label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                    <div style={{ display: 'flex', gap: '24px', height: '40px', alignItems: 'center' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-main)' }}>
                          <input type="radio" checked={form.status === 'Activa'} onChange={() => setForm({...form, status: 'Activa'})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Activa
                       </label>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-main)' }}>
                          <input type="radio" checked={form.status === 'Inactiva'} onChange={() => setForm({...form, status: 'Inactiva'})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Inactiva
                       </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .table-row-hover:hover {
          background: rgba(124, 58, 237, 0.02) !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
