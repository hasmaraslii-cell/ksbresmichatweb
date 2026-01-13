import { db } from "./db";
import { users, messages, fanarts, directMessages, type User, type InsertUser, type Message, type InsertMessage, type Fanart, type DirectMessage } from "@shared/schema";
import { eq, desc, asc, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Chat operations
  getMessages(): Promise<(Message & { user: User })[]>;
  createMessage(userId: number, message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  restoreMessage(id: number): Promise<void>;
  getAllMessagesIncludingDeleted(): Promise<(Message & { user: User })[]>;

  // Fanart operations
  getPendingFanarts(): Promise<(Fanart & { user: User })[]>;
  createFanart(userId: number, imageUrl: string): Promise<Fanart>;
  updateFanartStatus(id: number, status: string): Promise<Fanart>;

  // DM operations
  getDirectMessages(user1Id: number, user2Id: number): Promise<DirectMessage[]>;
  createDirectMessage(senderId: number, receiverId: number, content: string): Promise<DirectMessage>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const updateData = { ...updates };
    delete (updateData as any).id;
    delete (updateData as any).createdAt;

    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) throw new Error("User not found during update");
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isDeleted, false)).orderBy(desc(users.createdAt));
  }

  async getMessages(): Promise<(Message & { user: User })[]> {
    return await db.query.messages.findMany({
      where: eq(messages.isDeleted, false),
      with: { user: true },
      orderBy: [asc(messages.createdAt)],
      limit: 100
    });
  }

  async getAllMessagesIncludingDeleted(): Promise<(Message & { user: User })[]> {
    return await db.query.messages.findMany({
      with: { user: true },
      orderBy: [asc(messages.createdAt)],
      limit: 200
    });
  }

  async createMessage(userId: number, message: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values({
      content: message.content,
      imageUrl: message.imageUrl || null,
      userId,
    }).returning();
    return msg;
  }

  async deleteMessage(id: number): Promise<void> {
    await db.update(messages).set({ isDeleted: true }).where(eq(messages.id, id));
  }

  async restoreMessage(id: number): Promise<void> {
    await db.update(messages).set({ isDeleted: false }).where(eq(messages.id, id));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [msg] = await db.select().from(messages).where(eq(messages.id, id));
    return msg;
  }

  async getPendingFanarts(): Promise<(Fanart & { user: User })[]> {
    return await db.query.fanarts.findMany({
      where: eq(fanarts.status, "pending"),
      with: { user: true },
      orderBy: [desc(fanarts.createdAt)]
    });
  }

  async getApprovedFanarts(): Promise<(Fanart & { user: User })[]> {
    return await db.query.fanarts.findMany({
      where: eq(fanarts.status, "approved"),
      with: { user: true },
      orderBy: [desc(fanarts.createdAt)]
    });
  }

  async createFanart(userId: number, imageUrl: string): Promise<Fanart> {
    const [fanart] = await db.insert(fanarts).values({ userId, imageUrl, status: "pending" }).returning();
    return fanart;
  }

  async updateFanartStatus(id: number, status: string): Promise<Fanart> {
    const [fanart] = await db.update(fanarts).set({ status }).where(eq(fanarts.id, id)).returning();
    return fanart;
  }

  async getDirectMessages(user1Id: number, user2Id: number): Promise<DirectMessage[]> {
    return await db.select().from(directMessages)
      .where(or(
        and(eq(directMessages.senderId, user1Id), eq(directMessages.receiverId, user2Id)),
        and(eq(directMessages.senderId, user2Id), eq(directMessages.receiverId, user1Id))
      ))
      .orderBy(asc(directMessages.createdAt));
  }

  async createDirectMessage(senderId: number, receiverId: number, content: string): Promise<DirectMessage> {
    const [dm] = await db.insert(directMessages).values({ senderId, receiverId, content }).returning();
    return dm;
  }
}

export const storage = new DatabaseStorage();
