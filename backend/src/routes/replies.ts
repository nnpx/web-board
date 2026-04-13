import { Router, Request } from "express";
import { db } from "../db";
import { replies } from "../db/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq } from "drizzle-orm";

const router = Router();

router.put("/:id", authenticateToken, async (req: Request, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as AuthRequest).user!.userId;

    const reply = await db.select().from(replies).where(eq(replies.id, id as string));
    if (reply.length === 0) return res.status(404).json({ error: "Reply not found" });
    if (reply[0].userId !== userId) return res.status(403).json({ error: "Unauthorized: You do not own this reply." });

    const updated = await db.update(replies).set({ content }).where(eq(replies.id, id as string)).returning();
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticateToken, async (req: Request, res) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;

    const reply = await db.select().from(replies).where(eq(replies.id, id as string));
    if (reply.length === 0) return res.status(404).json({ error: "Reply not found" });
    if (reply[0].userId !== userId) return res.status(403).json({ error: "Unauthorized: You do not own this reply." });

    await db.delete(replies).where(eq(replies.id, id as string));
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
