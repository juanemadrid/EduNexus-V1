import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log("Iniciando carga de datos desde API...");

    // Helper for upsert
    const upsert = async (collection: string, data: any) => {
      try {
        await db.create(collection as any, data);
      } catch (e) {
        await db.update(collection as any, data.id, data).catch(() => {});
      }
    };

    // 0. Periodo Académico
    await upsert('academic_periods', { id: 'per-2026-01', name: '2026 - 01', status: 'Activo' });

    // 1. Sede y Jornada
    const sedeId = `sede-principal-123`;
    const sedeData = {
      id: sedeId,
      nombre: "SEDE CENTRAL NUEVA ESPERANZA",
      direccion: "Calle 100 # 15-30",
      ciudad: "Barranquilla",
      telefono: "3000000000",
      estado: "Activa",
      jornadas: [
        { 
          id: `jornada-m-123`, 
          nombre: "Mañana", 
          estado: "Activa", 
          programas: [] 
        }
      ]
    };
    await upsert('sedes', sedeData);

    // 2. Programa Académico
    const programId = `program-bac-123`;
    const programData = {
      id: programId,
      nombre: "BACHILLERATO ACADÉMICO",
      codigo: "BAC-001",
      estado: "Activo",
      categoria: "Educación Formal",
      pensumSubjects: [
        { id: 'subject-mat-123', nombre: 'MATEMÁTICAS', subjectId: 'subject-mat-123' }
      ]
    };
    await upsert('academic_programs', programData);

    // 3. Vincular Programa a Sede-Jornada
    sedeData.jornadas[0].programas = [programData];
    await db.update('sedes', sedeId, sedeData).catch(() => {});

    // 4. Asignatura
    const subjectId = `subject-mat-123`;
    await upsert('subjects', {
      id: subjectId,
      nombre: "MATEMÁTICAS",
      codigo: "MAT-101",
      estado: "Activo"
    });

    // 5. Docente
    const docenteId = "2001";
    await upsert('teachers', {
      id: docenteId,
      name: "PROFESORA ANA MARÍA",
      email: "anamaria@edunexus.com",
      status: "Activo"
    });
    // Support legacy table name
    await upsert('registered_teachers', {
      id: docenteId,
      name: "PROFESORA ANA MARÍA",
      email: "anamaria@edunexus.com",
      status: "Activo"
    });

    // 6. Curso (Nexo Académico)
    const cursoId = `curso-math-101-123`;
    await upsert('cursos', {
      id: cursoId,
      codigo: "MAT-101-A",
      nombre: "MATEMÁTICAS 10-A",
      docenteId: docenteId,
      sedeJornada: `${sedeId}::jornada-m-123__${JSON.stringify(sedeData.jornadas[0].programas)}`,
      programaId: programId,
      asignaturaId: subjectId,
      cupoMaximo: "30",
      periodo: "2026 - 01",
      fechaInicio: "2026-01-20",
      fechaFin: "2026-06-30",
      docenteNombre: "PROFESORA ANA MARÍA",
      asignaturaNombre: "MATEMÁTICAS",
      programaNombre: "BACHILLERATO ACADÉMICO",
      sedeJornadaLabel: "SEDE CENTRAL NUEVA ESPERANZA - Mañana"
    });

    // 7. Grupo (Donde están los alumnos)
    const grupoId = `grupo-10-01-123`;
    await upsert('grupos', {
      id: grupoId,
      codigo: "10-01",
      nombre: "GRADO 10-01",
      cursoId: cursoId,
      cupoMaximo: "30",
      estado: "Activo",
      estudiantes: ["3001"]
    });

    // 8. Estudiante y Familiar
    const estudianteId = "3001";
    const studentData = {
      id: estudianteId,
      name: "JUANESTEBAN RODRÍGUEZ",
      email: "juan@test.com",
      cursoId: grupoId,
      status: "Matriculado"
    };
    await upsert('registered_students', studentData);
    await upsert('students', studentData);

    await upsert('registered_family', {
      id: "4001",
      name: "PEDRO RODRÍGUEZ",
      relation: "Padre",
      studentId: estudianteId
    });

    // 9. Actualizar estadísticas del Dashboard
    await upsert('institution_metadata', {
      id: 'stats',
      studentsCount: 1,
      teachersCount: 1,
      paymentsTotal: 0,
      overdueCount: 0,
      lastSync: Date.now()
    });

    return NextResponse.json({ success: true, message: "Carga completa exitosamente" });
  } catch (error: any) {
    console.error("Error en seeding:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
