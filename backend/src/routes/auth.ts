import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

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
    }).json({ message: "Sign up successful" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.select().from(users).where(eq(users.username, username));
    if (user.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user[0].passwordHash);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user[0].id, username: user[0].username }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }).json({ message: "Logout successful" });
});

import { Request } from "express";

router.get("/me", authenticateToken, async (req: Request, res) => {
  try {
    const user = await db.select({ id: users.id, username: users.username, createdAt: users.createdAt }).from(users).where(eq(users.id, (req as AuthRequest).user!.userId));
    if (user.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
