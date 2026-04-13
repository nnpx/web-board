import { pgTable, integer, varchar, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { rooms } from "./rooms";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  viewsCount: integer("views_count").default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});
