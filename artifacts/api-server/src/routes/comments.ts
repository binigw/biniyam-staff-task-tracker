import { Router } from "express";
import { db, auth } from "../lib/firebase-admin";
import { requireAuth, type AuthRequest } from "./auth-middleware";
import { AddCommentBody } from "@workspace/api-zod";

const router = Router();

router.get("/tasks/:taskId/comments", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params as { taskId: string };
    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";

    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const task = taskDoc.data() as { assigneeId: string };
    if (role !== "admin" && task.assigneeId !== uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const snap = await db
      .collection("tasks")
      .doc(taskId)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .get();
    const comments = snap.docs.map((d) => ({ id: d.id, taskId, ...d.data() }));
    res.json(comments);
  } catch (err) {
    req.log.error({ err }, "listComments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tasks/:taskId/comments", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params as { taskId: string };
    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";

    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const task = taskDoc.data() as { assigneeId: string };
    if (role !== "admin" && task.assigneeId !== uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = AddCommentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const displayName = fbUser.displayName ?? fbUser.email ?? "Unknown";
    const data = {
      taskId,
      authorId: uid,
      authorName: displayName,
      text: parsed.data.text,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("tasks").doc(taskId).collection("comments").add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    req.log.error({ err }, "addComment error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
