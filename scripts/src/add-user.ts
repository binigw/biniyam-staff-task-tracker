/**
 * Add a single user to Firebase Auth with a role.
 * Usage: EMAIL=x@y.com PASSWORD=secret ROLE=admin pnpm --filter @workspace/scripts run add-user
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT"];
if (!serviceAccountJson) { console.error("FIREBASE_SERVICE_ACCOUNT required"); process.exit(1); }

if (getApps().length === 0) {
  initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
}

const auth = getAuth();

const email = process.env["EMAIL"] ?? "";
const password = process.env["PASSWORD"] ?? "";
const displayName = process.env["DISPLAY_NAME"] ?? email.split("@")[0];
const role = (process.env["ROLE"] ?? "admin") as "admin" | "staff";

if (!email || !password) {
  console.error("EMAIL and PASSWORD env vars required");
  process.exit(1);
}

async function main() {
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    await auth.updateUser(uid, { displayName, password });
    console.log(`✓ Updated existing user: ${email} (${uid})`);
  } catch {
    const created = await auth.createUser({ email, password, displayName });
    uid = created.uid;
    console.log(`✓ Created user: ${email} (${uid})`);
  }
  await auth.setCustomUserClaims(uid, { role });
  console.log(`  → role=${role}, displayName=${displayName}`);
  console.log(`\n✅ Done! You can now sign in with ${email}`);
}

main().catch((err) => { console.error("Failed:", err.message); process.exit(1); });
