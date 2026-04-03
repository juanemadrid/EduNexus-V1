'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Download, ChevronDown, ChevronUp, Eye, Pencil, X as XIcon, ArrowLeft, Package, DollarSign, Tag, CheckCircle2, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export default function ProductsPage() {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await db.list('products');
      setProductsList(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const filtered = productsList.filter((m: any) => {
    const matchesSearch = (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (m.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = incluirInactivos || m.status === 'Activo';
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este producto del inventario institucional?")) {
      try {
        await db.delete('products', id);
        setProductsList(prev => prev.filter(p => p.id !== id));
        if (selectedProduct?.id === id) {
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto.');
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!form.name || !form.price) {
      alert("Por favor complete los campos obligatorios (*)");
      return;
    }

    const productData = { 
      ...form, 
      price: parseFloat(form.price) || 0,
      updatedAt: new Date().toISOString()
    };

    try {
      if (modalMode === 'create') {
        const docId = await db.create('products', { ...productData, createdAt: new Date().toISOString() });
        setProductsList(prev => [{ ...productData, id: docId, _docId: docId }, ...prev]);
      } else {
        await db.update('products', form.id, productData);
        setProductsList(prev => prev.map(p => p.id === form.id ? { ...productData, id: form.id } : p));
        if (selectedProduct && selectedProduct.id === form.id) {
          setSelectedProduct({ ...productData, id: form.id });
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto.');
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
      tax: product.tax || '',
      status: product.status || 'Activo'
    });
    setShowModal(true);
  };

  return (
    <DashboardLayout>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.3)' }}>
                <Package size={28} />
             </div>
             <div>
               <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: 0, letterSpacing: '-1.5px' }}>Portafolio de Productos</h1>
               <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Administración de servicios, pensiones y conceptos financieros</p>
             </div>
          </div>
          <button
              onClick={openCreateModal}
              className="btn-premium"
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}
            >
              <Plus size={18} /> Nuevo Producto
          </button>
       </div>

      {!selectedProduct ? (
        <>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
               <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
               <input 
                 type="text" 
                 placeholder="Buscar por código o nombre de producto..." 
                 className="input-premium"
                 style={{ width: '100%', height: '52px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', paddingLeft: '48px', outline: 'none', fontSize: '14px' }}
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
               />
            </div>

            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: showAdvanced ? '#ecfdf5' : '#f8fafc', border: '1px solid', borderColor: showAdvanced ? '#10b981' : '#e2e8f0', color: showAdvanced ? '#059669' : '#64748b', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', height: '52px', borderRadius: '14px', transition: '0.2s' }}
            >
               Filtros Avanzados {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showAdvanced && (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', marginBottom: '24px', border: '1px solid #f1f5f9', display: 'flex', gap: '24px', animation: 'fadeIn 0.2s ease-out' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                  <input 
                    type="checkbox" 
                    checked={incluirInactivos} 
                    onChange={() => setIncluirInactivos(!incluirInactivos)} 
                    style={{ width: '18px', height: '18px', accentColor: '#10b981' }} 
                  />
                  Mostrar productos inactivos o descatalogados
               </label>
            </div>
          )}

          <div className="glass-panel" style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Código</th>
                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción del Servicio/Producto</th>
                    <th style={{ textAlign: 'left', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor Unitario</th>
                    <th style={{ textAlign: 'center', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                    <th style={{ textAlign: 'center', padding: '20px 24px', fontSize: '11px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '80px', textAlign: 'center' }}>
                         <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                         <p style={{ marginTop: '16px', fontWeight: '800', color: '#64748b', fontSize: '14px' }}>Sincronizando inventario institucional...</p>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((m: any) => (
                      <tr key={m.id} className="table-row" style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                        <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '13px', fontWeight: '700' }}>#{m.id}</td>
                        <td style={{ padding: '16px 24px', color: '#1e293b', fontSize: '14px', fontWeight: '800' }}>{m.name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '15px', color: '#059669', fontWeight: '900' }}>$ {m.price.toLocaleString('es-CO')}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                           <span style={{ 
                             padding: '6px 12px', 
                             borderRadius: '10px', 
                             fontSize: '10px', 
                             fontWeight: '900', 
                             textTransform: 'uppercase',
                             background: m.status === 'Inactivo' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                             color: m.status === 'Inactivo' ? '#ef4444' : '#10b981'
                           }}>
                             {m.status}
                           </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                           <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button onClick={() => setSelectedProduct(m)} style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} title="Ver detalles"><Eye size={16} /></button>
                            <button onClick={() => openEditModal(m)} style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} title="Editar"><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(m.id)} style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }} title="Eliminar"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={5} style={{ padding: '100px 40px', textAlign: 'center' }}>
                         <Package size={48} style={{ color: '#e2e8f0', marginBottom: '20px' }} />
                         <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>No hay productos registrados</h3>
                         <p style={{ margin: 0, fontWeight: '600', color: '#94a3b8', fontSize: '14px' }}>Inicie creando un nuevo concepto financiero para la institución.</p>
                       </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button 
                      key={num} 
                      onClick={() => setCurrentPage(num)}
                      style={{ width: '36px', height: '36px', borderRadius: '10px', background: num === currentPage ? '#10b981' : 'white', color: num === currentPage ? 'white' : '#64748b', fontWeight: '800', cursor: 'pointer', border: num === currentPage ? 'none' : '1px solid #e2e8f0' }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', animation: 'fadeIn 0.3s ease-out' }}>
          {/* Detailed View Sidebar */}
          <div style={{ width: '340px', flexShrink: 0, background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <span style={{ fontWeight: '900', fontSize: '13px', color: '#1e293b', textTransform: 'uppercase' }}>Explorador</span>
               <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><XIcon size={18} /></button>
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {productsList.map((m: any) => (
                <div 
                  key={m.id}
                  onClick={() => setSelectedProduct(m)}
                  style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selectedProduct?.id === m.id ? '#ecfdf5' : 'transparent', transition: '0.2s' }}
                >
                  <div style={{ fontWeight: '800', color: selectedProduct?.id === m.id ? '#059669' : '#334155', fontSize: '13px', marginBottom: '4px' }}>{m.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>COD: {m.id}</span>
                     <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '900' }}>${m.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Detail Area */}
          <div style={{ flex: 1 }}>
            <div className="glass-panel" style={{ background: 'white', borderRadius: '28px', border: '1px solid #f1f5f9', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                 <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Tag size={32} />
                    </div>
                    <div>
                       <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Detalles del Producto</div>
                       <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{selectedProduct.name}</h2>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => openEditModal(selectedProduct)} style={{ padding: '10px 20px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Pencil size={18} /> Editar</button>
                    <button onClick={() => handleDelete(selectedProduct.id)} style={{ padding: '10px 20px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={18} /> Eliminar</button>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                 <div className="detail-card" style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <DollarSign size={20} color="#10b981" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Valor Comercial</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669', marginTop: '4px' }}>$ {selectedProduct.price.toLocaleString('es-CO')}</div>
                 </div>
                 <div className="detail-card" style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <CheckCircle2 size={20} color="#3b82f6" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Estatus Actual</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', marginTop: '4px' }}>{selectedProduct.status}</div>
                 </div>
                 <div className="detail-card" style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <Tag size={20} color="#d97706" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Código Único</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', marginTop: '4px' }}>#{selectedProduct.id}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creación / Edición Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '650px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', animation: 'modalSlide 0.3s ease-out' }}>
            <div style={{ background: '#10b981', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                     {modalMode === 'create' ? <Plus size={20} /> : <Pencil size={20} />}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white' }}>{modalMode === 'create' ? 'Configurar Nuevo Producto' : 'Actualizar Información'}</h2>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase' }}>TREASURY & FINANCIAL MODULE</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><XIcon size={24} /></button>
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Código Interno *</label>
                  <input type="text" className="input-premium" style={{ width: '100%', height: '48px', background: '#f8fafc' }} value={form.id} onChange={e => setForm(p => ({...p, id: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Nombre del Concepto *</label>
                  <input type="text" className="input-premium" style={{ width: '100%', height: '48px', background: '#f8fafc' }} value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Valor Neto ($) *</label>
                  <input type="number" className="input-premium" style={{ width: '100%', height: '48px', background: '#f8fafc' }} value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Impuesto (IVA)</label>
                  <select className="input-premium" style={{ width: '100%', height: '48px', background: '#f8fafc', appearance: 'none' }} value={form.tax} onChange={e => setForm(p => ({...p, tax: e.target.value}))}>
                    <option value="">Ninguno</option>
                    <option value="19%">IVA 19%</option>
                    <option value="5%">IVA 5%</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Estatus Activo</label>
                  <select className="input-premium" style={{ width: '100%', height: '48px', background: '#f8fafc', appearance: 'none' }} value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                    <option value="Activo">Confirmado (Activo)</option>
                    <option value="Inactivo">Suspendido (Inactivo)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
               <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}>Descartar</button>
               <button onClick={handleSaveProduct} style={{ padding: '12px 32px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>{modalMode === 'create' ? 'Finalizar Registro' : 'Actualizar Cambios'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-premium { border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; padding: 0 16px; }
        .input-premium:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); background: white !important; }
        .table-row:hover { background-color: #f8fafc !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalSlide { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </DashboardLayout>
  );
}
