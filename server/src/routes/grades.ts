import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireTeacher, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Teacher: get grades for all own students (optionally filter by studentId)
// Student: get own grades
router.get('/', async (req: AuthRequest, res: Response) => {
  if (req.userRole === 'teacher') {
    const { studentId } = req.query;
    const grades = await prisma.grade.findMany({
      where: {
        teacherId: req.userId!,
        ...(studentId ? { studentId: parseInt(studentId as string) } : {}),
      },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { date: 'desc' },
    });
    res.json(grades);
  } else {
    const student = await prisma.student.findUnique({ where: { userId: req.userId! } });
    if (!student) { res.json([]); return; }
    const grades = await prisma.grade.findMany({
      where: { studentId: student.id },
      include: { teacher: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });
    res.json(grades);
  }
});

// Teacher: add grade
router.post('/', requireTeacher, async (req: AuthRequest, res: Response) => {
  const { studentId, subject, grade, comment } = req.body;
  if (!studentId || !subject || grade === undefined) {
    res.status(400).json({ error: 'studentId, subject and grade required' });
    return;
  }
  const student = await prisma.student.findFirst({ where: { id: studentId, teacherId: req.userId! } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const created = await prisma.grade.create({
    data: {
      teacherId: req.userId!,
      studentId,
      subject,
      grade: parseInt(grade),
      comment: comment || null,
    },
  });
  res.json(created);
});

// Teacher: delete grade
router.delete('/:id', requireTeacher, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.grade.findFirst({ where: { id, teacherId: req.userId! } });
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.grade.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
