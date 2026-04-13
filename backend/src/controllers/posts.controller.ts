import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { posts, replies, users, rooms } from "../db/schema";
import { AuthRequest } from "../middleware/auth";
import { and, eq, ilike, or, desc, sql, asc } from "drizzle-orm";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
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
    next(err);
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, search, sort = "latest" } = req.query;
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
    let orderByLogic = desc(posts.createdAt);
    if (sort === "popular") orderByLogic = desc(posts.viewsCount);
    
    let query = db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      viewsCount: posts.viewsCount,
      createdAt: posts.createdAt,
      roomId: posts.roomId,
      userId: posts.userId,
      username: users.username,
      roomName: rooms.name,
      repliesCount: sql<number>`count(${replies.id})`.mapWith(Number)
    })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(rooms, eq(posts.roomId, rooms.id))
      .leftJoin(replies, eq(posts.id, replies.postId))
      .where(whereClause)
      .groupBy(posts.id, users.username, rooms.name)
      .orderBy(orderByLogic);

    if (sort === "unanswered") {
      query = query.having(eq(sql`count(${replies.id})`, 0)) as any;
    }

    const allPosts = await query;
    res.json(allPosts);
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

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
    next(err);
  }
};

export const viewPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await db.update(posts).set({ viewsCount: sql`${posts.viewsCount} + 1` }).where(eq(posts.id, id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = (req as AuthRequest).user!.userId;

    const post = await db.select().from(posts).where(eq(posts.id, id));
    if (post.length === 0) return res.status(404).json({ error: "Post not found" });
    if (post[0].userId !== userId) return res.status(403).json({ error: "You can only delete your own post" });

    await db.delete(posts).where(eq(posts.id, id));
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getPostReplies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.postId as string;
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
    next(err);
  }
};

export const createPostReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.postId as string;
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
    next(err);
  }
};
