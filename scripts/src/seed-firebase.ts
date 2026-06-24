/**
 * Seed script: creates Firebase Auth users with roles and sample Firestore tasks.
 * Run with: pnpm --filter @workspace/scripts run seed
 */
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { cert } from "firebase-admin/app";

const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT"];
if (!serviceAccountJson) {
  console.error("FIREBASE_SERVICE_ACCOUNT env var required");
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJson);

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}

const auth = getAuth();
const db = getFirestore();

const USERS = [
  { email: "admin@stafftracker.demo", password: "Admin1234!", displayName: "Alex Admin", role: "admin" },
  { email: "sarah@stafftracker.demo", password: "Staff1234!", displayName: "Sarah Chen", role: "staff" },
  { email: "james@stafftracker.demo", password: "Staff1234!", displayName: "James Park", role: "staff" },
  { email: "priya@stafftracker.demo", password: "Staff1234!", displayName: "Priya Sharma", role: "staff" },
];

async function upsertUser(u: typeof USERS[0]) {
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(u.email);
    uid = existing.uid;
    await auth.updateUser(uid, { displayName: u.displayName, password: u.password });
    console.log(`✓ Updated user: ${u.email} (${uid})`);
  } catch {
    const created = await auth.createUser({
      email: u.email,
      password: u.password,
      displayName: u.displayName,
    });
    uid = created.uid;
    console.log(`✓ Created user: ${u.email} (${uid})`);
  }
  await auth.setCustomUserClaims(uid, { role: u.role });
  console.log(`  → role=${u.role}`);
  return { uid, ...u };
}

async function seedTasks(users: Array<{ uid: string; displayName: string; role: string }>) {
  const staffUsers = users.filter((u) => u.role === "staff");
  const now = new Date();
  const day = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  };

  const tasks = [
    {
      title: "Update company website homepage",
      description: "Refresh the hero section with new copy and imagery for Q3.",
      assigneeId: staffUsers[0]?.uid ?? "",
      assigneeName: staffUsers[0]?.displayName ?? "",
      priority: "High",
      status: "In Progress",
      dueDate: day(3),
    },
    {
      title: "Prepare monthly sales report",
      description: "Compile sales data from CRM and create the executive summary.",
      assigneeId: staffUsers[1]?.uid ?? "",
      assigneeName: staffUsers[1]?.displayName ?? "",
      priority: "High",
      status: "To Do",
      dueDate: day(1),
    },
    {
      title: "Respond to customer support tickets",
      description: "Clear the backlog of 12 open support tickets.",
      assigneeId: staffUsers[2]?.uid ?? "",
      assigneeName: staffUsers[2]?.displayName ?? "",
      priority: "Medium",
      status: "In Progress",
      dueDate: day(2),
    },
    {
      title: "Set up onboarding docs for new hires",
      description: "Create the onboarding checklist and Notion page.",
      assigneeId: staffUsers[0]?.uid ?? "",
      assigneeName: staffUsers[0]?.displayName ?? "",
      priority: "Medium",
      status: "To Do",
      dueDate: day(7),
    },
    {
      title: "Review Q2 vendor contracts",
      description: "Check renewal dates and flag any contracts expiring in Q3.",
      assigneeId: staffUsers[1]?.uid ?? "",
      assigneeName: staffUsers[1]?.displayName ?? "",
      priority: "Low",
      status: "Done",
      dueDate: day(-2),
    },
    {
      title: "Fix checkout bug on mobile",
      description: "Users on iOS report the checkout button is unresponsive.",
      assigneeId: staffUsers[2]?.uid ?? "",
      assigneeName: staffUsers[2]?.displayName ?? "",
      priority: "High",
      status: "To Do",
      dueDate: day(-1),
    },
    {
      title: "Schedule team lunch for July",
      description: "Book a restaurant and send calendar invites to all staff.",
      assigneeId: staffUsers[0]?.uid ?? "",
      assigneeName: staffUsers[0]?.displayName ?? "",
      priority: "Low",
      status: "Done",
      dueDate: day(5),
    },
    {
      title: "Audit social media accounts",
      description: "Review follower counts, post performance, and update bio links.",
      assigneeId: staffUsers[1]?.uid ?? "",
      assigneeName: staffUsers[1]?.displayName ?? "",
      priority: "Low",
      status: "In Progress",
      dueDate: day(4),
    },
  ];

  // Clear existing tasks
  const existingSnap = await db.collection("tasks").get();
  for (const doc of existingSnap.docs) {
    await doc.ref.delete();
  }
  console.log(`\nCleared ${existingSnap.size} existing tasks`);

  for (const task of tasks) {
    const ref = await db.collection("tasks").add({
      ...task,
      createdAt: new Date().toISOString(),
    });
    console.log(`✓ Task created: "${task.title}" → ${task.assigneeName} [${task.status}]`);

    // Add a sample comment to first task
    if (task.title === "Update company website homepage") {
      await ref.collection("comments").add({
        taskId: ref.id,
        authorId: staffUsers[0]?.uid ?? "",
        authorName: staffUsers[0]?.displayName ?? "",
        text: "I've started on the hero section mockup, should have a draft ready by tomorrow.",
        createdAt: new Date().toISOString(),
      });
    }
  }
}

async function main() {
  console.log("🌱 Seeding Firebase...\n");
  const seededUsers = [];
  for (const u of USERS) {
    const result = await upsertUser(u);
    seededUsers.push(result);
  }
  await seedTasks(seededUsers);

  console.log("\n✅ Seed complete!\n");
  console.log("Demo login credentials:");
  console.log("  Admin:  admin@stafftracker.demo  / Admin1234!");
  console.log("  Staff:  sarah@stafftracker.demo  / Staff1234!");
  console.log("  Staff:  james@stafftracker.demo  / Staff1234!");
  console.log("  Staff:  priya@stafftracker.demo  / Staff1234!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
