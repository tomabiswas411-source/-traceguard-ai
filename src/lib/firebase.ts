import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBjrIipzAW0699zEkKfdXFv7XQU01JRQI",
  authDomain: "traceguard-ai-7c802.firebaseapp.com",
  projectId: "traceguard-ai-7c802",
  storageBucket: "traceguard-ai-7c802.firebasestorage.app",
  messagingSenderId: "588501136262",
  appId: "1:588501136262:web:c59d1c6dcb27643cbcb207",
  measurementId: "G-X4CG8CRGPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with client-side check for analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;
let messaging: ReturnType<typeof getMessaging> | null = null;

// Analytics only works in browser
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
  
  isMessagingSupported().then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
      } catch (e) {
        console.log('Messaging not available');
      }
    }
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

export { app, analytics, db, auth, storage, messaging };
export default app;
