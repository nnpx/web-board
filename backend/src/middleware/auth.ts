import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    (req as AuthRequest).user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};
