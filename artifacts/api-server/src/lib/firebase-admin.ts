import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { logger } from "./logger";

const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT"];

if (!serviceAccountJson) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT environment variable is required but was not provided."
  );
}

let serviceAccount: Record<string, unknown>;
try {
  let raw = serviceAccountJson.trim();
  if (!raw.startsWith("{")) {
    raw = Buffer.from(raw, "base64").toString("utf-8").trim();
  }
  serviceAccount = JSON.parse(raw) as Record<string, unknown>;
} catch (err) {
  const preview = serviceAccountJson.slice(0, 80);
  throw new Error(
    `FIREBASE_SERVICE_ACCOUNT is not valid JSON. First 80 chars: ${preview}\nOriginal error: ${String(err)}`
  );
}

let app: App;
if (getApps().length === 0) {
  app = initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
  logger.info("Firebase Admin initialized");
} else {
  app = getApps()[0]!;
}

export const db = getFirestore(app);
export const auth = getAuth(app);
