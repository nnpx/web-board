import { Router } from "express";
import { db } from "../db";
import { rooms } from "../db/schema";
import { asc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allRooms = await db.select().from(rooms).orderBy(asc(rooms.id));
    res.json(allRooms);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
