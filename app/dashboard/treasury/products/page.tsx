'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Download, ChevronDown, ChevronUp, Eye, Pencil, X as XIcon, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

const MOCK_PRODUCTS = [
  { id: '09', name: '1 SEMESTRE - AUXILIAR DE ENFERMERIA', price: 1700000, tax: '', status: 'Activo' },
  { id: '12', name: '1 SEMESTRE - TECNICO AUXILIAR CONTABLE Y ADMINISTRATIVO', price: 1365000, tax: '', status: 'Activo' },
  { id: '33', name: '1 SEMESTRE - TECNICO EN OPERACION DE MAQUINARIA PESADA', price: 1365000, tax: '', status: 'Activo' },
  { id: '42', name: '1 SEMESTRE - TECNICO EN VETERINARIA', price: 1365000, tax: '', status: 'Activo' },
  { id: '06', name: '1 SEMESTRE - AUXILIAR DE ADMINISTRACION EN SALUD', price: 1700000, tax: '', status: 'Activo' },
  { id: '50', name: '1 SEMESTRE - TECNICO DE ANGENTE DE TRANSITO Y SEGURIDAD VIAL', price: 1365000, tax: '', status: 'Activo' },
  { id: '15', name: '1 SEMESTRE - TECNICO EN ATENCION A LA PRIMERA INFANCIA CON ENFASIS EN REFUERZO ESCOLAR', price: 1365000, tax: '', status: 'Activo' },
  { id: '18', name: '1 SEMESTRE - TECNICO EN COMPRAS E INVENTARIO CON ENFASIS EN GESTION DE ARCHIVO', price: 1365000, tax: '', status: 'Activo' },
  { id: '21', name: '1 SEMESTRE - TECNICO EN DISEÑO GRAFICO', price: 1365000, tax: '', status: 'Activo' },
  { id: '24', name: '1 SEMESTRE - TECNICO EN ELECTRICIDAD CON ENFESIS EN INSTALACION DE PANELES SOLARES', price: 1365000, tax: '', status: 'Activo' },
  { id: '27', name: '1 SEMESTRE - TECNICO EN INFORMATICA Y MANTENIMIENTO DE COMPUTADORES CON ENFASIS EN ELECTRONICA', price: 1365000, tax: '', status: 'Activo' },
  { id: '30', name: '1 SEMESTRE - TECNICO EN MERCADERISTA E IMPULSADOR CON ENFASIS EN CAJA REGISTRADORA', price: 1365000, tax: '', status: 'Activo' }
];

