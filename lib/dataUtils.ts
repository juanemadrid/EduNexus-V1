// Data utility functions for EduNexus

export const getAllStudents = () => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('edunexus_registered_students');
  return saved ? JSON.parse(saved) : [];
};

export const exportToCSV = (onSuccess?: (msg: string) => void, onError?: (msg: string) => void) => {
  const students = getAllStudents();
  if (students.length === 0) {
    onError?.('No hay datos para exportar.');
    return;
  }
  
  const headers = ['N° Identificación','Nombre Completo','Tipo','Teléfono','Celular','Email','Ciudad','Barrio','Dirección','Estado'];
  const rows = students.map((s: any) => [
    s.id||'',
    s.name||'',
    s.type||'Estudiante',
    s.phone||'',
    s.mobile||'',
    s.email||'',
    s.residenceCity||'',
    s.barrio||'',
    s.address||'',
    s.isActive!==false?'Activo':'Inactivo'
  ]);

  const csvContent = [headers,...rows].map(row=>row.map((cell:any)=>`"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  
  try {
    const csvData = '\uFEFF' + csvContent;
    const link = document.createElement('a');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `EduNexus_Respaldo_Completo.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
    onSuccess?.('✅ Base de datos exportada con éxito');
  } catch (e) {
    onError?.('❌ Error al exportar.');
  }
};

export const importFromCSV = (
  file: File, 
  onSuccess?: (addedCount: number) => void, 
  onError?: (msg: string) => void
) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1);
      const imported = rows.filter(r => r.trim()).map(r => {
        // Simple CSV parser
        const cells = r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, '')) || [];
        return { 
          id: cells[0], 
          name: cells[1], 
          type: cells[2], 
          phone: cells[3], 
          mobile: cells[4], 
          email: cells[5], 
          residenceCity: cells[6], 
          barrio: cells[7], 
          address: cells[8], 
          isActive: cells[9] !== 'Inactivo' 
        };
      });

      const current = getAllStudents();
      const existingById = new Map(current.map((s: any) => [s.id, s]));
      let added = 0;
      imported.forEach(s => { 
        if (s.id && !existingById.has(s.id)) { 
          existingById.set(s.id, s); 
          added++; 
        } 
      });
      const merged = Array.from(existingById.values());
      localStorage.setItem('edunexus_registered_students', JSON.stringify(merged));
      onSuccess?.(added);
    } catch (err) {
      onError?.('❌ Error: El archivo no es válido.');
    }
  };
  reader.readAsText(file);
};
