'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Types
interface RealtimeUser {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date | null;
  currentPage: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  joinedAt: Date | null;
}

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date | null;
  details?: Record<string, unknown>;
}

// Get device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Get browser name
const getBrowser = (): string => {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
};

// Generate unique session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('traceguard_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('traceguard_session_id', sessionId);
  }
  return sessionId;
};

export function useRealtimeUsers() {
  const [onlineUsers, setOnlineUsers] = useState<RealtimeUser[]>([]);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [currentUser, setCurrentUser] = useState<RealtimeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = typeof window !== 'undefined' ? getSessionId() : '';

  // Update user presence
  const updatePresence = useCallback(async (userId: string, userData: { name: string; email: string }, currentPage: string = 'dashboard') => {
    if (!db) return;

    try {
      const userRef = doc(db, 'presence', userId);
      const userDoc = await getDoc(userRef);
      
      const presenceData = {
        id: userId,
        name: userData.name || 'Anonymous',
        email: userData.email || '',
        status: 'online' as const,
        lastSeen: serverTimestamp(),
        currentPage,
        device: getDeviceType(),
        browser: getBrowser(),
        sessionId,
        updatedAt: serverTimestamp()
      };

      if (userDoc.exists()) {
        await updateDoc(userRef, presenceData);
      } else {
        await setDoc(userRef, {
          ...presenceData,
          joinedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }, [sessionId]);

  // Set user offline
  const setOffline = useCallback(async (userId: string) => {
    if (!db) return;

    try {
      const userRef = doc(db, 'presence', userId);
      await updateDoc(userRef, {
        status: 'offline',
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error setting offline:', err);
    }
  }, []);

  // Log activity
  const logActivity = useCallback(async (userId: string, userName: string, action: string, details?: Record<string, unknown>) => {
    if (!db) return;

    try {
      const activityRef = doc(collection(db, 'activities'));
      await setDoc(activityRef, {
        id: activityRef.id,
        userId,
        userName,
        action,
        timestamp: serverTimestamp(),
        details,
        sessionId
      });

      // Delete old activities (keep last 100)
      const activitiesRef = collection(db, 'activities');
      const snapshot = await getDocs(query(activitiesRef, orderBy('timestamp', 'desc')));
      
      if (snapshot.docs.length > 100) {
        const toDelete = snapshot.docs.slice(100);
        for (const doc of toDelete) {
          await deleteDoc(doc.ref);
        }
      }
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }, [sessionId]);

  // Subscribe to online users
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser({
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          status: 'online',
          lastSeen: new Date(),
          currentPage: 'dashboard',
          device: getDeviceType(),
          browser: getBrowser(),
          joinedAt: new Date()
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to presence changes
  useEffect(() => {
    if (!db) return;

    const presenceRef = collection(db, 'presence');
    const q = query(presenceRef, where('status', '==', 'online'), orderBy('lastSeen', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: RealtimeUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: data.id,
          name: data.name,
          email: data.email,
          status: data.status,
          lastSeen: data.lastSeen?.toDate() || null,
          currentPage: data.currentPage,
          device: data.device,
          browser: data.browser,
          joinedAt: data.joinedAt?.toDate() || null
        });
      });
      setOnlineUsers(users);
    }, (err) => {
      console.error('Error listening to presence:', err);
      setError(err.message);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to activities
  useEffect(() => {
    if (!db) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities: UserActivity[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: data.id,
          userId: data.userId,
          userName: data.userName,
          action: data.action,
          timestamp: data.timestamp?.toDate() || null,
          details: data.details
        });
      });
      setRecentActivities(activities);
    }, (err) => {
      console.error('Error listening to activities:', err);
    });

    return () => unsubscribe();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        // Use sendBeacon for reliable offline status
        const data = JSON.stringify({ userId: currentUser.id, action: 'offline' });
        navigator.sendBeacon('/api/presence/offline', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  return {
    onlineUsers,
    recentActivities,
    currentUser,
    loading,
    error,
    updatePresence,
    setOffline,
    logActivity,
    onlineCount: onlineUsers.length
  };
}

// Real-time user stats
export function useRealtimeStats() {
  const [stats, setStats] = useState({
    totalOnline: 0,
    totalUsers: 0,
    activeToday: 0,
    activities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Subscribe to online count
    const presenceRef = collection(db, 'presence');
    const onlineQuery = query(presenceRef, where('status', '==', 'online'));

    const unsubOnline = onSnapshot(onlineQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalOnline: snapshot.size }));
    });

    // Subscribe to total users
    const unsubTotal = onSnapshot(presenceRef, (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Subscribe to activities count
    const activitiesRef = collection(db, 'activities');
    const unsubActivities = onSnapshot(activitiesRef, (snapshot) => {
      setStats(prev => ({ ...prev, activities: snapshot.size }));
      setLoading(false);
    });

    return () => {
      unsubOnline();
      unsubTotal();
      unsubActivities();
    };
  }, []);

  return { stats, loading };
}

export default useRealtimeUsers;