export default function ProductsPage() {
  const [productsList, setProductsList] = useState(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Búsqueda Avanzada
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create');
  
  const [form, setForm] = useState({
    id: '',
    name: '',
    price: '',
    tax: '',
    status: 'Activo'
  });

  const filtered = productsList.filter((m: any) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.includes(searchTerm)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este producto?")) {
      setProductsList(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setForm({ id: '', name: '', price: '', tax: '', status: 'Activo' });
    setShowModal(true);
  };

  const openEditModal = (product: any) => {
    setModalMode('edit');
    setForm({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      tax: product.tax,
      status: product.status
    });
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      {!selectedProduct ? (
        // --- VISTA PRINCIPAL (TABLA COMPLETA) ---
        <>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            
            {/* Search Bar */}
            <div style={{ display: 'flex', width: '380px' }}>
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                className="input-premium"
                style={{ flex: 1, height: '38px', background: 'white', borderRadius: '4px 0 0 4px', border: '1px solid #e5e7eb', borderRight: 'none', fontSize: '13px', paddingLeft: '12px', outline: 'none' }}
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <button style={{ width: '40px', height: '38px', background: '#10b981', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Search size={16} />
              </button>
            </div>

            {/* Exportar */}
            <button 
              onClick={() => alert(`Exportando ${filtered.length} productos...`)}
              style={{ height: '38px', padding: '0 16px', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', borderRight: '1px solid #e5e7eb' }}
            >
              <Download size={14} /> Exportar
            </button>

            {/* Búsqueda avanzada */}
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Búsqueda avanzada {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Crear productos */}
            <button
              onClick={openCreateModal}
              className="btn-premium"
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', border: 'none', cursor: 'pointer', padding: '0 16px', height: '38px', borderRadius: '6px', marginLeft: 'auto', fontSize: '13px', fontWeight: '700' }}
            >
              <Plus size={16} /> Crear productos
            </button>

          </div>

          {/* Panel Búsqueda Avanzada */}
          {showAdvanced && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', width: '100%', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                <input 
                  type="checkbox" 
                  checked={incluirInactivos} 
                  onChange={() => setIncluirInactivos(!incluirInactivos)} 
                  style={{ width: '16px', height: '16px', accentColor: '#10b981' }} 
                />
                ¿Incluir productos inactivos?
              </label>
            </div>
          )}

          <div style={{ background: 'white', border: '1px solid #e5e7eb', minHeight: '120px', borderRadius: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Código</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Valor neto</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Impuesto</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Estado</th>
                  <th style={{ textAlign: 'center', padding: '14px 20px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 20px', color: '#4b5563', fontSize: '12px' }}>{m.id}</td>
                    <td style={{ padding: '10px 20px', color: '#3b82f6', fontSize: '12px', fontWeight: '500' }}>{m.name}</td>
                    <td style={{ padding: '10px 20px', fontSize: '12px', color: '#6b7280' }}>$ {m.price.toLocaleString('es-CO')}</td>
                    <td style={{ padding: '10px 20px', fontSize: '12px', color: '#6b7280' }}>{m.tax}</td>
                    <td style={{ padding: '10px 20px', fontSize: '12px', color: '#6b7280' }}>{m.status}</td>
                    <td style={{ padding: '10px 20px', display: 'flex', justifyContent: 'center', gap: '8px', color: '#9ca3af' }}>
                      <button 
                        onClick={() => setSelectedProduct(m)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                        title="Ver detalles"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => openEditModal(m)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(m.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Eliminar"
                      >
                        <XIcon size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', borderTop: '0px solid #e5e7eb' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button 
                    key={num} 
                    onClick={() => setCurrentPage(num)}
                    style={{ 
                      width: '32px', height: '32px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      border: '1px solid #e5e7eb', 
                      background: num === currentPage ? '#10b981' : 'white', 
                      color: num === currentPage ? 'white' : '#6b7280', 
                      fontSize: '13px', cursor: 'pointer', borderRadius: '4px' 
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        // --- VISTA MASTER-DETAIL (SPLIT) ---
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* LADO IZQUIERDO (Lista) */}
          <div style={{ width: '300px', flexShrink: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', width: '100%' }}>
                <input 
                  type="text" 
                  placeholder="Buscar productos..." 
                  style={{ flex: 1, height: '34px', background: 'white', border: '1px solid #e5e7eb', borderRight: 'none', fontSize: '13px', paddingLeft: '12px', outline: 'none' }}
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
                <button style={{ width: '36px', height: '34px', background: '#10b981', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Search size={14} />
                </button>
              </div>
            </div>

            <div>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '700', color: '#111827' }}>
                Nombre
              </div>
              {currentItems.map((m: any) => (
                <div 
                  key={m.id}
                  onClick={() => setSelectedProduct(m)}
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f3f4f6', 
                    fontSize: '11px', 
                    color: selectedProduct?.id === m.id ? '#3b82f6' : '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    background: selectedProduct?.id === m.id ? '#ebf5ff' : 'transparent',
                    lineHeight: '1.4'
                  }}
                >
                  {m.name}
                </div>
              ))}

              {/* Pagination small */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button 
                      key={num} 
                      onClick={() => setCurrentPage(num)}
                      style={{ 
                        width: '24px', height: '24px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        border: '1px solid #e5e7eb', 
                        background: num === currentPage ? '#10b981' : 'white', 
                        color: num === currentPage ? 'white' : '#6b7280', 
                        fontSize: '11px', cursor: 'pointer', borderRadius: '4px' 
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* LADO DERECHO (Detalle) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            {/* Header del detalle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Búsqueda avanzada {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  style={{ width: '32px', height: '32px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Volver"
                >
                  <ArrowLeft size={16} />
                </button>
                <button 
                  onClick={openCreateModal}
                  style={{ width: '32px', height: '32px', border: 'none', background: '#10b981', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Crear producto"
                >
                  <Plus size={16} />
                </button>
              </div>

            </div>

            {/* Contenido del detalle */}
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '24px' }}>
              
              <div style={{ marginBottom: '8px', fontSize: '12px', color: '#111827', fontWeight: '700' }}>
                Producto:
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '400', color: '#374151', lineHeight: '1.3' }}>
                  {selectedProduct.name}
                </h2>
                
                <div style={{ display: 'flex', gap: '16px', flexShrink: 0, marginTop: '4px' }}>
                  <button 
                    onClick={() => openEditModal(selectedProduct)}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedProduct.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <XIcon size={12} /> Eliminar
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Código:</label>
                  <div style={{ background: '#f9fafb', padding: '10px 16px', borderRadius: '4px', fontSize: '13px', color: '#4b5563', minHeight: '38px', border: '1px solid #f3f4f6' }}>
                    {selectedProduct.id}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Valor neto:</label>
                  <div style={{ background: '#f9fafb', padding: '10px 16px', borderRadius: '4px', fontSize: '13px', color: '#4b5563', minHeight: '38px', border: '1px solid #f3f4f6' }}>
                    $ {selectedProduct.price.toLocaleString('es-CO')}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Impuesto:</label>
                  <div style={{ background: '#f9fafb', padding: '10px 16px', borderRadius: '4px', fontSize: '13px', color: '#4b5563', minHeight: '38px', border: '1px solid #f3f4f6' }}>
                    {selectedProduct.tax}
                  </div>
                </div>

              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Estado:</label>
                  <div style={{ background: '#f9fafb', padding: '10px 16px', borderRadius: '4px', fontSize: '13px', color: '#4b5563', minHeight: '38px', border: '1px solid #f3f4f6' }}>
                    {selectedProduct.status}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Creación / Edición Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
          <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '700px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
            
            <div style={{ background: '#5bba6f', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'white' }}>
                {modalMode === 'create' ? 'Crear producto' : 'Editar producto'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <XIcon size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Código <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.id}
                  onChange={e => setForm(p => ({...p, id: e.target.value}))}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Nombre <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Valor neto <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text"
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', outline: 'none' }}
                  value={form.price}
                  onChange={e => setForm(p => ({...p, price: e.target.value}))}
                />
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Impuesto</label>
                <select 
                  className="input-premium"
                  style={{ width: '100%', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', padding: '0 12px', background: 'white', color: '#374151', appearance: 'none' }}
                  value={form.tax}
                  onChange={e => setForm(p => ({...p, tax: e.target.value}))}
                >
                  <option value="">Seleccione</option>
                  <option value="IVA 19%">IVA 19%</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Estado <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '38px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" name="estadoModal" value="Activo" checked={form.status === 'Activo'} onChange={() => setForm(p => ({...p, status: 'Activo'}))} style={{ accentColor: '#3b82f6', width: '14px', height: '14px' }} />
                    Activo
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" name="estadoModal" value="Inactivo" checked={form.status === 'Inactivo'} onChange={() => setForm(p => ({...p, status: 'Inactivo'}))} style={{ accentColor: '#3b82f6', width: '14px', height: '14px' }} />
                    Inactivo
                  </label>
                </div>
              </div>

            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '6px 16px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', color: '#4b5563', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '6px 16px', borderRadius: '4px', border: 'none', background: '#5bba6f', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
