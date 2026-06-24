import admin from "firebase-admin";
import { logger } from "./logger";

const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT"];

if (!serviceAccountJson) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT environment variable is required but was not provided."
  );
}

let serviceAccount: admin.ServiceAccount;
try {
  // Handle cases where the JSON might be base64-encoded or have escaped newlines
  let raw = serviceAccountJson.trim();
  // If it looks base64 (no braces), try decoding
  if (!raw.startsWith("{")) {
    raw = Buffer.from(raw, "base64").toString("utf-8").trim();
  }
  // Unescape newlines in private_key that some tools add
  serviceAccount = JSON.parse(raw) as admin.ServiceAccount;
} catch (err) {
  const preview = serviceAccountJson.slice(0, 80);
  throw new Error(
    `FIREBASE_SERVICE_ACCOUNT is not valid JSON. First 80 chars: ${preview}\nOriginal error: ${String(err)}`
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  logger.info("Firebase Admin initialized");
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
