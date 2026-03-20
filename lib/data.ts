import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_PAYMENTS, MOCK_ACTIVITY } from './mockData';

export interface DashboardStats {
  students: {
    value: string;
    trend: string;
  };
  teachers: {
    value: string;
    trend: string;
  };
  payments: {
    value: string;
    trend: string;
  };
  alerts: {
    value: string;
    trend: string;
  };
}

export interface Activity {
  id: number;
  type: string;
  user: string;
  detail: string;
  timestamp: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Simular un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  let totalStudents = 0;
  let totalTeachers = 0;
  let totalPayments = 0;
  let overduePayments = 0;

  if (typeof window !== 'undefined') {
    const studentsSaved = localStorage.getItem('edunexus_registered_students');
    if (studentsSaved) {
      const students = JSON.parse(studentsSaved);
      totalStudents = students.filter((s: any) => s.isActive !== false).length;
    }

    const teachersSaved = localStorage.getItem('edunexus_registered_teachers');
    if (teachersSaved) {
      const teachers = JSON.parse(teachersSaved);
      totalTeachers = teachers.filter((t: any) => t.isActive !== false).length;
    }

    const paymentsSaved = localStorage.getItem('edunexus_registered_payments');
    if (paymentsSaved) {
      const payments = JSON.parse(paymentsSaved);
      totalPayments = payments
        .filter((p: any) => p.status === 'paid')
        .reduce((sum: number, p: any) => sum + p.amount, 0);
      overduePayments = payments.filter((p: any) => p.status === 'overdue').length;
    }
  }

  return {
    students: {
      value: totalStudents.toLocaleString(),
      trend: 'Actualizado',
    },
    teachers: {
      value: totalTeachers.toLocaleString(),
      trend: totalTeachers > 0 ? 'Actualizado' : 'Ok',
    },
    payments: {
      value: `$ ${totalPayments.toLocaleString()}`,
      trend: totalPayments > 0 ? 'Hoy' : 'Sin pagos',
    },
    alerts: {
      value: overduePayments.toString(),
      trend: overduePayments > 0 ? 'Atención' : 'Sin alertas',
    },
  };
}

export async function getAcademicActivity(): Promise<Activity[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_ACTIVITY;
}
