import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'edubloom_secret_2024';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, SECRET) as { userId: number; role: string };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireTeacher(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'teacher') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

export function signToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: '7d' });
}
