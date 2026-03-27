import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_PAYMENTS, MOCK_ACTIVITY } from './mockData';
import { db } from '@/lib/db';

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
  let totalStudents = 0;
  let totalTeachers = 0;
  let totalPayments = 0;
  let overduePayments = 0;

  try {
    const [students, teachers] = await Promise.all([
      db.list<any>('students').catch(() => []),
      db.list<any>('teachers').catch(() => [])
    ]);
    
    totalStudents = students.filter((s: any) => s.isActive !== false).length;
    totalTeachers = teachers.filter((t: any) => t.isActive !== false).length;
    
  } catch (error) {
    console.error("Error fetching stats:", error);
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
