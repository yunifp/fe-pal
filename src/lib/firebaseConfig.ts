// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIcCcuFaM9pefnW27HpR852PY3HFry0WE",
  authDomain: "ald-dash.firebaseapp.com",
  projectId: "ald-dash",
  storageBucket: "ald-dash.firebasestorage.app",
  messagingSenderId: "148854504107",
  appId: "1:148854504107:web:1b331574e42f9b0172d5ee",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };
