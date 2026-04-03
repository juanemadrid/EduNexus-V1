import { db } from '../lib/db';

async function syncSubjects() {
  console.log('🔄 Iniciando sincronización de asignaturas...');
  try {
    // 1. Obtener todos los cursos (oferta académica)
    const cursos = await db.list('cursos');
    console.log(`✅ ${cursos.length} cursos encontrados.`);

    // 2. Extraer asignaturas únicas
    const subjectsMap = new Map();

    cursos.forEach((c: any) => {
      // Extraer nombre y código (asumiendo formato MAT-10A-2026 -> MAT-10A)
      const nombre = c.asignaturaNombre || c.nombre;
      let codigo = c.codigo || c.id || '';
      
      // Limpiar el código si trae el año o periodo al final (ej. -2026)
      if (codigo.includes('-202')) {
        codigo = codigo.split('-').slice(0, -1).join('-');
      }

      if (nombre && !subjectsMap.has(nombre)) {
        subjectsMap.set(nombre, {
          nombre,
          codigo: codigo || nombre.substring(0, 3).toUpperCase(),
          abreviacion: nombre.substring(0, 3).toUpperCase(),
          estado: 'Activa'
        });
      }
    });

    console.log(`🔍 ${subjectsMap.size} asignaturas únicas detectadas.`);

    // 3. Guardar en academic_subjects (Maestro)
    const existingSubjects = await db.list('academic_subjects');
    const existingNames = new Set(existingSubjects.map((s: any) => s.nombre));

    const toCreate = Array.from(subjectsMap.values()).filter(s => !existingNames.has(s.nombre));
    console.log(`💾 Guardando ${toCreate.length} nuevas asignaturas en el Maestro...`);

    for (const sub of toCreate) {
      await db.create('academic_subjects', sub);
      console.log(`   + Creada: ${sub.nombre} (${sub.codigo})`);
    }

    console.log('✨ Sincronización completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  }
}

syncSubjects();
