import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Ganti nilai di bawah ini dengan kredensial dari Firebase Console Anda nanti
const firebaseConfig = {
  apiKey: "AIzaSyC2NCp6hicz-xoo4GwST8eG-mcmBnUiGmw",
  authDomain: "e-lkpd-fix.firebaseapp.com",
  databaseURL: "https://e-lkpd-fix-default-rtdb.firebaseio.com",
  projectId: "e-lkpd-fix",
  storageBucket: "e-lkpd-fix.firebasestorage.app",
  messagingSenderId: "150851097854",
  appId: "1:150851097854:web:52314bede7c278d41e41af",
};

// Inisialisasi Firebase (mencegah duplikasi inisialisasi pada Next.js SSR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };