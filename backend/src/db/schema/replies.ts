import { pgTable, text, timestamp, uuid, AnyPgColumn } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";

export const replies = pgTable("replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => replies.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
