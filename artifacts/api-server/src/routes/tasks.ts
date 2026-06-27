import { Router } from "express";
import { db, auth } from "../lib/firebase-admin";
import { requireAuth, type AuthRequest } from "./auth-middleware";
import {
  ListTasksQueryParams,
  CreateTaskBody,
  UpdateTaskBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();
const TASKS = "tasks";

router.get("/tasks", requireAuth, async (req: AuthRequest, res) => {
  try {
    const qp = ListTasksQueryParams.safeParse(req.query);
    const filters = qp.success ? qp.data : {};

    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";

    let query: FirebaseFirestore.Query = db.collection(TASKS);

    if (role !== "admin") {
      query = query.where("assigneeId", "==", uid);
    } else {
      if (filters.assigneeId) query = query.where("assigneeId", "==", filters.assigneeId);
    }
    if (filters.status) query = query.where("status", "==", filters.status);
    if (filters.priority) query = query.where("priority", "==", filters.priority);

    query = query.orderBy("createdAt", "desc");
    const snap = await query.get();
    const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(tasks);
  } catch (err) {
    logger.error({ err }, "listTasks error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tasks", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";
    if (role !== "admin") {
      res.status(403).json({ error: "Only admins can create tasks" });
      return;
    }
    const parsed = CreateTaskBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const data = {
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(TASKS).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    logger.error({ err }, "createTask error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tasks/:taskId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params as { taskId: string };
    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";

    const doc = await db.collection(TASKS).doc(taskId).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const task = { id: doc.id, ...doc.data() } as unknown as { assigneeId: string; [key: string]: unknown };
    if (role !== "admin" && task.assigneeId !== uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(task);
  } catch (err) {
    logger.error({ err }, "getTask error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tasks/:taskId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params as { taskId: string };
    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";

    const doc = await db.collection(TASKS).doc(taskId).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const task = doc.data() as { assigneeId: string; [key: string]: unknown };
    if (role !== "admin" && task.assigneeId !== uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = UpdateTaskBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    // Staff can only update status
    let update = parsed.data;
    if (role === "staff") {
      update = { status: parsed.data.status };
    }

    await db.collection(TASKS).doc(taskId).update(update as Record<string, unknown>);
    const updated = await db.collection(TASKS).doc(taskId).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    logger.error({ err }, "updateTask error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tasks/:taskId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params as { taskId: string };
    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";
    if (role !== "admin") {
      res.status(403).json({ error: "Only admins can delete tasks" });
      return;
    }
    await db.collection(TASKS).doc(taskId).delete();
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "deleteTask error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
