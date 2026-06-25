import { createRoot } from "react-dom/client";
import { getAuth } from "firebase/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";
import "./lib/firebase"; // ensure firebase app is initialized first

// Wire Firebase ID token into every API request automatically
setAuthTokenGetter(async () => {
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
});

createRoot(document.getElementById("root")!).render(<App />);
