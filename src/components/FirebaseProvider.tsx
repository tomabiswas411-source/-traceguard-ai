'use client';

import { useEffect, useState } from 'react';
import { app, analytics, db, auth, storage, messaging } from '@/lib/firebase';
import { logEvent, Analytics } from 'firebase/analytics';
import { getMessaging as getFirebaseMessaging, onMessage } from 'firebase/messaging';

interface FirebaseContextType {
  app: typeof app;
  analytics: Analytics | null;
  db: typeof db;
  auth: typeof auth;
  storage: typeof storage;
  messaging: typeof messaging;
  isReady: boolean;
}

// Track if we've logged the initialization
let hasInitialized = false;

export function useFirebase(): FirebaseContextType {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      hasInitialized = true;
      console.log('🔥 Firebase initialized successfully');
      
      // Log app open event
      if (analytics) {
        logEvent(analytics, 'app_open', {
          app_name: 'TraceGuard AI',
          timestamp: new Date().toISOString()
        });
      }
    }
    setIsReady(true);
  }, []);

  return {
    app,
    analytics,
    db,
    auth,
    storage,
    messaging,
    isReady
  };
}

// Analytics helper functions
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (analytics && typeof window !== 'undefined') {
    logEvent(analytics, eventName, params);
  }
};

// Common analytics events for TraceGuard AI
export const analyticsEvents = {
  // Auth events
  login: (method: string = 'email') => trackEvent('login', { method }),
  register: (method: string = 'email') => trackEvent('sign_up', { method }),
  logout: () => trackEvent('logout'),
  
  // Image protection events
  imageUpload: (fileSize: number, fileType: string) => 
    trackEvent('image_upload', { file_size: fileSize, file_type: fileType }),
  imageProtect: (imageId: string) => 
    trackEvent('image_protect', { image_id: imageId }),
  imageDetect: (hasMatch: boolean) => 
    trackEvent('image_detect', { has_match: hasMatch }),
  
  // Navigation events
  pageView: (pageName: string) => 
    trackEvent('page_view', { page_name: pageName }),
  
  // Feature usage
  certificateView: (contentId: string) => 
    trackEvent('certificate_view', { content_id: contentId }),
  alertRead: (alertId: string) => 
    trackEvent('alert_read', { alert_id: alertId }),
};

// Push notification helper (requires service worker setup)
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Listen for foreground messages
export const listenForMessages = () => {
  if (typeof window === 'undefined' || !messaging) return;
  
  try {
    const msg = getFirebaseMessaging(app);
    onMessage(msg, (payload) => {
      console.log('Message received:', payload);
      // You can show a toast notification here
    });
  } catch (error) {
    console.log('Messaging not available');
  }
};

export default { useFirebase, trackEvent, analyticsEvents, requestNotificationPermission, listenForMessages };
