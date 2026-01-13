import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";

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
      isCore: true,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Raith1905",
    } as any);
    
    const yakefPass = await hashPassword("L3mAxIf$TR!x");
    await storage.createUser({
      username: "YAKEFBALL",
      password: yakefPass,
      displayName: "Yakef Ball",
      rank: "Başlider",
      role: "admin",
      isCore: true,
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=YAKEFBALL",
    } as any);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  seedDatabase().catch(console.error);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Map<number, WebSocket>();

  wss.on("connection", (ws, req) => {
    // This is a simplified WS setup. In production, we'd use session data.
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "auth") {
          clients.set(message.userId, ws);
        } else if (message.type === "dm") {
          const dm = await storage.createDirectMessage(message.senderId, message.receiverId, message.content);
          const receiverWs = clients.get(message.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({ type: "dm", ...dm }));
          }
          ws.send(JSON.stringify({ type: "dm_sent", ...dm }));
        }
      } catch (err) {
        console.error("WS Message error:", err);
      }
    });

    ws.on("close", () => {
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });

  // Users
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch("/api/admin/gift-core/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    const userId = parseInt(req.params.id);
    const updated = await storage.updateUser(userId, { 
      isCore: true, 
      coreExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    });
    res.json(updated);
  });

  app.get("/api/admin/fanarts", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    const fanarts = await storage.getPendingFanarts();
    res.json(fanarts);
  });

  app.patch("/api/admin/fanarts/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const fanart = await storage.updateFanartStatus(id, status);
    
    if (status === "approved") {
      await storage.updateUser(fanart.userId, { 
        isCore: true, 
        coreExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      });
    }
    res.json(fanart);
  });

  app.post("/api/fanarts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const fanart = await storage.createFanart((req.user as any).id, req.body.imageUrl);
    res.status(201).json(fanart);
  });

  app.get("/api/dms/:otherId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const messages = await storage.getDirectMessages((req.user as any).id, parseInt(req.params.otherId));
    res.json(messages);
  });

  // Chat
  app.get(api.chat.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    if ((req.user as any).role === 'admin') {
       const messages = await storage.getAllMessagesIncludingDeleted();
       res.json(messages);
    } else {
       const messages = await storage.getMessages();
       res.json(messages);
    }
  });

  app.post(api.chat.send.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
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
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const id = parseInt(req.params.id);
    const msg = await storage.getMessage(id);
    if (!msg) return res.status(404).send("Message not found");

    if (msg.userId !== (req.user as any).id && (req.user as any).role !== 'admin') {
      return res.status(403).send("Forbidden");
    }

    await storage.deleteMessage(id);
    res.json({ message: "Deleted" });
  });

  app.patch(api.chat.restore.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).send("Unauthorized");
    }
    await storage.restoreMessage(parseInt(req.params.id));
    res.json({ message: "Restored" });
  });

  app.patch(api.auth.updateProfile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const updates = { ...req.body };
      delete (updates as any).id;
      delete (updates as any).username;
      delete (updates as any).role;
      delete (updates as any).rank;
      delete (updates as any).isCore;
      delete (updates as any).coreExpiry;
      delete (updates as any).createdAt;

      if (updates.password && updates.password.trim() !== "") {
        updates.password = await hashPassword(updates.password);
      } else {
        delete updates.password;
      }
      
      const userId = (req.user as any).id;
      const updated = await storage.updateUser(userId, updates);
      Object.assign(req.user as any, updated);
      res.json(updated);
    } catch (err: any) {
      console.error("Profile update error:", err);
      res.status(400).send(err.message || "Güncelleme başarısız");
    }
  });

  return httpServer;
}
