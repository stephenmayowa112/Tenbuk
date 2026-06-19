import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3e4ObIXoGy3NRdHSoHnF2xMj1Jxbp9yQ",
  authDomain: "gen-lang-client-0828454544.firebaseapp.com",
  projectId: "gen-lang-client-0828454544",
  storageBucket: "gen-lang-client-0828454544.firebasestorage.app",
  messagingSenderId: "400474333315",
  appId: "1:400474333315:web:1a6fb654c4ae97cb31fbb6"
};

let app: any = null;
let db: any = null;
let auth: any = null;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = initializeFirestore(app, {}, "ai-studio-64721232-d12d-4c4f-9924-a3c93e367009");
  auth = getAuth(app);
  console.log("Firebase App, Auth, and custom Firestore database initialized successfully!");
} catch (error) {
  console.warn("Firebase failed to initialize cleanly. Falling back to local state engine.", error);
}

export { app, db, auth };
