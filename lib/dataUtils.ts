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

  try {
    const XLSX = require('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 18 }, // ID
      { wch: 35 }, // Nombres
      { wch: 20 }, // Tipo
      { wch: 15 }, // Telefono
      { wch: 15 }, // Celular
      { wch: 30 }, // Email
      { wch: 25 }, // Ciudad
      { wch: 25 }, // Barrio
      { wch: 35 }, // Dirección
      { wch: 15 }, // Estado
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Base de Datos");
    XLSX.writeFile(wb, `EduNexus_Respaldo_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);

    onSuccess?.('✅ Base de datos exportada en formato Excel con éxito');
  } catch (e) {
    onError?.('❌ Error al exportar Excel.');
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
