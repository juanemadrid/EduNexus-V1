
import { db } from '../lib/db';

async function simulateDifficulties() {
  try {
    const students = await db.list<any>('students');
    const activeStudents = students.filter(s => s.isActive !== false);
    
    if (activeStudents.length === 0) {
       console.log('NO_ACTIVE_STUDENTS_FOUND');
       return;
    }

    const programs = await db.list<any>('academic_programs');
    const progId = programs[0]?.codigo || programs[0]?.id || 'BAC-001';
    
    const period = '2026 - 01';
    const subjectId = 'math-01';
    const courseId = 'course-10a-math';

    console.log(`Using Program: ${progId}, Period: ${period}`);

    // Clean up first to avoid conflicts if re-running
    try { await db.delete('cursos' as any, courseId); } catch(e) {}
    try { await db.delete('academic_subjects' as any, subjectId); } catch(e) {}

    await db.create('academic_subjects' as any, {
      id: subjectId,
      nombre: 'Matemáticas',
      area: 'Ciencias Básicas',
      credits: 4
    });

    await db.create('cursos' as any, {
      id: courseId,
      nombre: '10A - Matemáticas',
      subjectId,
      periodId: 'per-2026-01',
      instructorId: 'inst-01',
      programId: progId,
      sedeId: activeStudents[0].sedeId || 'SEDE PRINCIPAL',
      asignaturaNombre: 'Matemáticas'
    });

    for (let i = 0; i < activeStudents.length; i++) {
      const student = activeStudents[i];
      const studentId = student.id;
      // Make the 3rd student fail
      const grade = i === 2 ? 1.8 : (3.2 + Math.random() * 1.8);
      
      console.log(`Injecting Grade for ${student.name}: ${grade.toFixed(1)}`);
      
      const gradeId = `grade-${studentId}-math`;
      try { await db.delete('academic_grades' as any, gradeId); } catch(e) {}

      await db.create('academic_grades' as any, {
        id: gradeId,
        studentId,
        cursoId: courseId,
        grade: grade.toFixed(1),
        period: period,
        periodo: period,
        courseName: 'Matemáticas'
      });
    }

    console.log('SIMULATION_DATA_INJECTED_SUCCESSFULLY');
  } catch (err) {
    console.error('ERROR_DURING_INJECTION:', err);
  }
}

simulateDifficulties();
