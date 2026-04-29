import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !password || !role) {
    res.status(400).json({ error: 'name, password and role are required' });
    return;
  }
  if (!email && !phone) {
    res.status(400).json({ error: 'email or phone is required' });
    return;
  }
  if (!['teacher', 'student'].includes(role)) {
    res.status(400).json({ error: 'role must be teacher or student' });
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: email || null, phone: phone || null, passwordHash, role },
    });
    const token = signToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('Unique constraint')) {
      res.status(409).json({ error: 'Email or phone already registered' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;
  if (!password || (!email && !phone)) {
    res.status(400).json({ error: 'password and email or phone are required' });
    return;
  }
  try {
    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    const jwt = await import('jsonwebtoken');
    const SECRET = process.env.JWT_SECRET || 'edubloom_secret_2024';
    const payload = jwt.default.verify(header.slice(7), SECRET) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
