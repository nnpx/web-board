import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

const signupSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric only"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = signupSchema.parse(req.body);

    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) return res.status(400).json({ error: "Username already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.insert(users).values({ username, passwordHash }).returning();
    const token = jwt.sign({ userId: newUser[0].id, username: newUser[0].username }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({
      message: "Sign up successful",
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        createdAt: newUser[0].createdAt
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const user = await db.select().from(users).where(eq(users.username, username));
    const userFound = user.length > 0;

    const validPassword = await bcrypt.compare(
      password,
      userFound ? user[0].passwordHash : "$2b$10$dummyHashStringToMitigateTimingAttacks"
    );

    if (!userFound || !validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user[0].id, username: user[0].username }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({
      message: "Login successful",
      user: {
        id: user[0].id,
        username: user[0].username,
        createdAt: user[0].createdAt
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    next(err);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }).json({ message: "Logout successful" });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db.select({
      id: users.id,
      username: users.username,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, (req as AuthRequest).user!.userId));
    if (user.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(user[0]);
  } catch (err) {
    next(err);
  }
};
