import { Router } from "express";
import { db } from "../db";
import { posts, replies, users, rooms } from "../db/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { Request } from "express";
import { and, eq, ilike, or, desc, sql, asc } from "drizzle-orm";

const router = Router();

router.post("/", authenticateToken, async (req: Request, res) => {
  try {
    const { title, content, roomId, tags } = req.body;
    const userId = (req as AuthRequest).user!.userId;

    if (!title || !content || !roomId) {
      return res.status(400).json({ error: "Title, content and roomId are required." });
    }

    const newPost = await db.insert(posts).values({
      title,
      content,
      roomId: parseInt(roomId),
      userId,
      tags
    }).returning();
    res.json(newPost[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { roomId, search } = req.query;
    let conditions = [];

    if (roomId) {
      conditions.push(eq(posts.roomId, parseInt(roomId as string)));
    }
    if (search) {
      const searchStr = `%${search}%`;
      conditions.push(
        or(
          ilike(posts.title, searchStr),
          ilike(posts.content, searchStr)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allPosts = await db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      viewsCount: posts.viewsCount,
      createdAt: posts.createdAt,
      roomId: posts.roomId,
      userId: posts.userId,
      username: users.username,
      roomName: rooms.name
    })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(rooms, eq(posts.roomId, rooms.id))
      .where(whereClause)
      .orderBy(desc(posts.createdAt));

    res.json(allPosts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Increment views
    await db.update(posts).set({ viewsCount: sql`${posts.viewsCount} + 1` }).where(eq(posts.id, id));

    const post = await db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      viewsCount: posts.viewsCount,
      createdAt: posts.createdAt,
      roomId: posts.roomId,
      userId: posts.userId,
      username: users.username,
      roomName: rooms.name
    })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(rooms, eq(posts.roomId, rooms.id))
      .where(eq(posts.id, id));

    if (post.length === 0) return res.status(404).json({ error: "Post not found" });

    res.json(post[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticateToken, async (req: Request, res) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.userId;

    const post = await db.select().from(posts).where(eq(posts.id, id));
    if (post.length === 0) return res.status(404).json({ error: "Post not found" });
    if (post[0].userId !== userId) return res.status(403).json({ error: "You can only delete your own post" });

    await db.delete(posts).where(eq(posts.id, id));
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Replies endpoints
router.get("/:postId/replies", async (req, res) => {
  try {
    const { postId } = req.params;
    const allReplies = await db.select({
      id: replies.id,
      content: replies.content,
      createdAt: replies.createdAt,
      userId: replies.userId,
      parentId: replies.parentId,
      username: users.username
    })
      .from(replies)
      .leftJoin(users, eq(replies.userId, users.id))
      .where(eq(replies.postId, postId))
      .orderBy(asc(replies.createdAt));

    res.json(allReplies);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:postId/replies", authenticateToken, async (req: Request, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = (req as AuthRequest).user!.userId;

    if (!content) return res.status(400).json({ error: "Content is required" });

    const newReply = await db.insert(replies).values({
      postId: postId as string,
      userId,
      parentId: parentId || null,
      content
    }).returning();
    res.json(newReply[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
