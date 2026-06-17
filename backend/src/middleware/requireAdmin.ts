import { Request, Response, NextFunction } from 'express';
import { getUser } from './auth';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = getUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Тек әкімшіге рұқсат етілген' });
    return;
  }
  next();
}
