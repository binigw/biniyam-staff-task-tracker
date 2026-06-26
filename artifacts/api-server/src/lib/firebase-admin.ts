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

function sanitizeJsonString(s: string): string {
  return (
    s
      // Replace Unicode smart/curly double quotes
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
      // Replace Unicode smart/curly single quotes
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
      // Replace all Unicode whitespace variants (non-breaking space, zero-width space,
      // thin space, en/em space, etc.) with a regular ASCII space
      .replace(/[\u00A0\u200B\u200C\u200D\u2028\u2029\u202F\u205F\u3000\uFEFF\u00AD]/g, " ")
      // Strip zero-width invisible characters that don't render
      .replace(/[\u200E\u200F\u202A-\u202E]/g, "")
      .trim()
  );
}

let serviceAccount: Record<string, unknown>;
try {
  let raw = sanitizeJsonString(serviceAccountJson);
  if (!raw.startsWith("{")) {
    raw = sanitizeJsonString(Buffer.from(raw, "base64").toString("utf-8"));
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
