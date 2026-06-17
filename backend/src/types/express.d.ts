declare namespace Express {
  interface Request {
    user?: { id: number; role: 'admin' | 'staff' };
  }
}
