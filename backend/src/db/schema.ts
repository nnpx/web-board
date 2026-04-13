import { pgTable, serial, varchar, text, timestamp, integer, uuid, AnyPgColumn } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  description: text("description"),
});

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

export const replies = pgTable("replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): AnyPgColumn => replies.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
