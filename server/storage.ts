import { db } from "./db";
import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { eq, desc, asc, and } from "drizzle-orm";

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
    const { id: _, password, ...updateData } = updates as any;
    
    // Create the safe update object
    const finalUpdate: any = { ...updateData };
    if (password) {
      finalUpdate.password = password;
    }

    const [user] = await db.update(users).set(finalUpdate).where(eq(users.id, id)).returning();
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
      imageUrl: message.imageUrl,
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
}

export const storage = new DatabaseStorage();
