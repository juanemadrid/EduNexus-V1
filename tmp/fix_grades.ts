
import { db } from '../lib/db';

async function fixGrades() {
  try {
    // Update existing grade for student 3001 to a failing grade
    await db.update('academic_grades' as any, 'grade-3001-math', {
      grade: '2.1',
    });
    console.log('Updated student 3001 grade to 2.1 (fail)');

    // Check who else exists
    const students = await db.list<any>('students');
    console.log('Students found:', students.map(s => `${s.id}: ${s.name} (active: ${s.isActive})`).join('\n'));

    // Inject additional failing grades for more students
    const activeStudents = students.filter(s => s.isActive !== false);
    for (let i = 1; i < activeStudents.length; i++) {
      const s = activeStudents[i];
      const grade = i === 1 ? '1.5' : (3.5 + Math.random()).toFixed(1);
      const gradeId = `grade-${s.id}-math`;

      try { await db.delete('academic_grades' as any, gradeId); } catch(e) {}

      await db.create('academic_grades' as any, {
        id: gradeId,
        studentId: s.id,
        cursoId: 'course-10a-math',
        grade,
        period: '2026 - 01',
        periodo: '2026 - 01',
        courseName: 'Matemáticas'
      });
      console.log(`Injected grade ${grade} for ${s.name}`);
    }

    const gradesNow = await db.list<any>('academic_grades');
    console.log('\nFinal grades in DB:');
    gradesNow.forEach(g => console.log(` - ${g.studentId}: ${g.grade} (period: ${g.period})`));
  } catch(err) {
    console.error('ERROR:', err);
  }
}

fixGrades();
