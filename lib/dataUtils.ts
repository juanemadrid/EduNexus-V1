import { db } from './db';

export const getAllStudents = async () => {
  try {
    return await db.list<any>('students');
  } catch (error) {
    console.error("Error fetching students from Firestore:", error);
    return [];
  }
};

export const exportToCSV = async (onSuccess?: (msg: string) => void, onError?: (msg: string) => void) => {
  const students = await getAllStudents();
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

    onSuccess?.('✅ Base de datos exportada en formato Excel con éxito desde Firestore');
  } catch (e) {
    onError?.('❌ Error al exportar Excel.');
  }
};

export const importFromCSV = async (
  file: File, 
  onSuccess?: (addedCount: number) => void, 
  onError?: (msg: string) => void
) => {
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1);
      const imported = rows.filter(r => r.trim()).map(r => {
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

      const current = await getAllStudents();
      const existingById = new Map(current.map((s: any) => [s.id, s]));
      const toAdd: any[] = [];
      
      imported.forEach(s => { 
        if (s.id && !existingById.has(s.id)) { 
          toAdd.push({ id: s.id, data: s });
        } 
      });

      if (toAdd.length > 0) {
        await db.batchSave('students', toAdd);
      }
      
      onSuccess?.(toAdd.length);
    } catch (err) {
      onError?.('❌ Error: El archivo no es válido.');
    }
  };
  reader.readAsText(file);
};
