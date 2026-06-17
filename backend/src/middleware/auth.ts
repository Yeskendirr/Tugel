import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: number;
  role: 'admin' | 'staff';
}

export type AuthRequest = Request & { user: UserPayload };

export function getUser(req: Request): UserPayload {
  return (req as AuthRequest).user;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Авторизация қажет' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserPayload;
    (req as AuthRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Жарамсыз токен' });
  }
}
