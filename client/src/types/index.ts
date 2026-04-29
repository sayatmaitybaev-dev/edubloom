export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'teacher' | 'student';
}

export interface Student {
  id: number;
  userId: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Schedule {
  id: number;
  teacherId: number;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  students?: { student: { user: { name: string } } }[];
  teacher?: { name: string };
}

export interface Homework {
  id: number;
  teacherId: number;
  title: string;
  description: string | null;
  dueDate: string;
  createdAt: string;
  completed?: boolean;
  completedAt?: string | null;
  students?: { completed: boolean; student: { user: { name: string } } }[];
  teacher?: { name: string };
}

export interface Grade {
  id: number;
  teacherId: number;
  studentId: number;
  subject: string;
  grade: number;
  comment: string | null;
  date: string;
  student?: { user: { name: string } };
  teacher?: { name: string };
}
