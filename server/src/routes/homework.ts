import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireTeacher, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  if (req.userRole === 'teacher') {
    const hw = await prisma.homework.findMany({
      where: { teacherId: req.userId! },
      include: {
        students: {
          include: {
            student: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(hw);
  } else {
    const student = await prisma.student.findUnique({ where: { userId: req.userId! } });
    if (!student) { res.json([]); return; }
    const rows = await prisma.homeworkStudent.findMany({
      where: { studentId: student.id },
      include: {
        homework: { include: { teacher: { select: { name: true } } } },
      },
      orderBy: { homework: { dueDate: 'asc' } },
    });
    res.json(rows.map(r => ({
      ...r.homework,
      completed: r.completed,
      completedAt: r.completedAt,
    })));
  }
});

router.post('/', requireTeacher, async (req: AuthRequest, res: Response) => {
  const { title, description, dueDate, studentIds } = req.body;
  if (!title || !dueDate) {
    res.status(400).json({ error: 'title and dueDate required' });
    return;
  }
  const hw = await prisma.homework.create({
    data: {
      teacherId: req.userId!,
      title,
      description: description || null,
      dueDate: new Date(dueDate),
      students: studentIds?.length
        ? { create: studentIds.map((id: number) => ({ studentId: id })) }
        : undefined,
    },
  });
  res.json(hw);
});

router.put('/:id', requireTeacher, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.homework.findFirst({ where: { id, teacherId: req.userId! } });
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  const { title, description, dueDate, studentIds } = req.body;
  const hw = await prisma.homework.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      description: description !== undefined ? description : existing.description,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
    },
  });

  if (studentIds !== undefined) {
    await prisma.homeworkStudent.deleteMany({ where: { homeworkId: id } });
    if (studentIds.length) {
      await prisma.homeworkStudent.createMany({
        data: studentIds.map((sid: number) => ({ homeworkId: id, studentId: sid })),
      });
    }
  }
  res.json(hw);
});

router.delete('/:id', requireTeacher, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.homework.findFirst({ where: { id, teacherId: req.userId! } });
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.homework.delete({ where: { id } });
  res.json({ ok: true });
});

// Student: mark homework done/undone
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'student') { res.status(403).json({ error: 'Forbidden' }); return; }
  const homeworkId = parseInt(req.params.id);
  const { completed } = req.body;
  const student = await prisma.student.findUnique({ where: { userId: req.userId! } });
  if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

  const row = await prisma.homeworkStudent.findUnique({
    where: { homeworkId_studentId: { homeworkId, studentId: student.id } },
  });
  if (!row) { res.status(404).json({ error: 'Homework not assigned' }); return; }

  const updated = await prisma.homeworkStudent.update({
    where: { homeworkId_studentId: { homeworkId, studentId: student.id } },
    data: { completed, completedAt: completed ? new Date() : null },
  });
  res.json(updated);
});

export default router;
