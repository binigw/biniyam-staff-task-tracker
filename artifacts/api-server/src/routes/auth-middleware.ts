import { type Request, type Response, type NextFunction } from "express";
import { auth } from "../lib/firebase-admin";

export interface AuthRequest extends Request {
  uid?: string;
  userRole?: "admin" | "staff";
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: missing token" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized: invalid token" });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const user = await auth.getUser(req.uid);
    const role = (user.customClaims?.["role"] as string) ?? "staff";
    if (role !== "admin") {
      res.status(403).json({ error: "Forbidden: admin only" });
      return;
    }
    req.userRole = "admin";
    next();
  } catch {
    res.status(403).json({ error: "Forbidden" });
  }
}
