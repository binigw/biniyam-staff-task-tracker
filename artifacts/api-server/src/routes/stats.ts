import { Router } from "express";
import { db, auth } from "../lib/firebase-admin";
import { requireAuth, type AuthRequest } from "./auth-middleware";

const router = Router();

router.get("/stats/overview", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.uid!;
    const fbUser = await auth.getUser(uid);
    const role = (fbUser.customClaims?.["role"] as string) ?? "staff";
    if (role !== "admin") {
      res.status(403).json({ error: "Admin only" });
      return;
    }

    const snap = await db.collection("tasks").get();
    const now = new Date();
    const byPriority = { High: 0, Medium: 0, Low: 0 };
    const byAssigneeMap: Record<string, { assigneeName: string; total: number; completed: number; active: number }> = {};
    let totalTasks = 0, activeTasks = 0, completedTasks = 0, overdueTasks = 0;

    for (const doc of snap.docs) {
      const t = doc.data() as {
        status: string; priority: string; assigneeId: string; assigneeName: string; dueDate?: string;
      };
      totalTasks++;
      if (t.status === "Done") completedTasks++;
      else activeTasks++;
      if (t.dueDate && new Date(t.dueDate) < now && t.status !== "Done") overdueTasks++;
      if (t.priority in byPriority) byPriority[t.priority as keyof typeof byPriority]++;

      if (!byAssigneeMap[t.assigneeId]) {
        byAssigneeMap[t.assigneeId] = { assigneeName: t.assigneeName, total: 0, completed: 0, active: 0 };
      }
      byAssigneeMap[t.assigneeId].total++;
      if (t.status === "Done") byAssigneeMap[t.assigneeId].completed++;
      else byAssigneeMap[t.assigneeId].active++;
    }

    const byAssignee = Object.entries(byAssigneeMap).map(([assigneeId, v]) => ({
      assigneeId,
      ...v,
    }));

    res.json({ totalTasks, activeTasks, completedTasks, overdueTasks, byPriority, byAssignee });
  } catch (err) {
    req.log.error({ err }, "getOverviewStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/my", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.uid!;
    const snap = await db.collection("tasks").where("assigneeId", "==", uid).get();
    const now = new Date();
    let todo = 0, inProgress = 0, done = 0, overdue = 0;

    for (const doc of snap.docs) {
      const t = doc.data() as { status: string; dueDate?: string };
      if (t.status === "To Do") todo++;
      else if (t.status === "In Progress") inProgress++;
      else if (t.status === "Done") done++;
      if (t.dueDate && new Date(t.dueDate) < now && t.status !== "Done") overdue++;
    }

    res.json({ totalAssigned: snap.size, todo, inProgress, done, overdue });
  } catch (err) {
    req.log.error({ err }, "getMyStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
