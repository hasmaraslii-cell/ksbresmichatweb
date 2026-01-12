import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import { hashPassword } from "./auth";

async function seedDatabase() {
  const existingUser = await storage.getUserByUsername("Raith1905");
  if (!existingUser) {
    const raithPass = await hashPassword("Ksb_84_Z0Rd_X99_Phantom_Op_2026!#");
    await storage.createUser({
      username: "Raith1905",
      password: raithPass,
      displayName: "Raith",
      rank: "Kurucu",
      role: "admin",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Raith1905",
    });
    
    const yakefPass = await hashPassword("L3mAxIf$TR!x");
    await storage.createUser({
      username: "YAKEFBALL",
      password: yakefPass,
      displayName: "Yakef Ball",
      rank: "Başlider",
      role: "admin",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=YAKEFBALL",
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize Auth (Local Strategy)
  setupAuth(app);

  // Seed on startup
  seedDatabase().catch(console.error);

  // Users
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch(api.users.toggleDelete.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).send("User not found");
    
    const updated = await storage.updateUser(userId, { isDeleted: !user.isDeleted });
    res.json(updated);
  });

  app.patch(api.auth.updateProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const updates = { ...req.body };
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }
      const updated = await storage.updateUser((req.user as any).id, updates);
      res.json(updated);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  // Chat
  app.get(api.chat.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    if (req.user.role === 'admin') {
       // Admins see everything for moderation
       const messages = await storage.getAllMessagesIncludingDeleted();
       res.json(messages);
    } else {
       // Users see only active messages
       const messages = await storage.getMessages();
       res.json(messages);
    }
  });

  app.post(api.chat.send.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    // Spam check
    const lastMessages = await storage.getMessages();
    const userLastMessages = lastMessages.filter(m => m.userId === (req.user as any).id).slice(-3);
    if (userLastMessages.length === 3 && userLastMessages.every(m => m.content === req.body.content)) {
      return res.status(429).send("Spam engellendi. Lütfen farklı bir mesaj gönderin.");
    }

    const message = await storage.createMessage((req.user as any).id, {
      content: req.body.content,
      imageUrl: req.body.imageUrl,
    });
    res.status(201).json(message);
  });

  app.delete(api.chat.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    await storage.deleteMessage(parseInt(req.params.id));
    res.json({ message: "Deleted" });
  });

  app.patch(api.chat.restore.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    await storage.restoreMessage(parseInt(req.params.id));
    res.json({ message: "Restored" });
  });

  return httpServer;
}
