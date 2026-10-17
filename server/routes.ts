import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSignupSchema, insertBusinessSignupSchema } from "@shared/schema";
import { appendSignupToSheet, appendBusinessSignupToSheet } from "./google-sheets";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // /get-started has never been a route on this site, so older blog and
  // campaign links to it 404'd. Send them to the app's sign-up instead.
  app.get("/get-started", (_req: Request, res: Response) => {
    res.redirect(302, "https://lesser.tax/app/auth/sign-up");
  });

  app.post("/api/signups", async (req: Request, res: Response) => {
    const parsed = insertSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const signup = await storage.createSignup(parsed.data);
    try {
      await appendSignupToSheet(signup);
    } catch (err) {
      console.error("[Signup] Google Sheets write failed, lead saved in memory only:", err);
    }
    res.status(201).json(signup);
  });

  app.post("/api/business-signups", async (req: Request, res: Response) => {
    const parsed = insertBusinessSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const signup = await storage.createBusinessSignup(parsed.data);
    try {
      await appendBusinessSignupToSheet(signup);
    } catch (err) {
      console.error("[Signup] Google Sheets write failed for business lead:", err);
    }
    res.status(201).json(signup);
  });

  return httpServer;
}
