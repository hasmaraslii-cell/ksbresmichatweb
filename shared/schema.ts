import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  rank: text("rank").default("Aday"),
  role: text("role").default("user"), // 'admin' | 'user'
  isCore: boolean("is_core").default(false),
  coreExpiry: timestamp("core_expiry"),
  biography: text("biography"),
  profileAnimation: text("profile_animation"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fanarts = pgTable("fanarts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  fanarts: many(fanarts),
  sentDms: many(directMessages, { relationName: "sentDms" }),
  receivedDms: many(directMessages, { relationName: "receivedDms" }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const fanartsRelations = relations(fanarts, ({ one }) => ({
  user: one(users, {
    fields: [fanarts.userId],
    references: [users.id],
  }),
}));

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
    relationName: "sentDms",
  }),
  receiver: one(users, {
    fields: [directMessages.receiverId],
    references: [users.id],
    relationName: "receivedDms",
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatarUrl: true,
  rank: true,
  role: true,
  isCore: true,
  coreExpiry: true,
  biography: true,
  profileAnimation: true,
}).extend({
  password: z.string().min(6).optional(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  imageUrl: true,
});

export const insertFanartSchema = createInsertSchema(fanarts).pick({
  imageUrl: true,
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).pick({
  receiverId: true,
  content: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Fanart = typeof fanarts.$inferSelect;
export type DirectMessage = typeof directMessages.$inferSelect;

export type MessageWithUser = Message & { user: User };
