import { db } from './lib/db.js';

(async () => {
    try {
        console.log("Iniciando inyección de estudiante con dificultades...");
        
        // Let's get tenants. Suppose we are using Nueva Esperanza or San Jose
        // The subagent used Nueva Esperanza. Let's find a student from any tenant.
        const students = await db.list('students');
        const cursos = await db.list('cursos');
        
        if (students.length === 0 || cursos.length === 0) {
            console.log("No hay estudiantes o cursos.");
            return;
        }

        // Target: pick the first student
        const student = students[0];
        // Target: pick a course this student is on, or just first course
        const course = cursos[0];

        console.log(`Seleccionado estudiante: ${student.name || student.nombres} - Curso: ${course.asignaturaNombre || course.name}`);

        // Inject failing grade
        const failGradeId = 'grade_fail_1';
        await db.set('academic_grades', failGradeId, {
            id: failGradeId,
            studentId: student.id,
            cursoId: course.id || course.codigo,
            courseName: course.asignaturaNombre || course.name,
            period: '2026-01',
            periodo: '2026-01',
            grade: 2.1,
            teacherId: course.docenteId || 'T1',
            createdAt: new Date().toISOString()
        });

        console.log("Nota reprobatoria (2.1) inyectada con éxito.");

    } catch (e) {
        console.error("Error:", e);
    }
})();
