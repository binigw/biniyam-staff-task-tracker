import { Router } from "express";
import { auth } from "../lib/firebase-admin";
import { requireAuth, type AuthRequest } from "./auth-middleware";

const router = Router();

router.get("/users", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.uid!;
    const requestingUser = await auth.getUser(uid);
    const requestingRole = (requestingUser.customClaims?.["role"] as string) ?? "staff";

    if (requestingRole !== "admin") {
      // Staff can still see user list (needed for auth-context role detection),
      // but we just return their own record
      const self = {
        id: requestingUser.uid,
        email: requestingUser.email ?? "",
        displayName: requestingUser.displayName ?? requestingUser.email ?? "Unknown",
        role: requestingRole,
        photoURL: requestingUser.photoURL ?? null,
      };
      res.json([self]);
      return;
    }

    const listResult = await auth.listUsers(1000);
    const users = listResult.users.map((u) => ({
      id: u.uid,
      email: u.email ?? "",
      displayName: u.displayName ?? u.email ?? "Unknown",
      role: (u.customClaims?.["role"] as string) ?? "staff",
      photoURL: u.photoURL ?? null,
    }));
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "listUsers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
