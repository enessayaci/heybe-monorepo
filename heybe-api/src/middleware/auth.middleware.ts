import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../services/user.service';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    is_guest: boolean;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token gereklidir'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      is_guest: user.is_guest || false
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token'
    });
  }
};