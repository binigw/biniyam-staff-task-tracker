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
  serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
} catch {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
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
