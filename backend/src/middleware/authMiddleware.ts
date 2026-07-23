import { Request, Response, NextFunction } from 'express';
import Employee from '../models/Employee.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'employee';
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization token missing or invalid' });
      return;
    }

    const token = authHeader.split(' ')[1];
    let decoded: string;
    try {
      decoded = Buffer.from(token, 'base64').toString('ascii');
    } catch (err) {
      res.status(401).json({ message: 'Malformed authorization token' });
      return;
    }

    const [userId, role] = decoded.split(':');
    if (!userId || !role) {
      res.status(401).json({ message: 'Invalid session token payload' });
      return;
    }

    // Optional: Verify user still exists in DB
    const userExists = await Employee.exists({ _id: userId });
    if (!userExists) {
      res.status(401).json({ message: 'Session owner does not exist' });
      return;
    }

    req.user = {
      id: userId,
      role: role as 'admin' | 'employee'
    };

    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Internal auth middleware error', error: error.message });
  }
};

export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied: Administrative privileges required' });
    return;
  }
  next();
};
