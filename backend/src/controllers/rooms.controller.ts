import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { rooms } from "../db/schema";
import { asc } from "drizzle-orm";

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allRooms = await db.select().from(rooms).orderBy(asc(rooms.id));
    res.json(allRooms);
  } catch (err) {
    next(err);
  }
};
