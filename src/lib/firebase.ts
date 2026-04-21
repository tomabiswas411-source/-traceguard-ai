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

// Log Firebase initialization
console.log('🔥 Firebase initialized with project:', firebaseConfig.projectId);

// Initialize services with client-side check for analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;
let messaging: ReturnType<typeof getMessaging> | null = null;
let analyticsReady = false;

// Analytics only works in browser
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      analyticsReady = true;
      console.log('📊 Firebase Analytics is ready!');
    } else {
      console.log('⚠️ Firebase Analytics not supported in this environment');
    }
  }).catch((err) => {
    console.error('❌ Firebase Analytics error:', err);
  });
  
  isMessagingSupported().then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
        console.log('📨 Firebase Messaging is ready!');
      } catch (e) {
        console.log('⚠️ Messaging not available');
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

// Test function to verify connection
export const testFirebaseConnection = () => {
  return {
    initialized: !!app,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    analyticsSupported: analyticsReady,
    timestamp: new Date().toISOString()
  };
};

export { app, analytics, db, auth, storage, messaging };
export default app;
