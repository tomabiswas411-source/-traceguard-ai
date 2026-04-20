'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Upload, Search, LogOut, User, Bell, Image as ImageIcon, 
  CheckCircle, AlertTriangle, XCircle, FileText, Download, Trash2,
  Lock, Fingerprint, Scan, Home, Menu, X, Eye, Copy,
  Plus, AlertCircle, Clock, FileCheck, ShieldCheck, Sparkles,
  Check, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

// Types
interface UserType {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface ImageType {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  fingerprintHash: string;
  contentId: string;
  watermarkEmbedded: boolean;
  protectedAt: string | null;
  createdAt: string;
}

interface AlertType {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

interface MatchType {
  id: string;
  contentId: string;
  originalName: string;
  similarity: number;
  protectedAt: string | null;
  owner: string;
  isExactMatch: boolean;
}

// Navigation items
const navItems = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'upload', icon: Shield, label: 'Protect' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'detect', icon: Search, label: 'Detect' },
];

// Utility functions
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// API helper with retry logic
async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Request failed');
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground text-sm mb-4">An error occurred. Please refresh the page.</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import React for ErrorBoundary
import React from 'react';

// Main Component
export default function TraceGuardApp() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'dashboard' | 'upload' | 'detect' | 'alerts'>('home');
  const [images, setImages] = useState<ImageType[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    image?: ImageType;
    isDuplicate?: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Detect state
  const [detectFile, setDetectFile] = useState<File | null>(null);
  const [detectProgress, setDetectProgress] = useState(0);
  const [detectResult, setDetectResult] = useState<{
    isMatchFound: boolean;
    matches: MatchType[];
    totalScanned: number;
    message: string;
  } | null>(null);
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Certificate dialog
  const [certificateDialog, setCertificateDialog] = useState<{
    open: boolean;
    certificate: string;
    contentId: string;
  } | null>(null);

  // Delete confirmation dialog
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    imageId: string;
    imageName: string;
  } | null>(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    };
  }, []);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (user) { fetchImages(); fetchAlerts(); } }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetchWithRetry('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCurrentPage('dashboard');
      }
    } catch {
      // Auth check failed, user not logged in
    } finally { 
      setIsLoading(false); 
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetchWithRetry('/api/images/user');
      if (response.ok) { 
        const data = await response.json(); 
        setImages(data.images || []); 
      }
    } catch {
      console.error('Failed to fetch images');
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetchWithRetry('/api/alerts');
      if (response.ok) { 
        const data = await response.json(); 
        setAlerts(data.alerts || []); 
      }
    } catch {
      console.error('Failed to fetch alerts');
    }
  };

  const validateForm = (type: 'login' | 'register'): boolean => {
    const errors: { email?: string; password?: string; name?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (type === 'register' && name !== undefined && !name.trim()) {
      errors.name = 'Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('login')) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetchWithRetry('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setCurrentPage('dashboard');
        setActiveNav('dashboard');
        toast({ title: 'Welcome back!', description: data.message });
        setFormErrors({});
      } else { 
        toast({ title: 'Error', description: data.error, variant: 'destructive' }); 
      }
    } catch { 
      toast({ title: 'Error', description: 'Network error. Please check your connection.', variant: 'destructive' }); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('register')) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetchWithRetry('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setCurrentPage('dashboard');
        setActiveNav('dashboard');
        toast({ title: 'Welcome!', description: data.message });
        setFormErrors({});
      } else { 
        toast({ title: 'Error', description: data.error, variant: 'destructive' }); 
      }
    } catch { 
      toast({ title: 'Error', description: 'Network error. Please check your connection.', variant: 'destructive' }); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setCurrentPage('home');
      setImages([]);
      setAlerts([]);
      setEmail('');
      setPassword('');
      setName('');
      toast({ title: 'Logged out', description: 'See you soon!' });
    } catch { toast({ title: 'Error', description: 'Logout failed', variant: 'destructive' }); }
  };

  const handleUpload = async (file: File) => {
    setUploadProgress(0);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', file);
    
    // Clear any existing interval
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    
    uploadIntervalRef.current = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200);
    
    try {
      const response = await fetchWithRetry('/api/images/upload', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
      setUploadProgress(100);
      
      if (response.ok) {
        setUploadResult({ success: true, message: data.message, image: data.image, isDuplicate: data.isDuplicate });
        fetchImages();
        fetchAlerts();
      } else { 
        setUploadResult({ success: false, message: data.error || 'Upload failed' }); 
      }
    } catch {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
      setUploadResult({ success: false, message: 'Network error. Please try again.' });
    }
  };

  const handleProtect = async (imageId: string) => {
    try {
      const response = await fetchWithRetry('/api/images/protect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchImages();
        fetchAlerts();
        setCertificateDialog({ open: true, certificate: data.certificate, contentId: data.image.contentId });
        toast({ title: 'Protected!', description: data.message });
      } else { toast({ title: 'Error', description: data.error, variant: 'destructive' }); }
    } catch { toast({ title: 'Error', description: 'Protection failed. Please try again.', variant: 'destructive' }); }
  };

  const handleDetect = async (file: File) => {
    setDetectProgress(0);
    setDetectResult(null);
    const formData = new FormData();
    formData.append('file', file);
    
    // Clear any existing interval
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    
    detectIntervalRef.current = setInterval(() => setDetectProgress(prev => Math.min(prev + 5, 90)), 100);
    
    try {
      const response = await fetchWithRetry('/api/images/detect', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
      setDetectProgress(100);
      
      if (response.ok) { 
        setDetectResult(data); 
        fetchAlerts(); 
      }
      else { toast({ title: 'Error', description: data.error, variant: 'destructive' }); }
    } catch { 
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
      toast({ title: 'Error', description: 'Detection failed. Please try again.', variant: 'destructive' }); 
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
      if (response.ok) { 
        fetchImages(); 
        toast({ title: 'Deleted', description: 'Image removed successfully' }); 
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error || 'Delete failed', variant: 'destructive' });
      }
    } catch { toast({ title: 'Error', description: 'Delete failed. Please try again.', variant: 'destructive' }); }
    finally {
      setDeleteConfirmDialog(null);
    }
  };

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      const response = await fetchWithRetry('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (response.ok) {
        fetchAlerts();
      }
    } catch {
      console.error('Failed to mark alert as read');
    }
  };

  const handleMarkAllAlertsRead = async () => {
    try {
      const response = await fetchWithRetry('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (response.ok) {
        fetchAlerts();
        toast({ title: 'Success', description: 'All alerts marked as read' });
      }
    } catch {
      console.error('Failed to mark all alerts as read');
    }
  };

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    setCurrentPage(navId as 'dashboard' | 'upload' | 'alerts' | 'detect');
    setSidebarOpen(false);
  };

  // Memoized values
  const unreadAlertsCount = useMemo(() => alerts.filter(a => !a.isRead).length, [alerts]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-main pattern-grid flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-shield mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          <div className="spinner mx-auto mb-3" />
          <p className="text-muted-foreground text-sm sm:text-base">Loading TraceGuard AI...</p>
        </div>
      </div>
    );
  }

  // Auth pages
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-main pattern-grid flex flex-col">
        {/* Header */}
        <header className="glass sticky top-0 z-50 border-b border-border/50 safe-area-top">
          <div className="container-app py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer touch-feedback" 
                onClick={() => setCurrentPage('home')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage('home')}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-shield flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-foreground">TraceGuard AI</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Protect Before It's Misused</p>
                </div>
              </motion.div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentPage('login')} 
                  className="text-sm min-h-[44px] min-w-[44px] px-4"
                >
                  Login
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setCurrentPage('register')} 
                  className="btn-gradient-primary text-sm min-h-[44px] min-w-[44px] px-4"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container-app py-4 sm:py-8">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <HomePage onGetStarted={() => setCurrentPage('register')} />
              </motion.div>
            )}
            {currentPage === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
                <AuthForm 
                  type="login" 
                  email={email} 
                  password={password} 
                  setEmail={setEmail} 
                  setPassword={setPassword} 
                  onSubmit={handleLogin} 
                  isLoading={isSubmitting} 
                  onSwitch={() => { setCurrentPage('register'); setFormErrors({}); }} 
                  errors={formErrors}
                />
              </motion.div>
            )}
            {currentPage === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
                <AuthForm 
                  type="register" 
                  email={email} 
                  password={password} 
                  name={name} 
                  setEmail={setEmail} 
                  setPassword={setPassword} 
                  setName={setName} 
                  onSubmit={handleRegister} 
                  isLoading={isSubmitting} 
                  onSwitch={() => { setCurrentPage('login'); setFormErrors({}); }} 
                  errors={formErrors}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-4 mt-auto">
          <div className="container-app text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">© 2024 TraceGuard AI. Protect Before It's Misused.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated layout
  return (
    <div className="min-h-screen bg-gradient-main pattern-grid flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-border/50 fixed h-full z-40 shadow-xl">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-shield flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">TraceGuard AI</h1>
              <p className="text-xs text-muted-foreground">Protect Before It's Misused</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => handleNavClick(item.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium min-h-[48px] ${
                    activeNav === item.id 
                      ? 'bg-gradient-shield text-white shadow-lg' 
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && unreadAlertsCount > 0 && (
                    <Badge className="ml-auto bg-white/20 text-white border-0">{unreadAlertsCount}</Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-shield flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full min-h-[44px]">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-shield flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-foreground">TraceGuard AI</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="min-h-[44px] min-w-[44px]">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 p-3">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button 
                        onClick={() => handleNavClick(item.id)} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium touch-feedback min-h-[48px] ${
                          activeNav === item.id 
                            ? 'bg-gradient-shield text-white' 
                            : 'text-muted-foreground hover:bg-secondary/50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-3 border-t border-border/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-shield flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full min-h-[44px]">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="glass sticky top-0 z-30 border-b border-border/50 safe-area-top">
          <div className="container-app flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {activeNav === 'dashboard' ? 'Dashboard' : activeNav === 'upload' ? 'Protect' : activeNav === 'alerts' ? 'Alerts' : 'Detect'}
                </h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {activeNav === 'dashboard' ? 'Overview of your protected content' : activeNav === 'upload' ? 'Upload and protect images' : activeNav === 'alerts' ? 'Monitor for misuse' : 'Scan for duplicates'}
                </p>
              </div>
            </div>
            <Button onClick={() => handleNavClick('upload')} className="btn-gradient-primary min-h-[44px] px-4">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 container-app py-4 pb-28 lg:pb-4">
          <AnimatePresence mode="wait">
            {currentPage === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Dashboard 
                  user={user} 
                  images={images} 
                  alerts={alerts} 
                  onProtect={handleProtect} 
                  onDeleteRequest={(id, name) => setDeleteConfirmDialog({ open: true, imageId: id, imageName: name })} 
                  onUpload={() => handleNavClick('upload')} 
                />
              </motion.div>
            )}
            {currentPage === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto">
                <UploadPage 
                  file={uploadFile} 
                  setFile={setUploadFile} 
                  progress={uploadProgress} 
                  result={uploadResult} 
                  onUpload={handleUpload} 
                  isDragging={isDragging} 
                  setIsDragging={setIsDragging} 
                  onProtect={handleProtect} 
                />
              </motion.div>
            )}
            {currentPage === 'alerts' && (
              <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AlertsPage 
                  alerts={alerts} 
                  onMarkRead={handleMarkAlertRead} 
                  onMarkAllRead={handleMarkAllAlertsRead} 
                />
              </motion.div>
            )}
            {currentPage === 'detect' && (
              <motion.div key="detect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto">
                <DetectPage 
                  file={detectFile} 
                  setFile={setDetectFile} 
                  progress={detectProgress} 
                  result={detectResult} 
                  onDetect={handleDetect} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav - Modern PWA Style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="mx-2 mb-2">
            <div className="glass rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              <div className="flex items-center justify-around py-2 px-1">
                {navItems.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => handleNavClick(item.id)} 
                      className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 touch-feedback min-h-[48px] min-w-[48px] ${
                        isActive 
                          ? 'bg-gradient-shield text-white shadow-lg scale-105' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <div className="relative">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                        {item.id === 'alerts' && unreadAlertsCount > 0 && (
                          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] ${isActive ? 'bg-white text-primary' : 'bg-gradient-shield text-white'} text-[10px] font-bold rounded-full flex items-center justify-center px-1`}>
                            {unreadAlertsCount}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                    </button>
                  );
                })}
                {/* Account Button */}
                <button 
                  onClick={handleLogout} 
                  className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 touch-feedback text-muted-foreground hover:text-red-500 hover:bg-red-50 min-h-[48px] min-w-[48px]"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </div>
          {/* Safe area padding for iOS */}
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </nav>
      </div>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialog?.open} onOpenChange={(open) => !open && setCertificateDialog(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" /> Certificate
            </DialogTitle>
            <DialogDescription className="font-mono text-primary">{certificateDialog?.contentId}</DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/30 p-3 sm:p-4 rounded-xl font-mono text-[10px] sm:text-xs whitespace-pre overflow-x-auto">
            {certificateDialog?.certificate}
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { 
                navigator.clipboard.writeText(certificateDialog?.certificate || ''); 
                toast({ title: 'Copied!' }); 
              }} 
              className="flex-1 min-h-[44px]"
            >
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
            <Button 
              size="sm" 
              onClick={() => { 
                const blob = new Blob([certificateDialog?.certificate || ''], { type: 'text/plain' }); 
                const a = document.createElement('a'); 
                a.href = URL.createObjectURL(blob); 
                a.download = `certificate.txt`; 
                a.click(); 
              }} 
              className="flex-1 min-h-[44px]"
            >
              <Download className="w-3 h-3 mr-1" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog?.open} onOpenChange={(open) => !open && setDeleteConfirmDialog(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Delete Image
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteConfirmDialog?.imageName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmDialog(null)} 
              className="flex-1 min-h-[44px]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmDialog && handleDeleteImage(deleteConfirmDialog.imageId)} 
              className="flex-1 min-h-[44px]"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Home Page
function HomePage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="py-6 sm:py-10">
      <div className="text-center mb-8 sm:mb-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 sm:mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-shield mx-auto flex items-center justify-center shadow-xl animate-pulse-glow">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
        </motion.div>
        <motion.h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-foreground px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          Upload your Content<br />
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Before It&apos;s Misused</span>
        </motion.h1>
        <motion.p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 sm:mb-8 px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Protect your digital images with invisible watermarks and unique fingerprints.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button size="lg" onClick={onGetStarted} className="btn-gradient-primary px-6 sm:px-8 min-h-[48px]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Start Protecting
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto mb-8 sm:mb-12 px-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {[
          { value: '184', label: 'Protected', icon: Shield },
          { value: '24', label: 'Alerts', icon: AlertTriangle },
        ].map((stat, i) => (
          <Card key={i} className="card-modern">
            <CardContent className="p-3 sm:p-4 text-center">
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { icon: Upload, title: 'Upload', desc: 'Add images' },
            { icon: Lock, title: 'Protect', desc: 'Watermark' },
            { icon: Scan, title: 'Monitor', desc: 'Get alerts' },
          ].map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
              <Card className="card-modern h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-shield flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground hidden sm:block">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Auth Form
function AuthForm({ 
  type, 
  email, 
  password, 
  name, 
  setEmail, 
  setPassword, 
  setName, 
  onSubmit, 
  isLoading, 
  onSwitch,
  errors 
}: { 
  type: 'login' | 'register'; 
  email: string; 
  password: string; 
  name?: string; 
  setEmail: (v: string) => void; 
  setPassword: (v: string) => void; 
  setName?: (v: string) => void; 
  onSubmit: (e: React.FormEvent) => void; 
  isLoading: boolean; 
  onSwitch: () => void;
  errors: { email?: string; password?: string; name?: string };
}) {
  return (
    <Card className="card-modern mx-2 sm:mx-0">
      <CardHeader className="text-center pb-2 sm:pb-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">{type === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription className="text-sm">{type === 'login' ? 'Sign in to continue' : 'Start protecting your content'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {type === 'register' && (
            <div>
              <Label className="text-sm">Name</Label>
              <Input 
                type="text" 
                placeholder="Your name" 
                value={name} 
                onChange={(e) => setName?.(e.target.value)} 
                className={`h-11 mt-1 ${errors.name ? 'border-destructive' : ''}`} 
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
          )}
          <div>
            <Label className="text-sm">Email</Label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className={`h-11 mt-1 ${errors.email ? 'border-destructive' : ''}`} 
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label className="text-sm">Password</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className={`h-11 mt-1 ${errors.password ? 'border-destructive' : ''}`} 
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            {type === 'register' && !errors.password && (
              <p className="text-xs text-muted-foreground mt-1">Minimum {MIN_PASSWORD_LENGTH} characters</p>
            )}
          </div>
          <Button type="submit" className="w-full h-11 btn-gradient-primary min-h-[44px]" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner" />
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {type === 'login' ? 'Sign In' : 'Create Account'}
              </>
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {type === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={onSwitch}>Sign up</Button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={onSwitch}>Sign in</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard
function Dashboard({ 
  user, 
  images, 
  alerts, 
  onProtect, 
  onDeleteRequest, 
  onUpload 
}: { 
  user: UserType; 
  images: ImageType[]; 
  alerts: AlertType[]; 
  onProtect: (id: string) => void; 
  onDeleteRequest: (id: string, name: string) => void; 
  onUpload: () => void;
}) {
  const protectedCount = images.filter(i => i.watermarkEmbedded).length;
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Hi, {user.name}! 👋</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Your protected content</p>
        </div>
        <Button onClick={onUpload} className="btn-gradient-primary min-h-[44px] px-4">
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { value: images.length, label: 'Images', icon: ImageIcon, color: 'bg-gradient-purple' },
          { value: protectedCount, label: 'Protected', icon: ShieldCheck, color: 'bg-gradient-cyan' },
          { value: alerts.length, label: 'Alerts', icon: Bell, color: 'bg-gradient-pink' },
          { value: unreadAlerts, label: 'Unread', icon: AlertTriangle, color: 'bg-gradient-to-br from-orange-400 to-red-500' },
        ].map((stat, i) => (
          <Card key={i} className="card-modern">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-foreground">My Content</h3>
          {images.length > 0 && (
            <Button variant="outline" size="sm" onClick={onUpload} className="min-h-[40px] text-xs">
              <Upload className="w-3 h-3 mr-1" /> Add
            </Button>
          )}
        </div>
        {images.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-shield mx-auto mb-3 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="font-medium text-foreground mb-1">No images yet</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">Upload your first image to start protecting your content</p>
              <Button onClick={onUpload} className="btn-gradient-primary min-h-[44px]">
                <Upload className="w-4 h-4 mr-2" /> Upload Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {images.map((image) => (
              <Card key={image.id} className="card-modern overflow-hidden">
                <div className="aspect-square sm:aspect-video bg-secondary/30 relative">
                  <img src={`/api/images/${image.id}`} alt={image.originalName} className="w-full h-full object-cover" />
                  {image.watermarkEmbedded && (
                    <Badge className="absolute top-2 right-2 badge-success text-[10px] px-1.5 py-0">
                      <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Protected
                    </Badge>
                  )}
                </div>
                <CardContent className="p-2 sm:p-3">
                  <p className="font-medium text-foreground truncate text-xs sm:text-sm">{image.originalName}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{formatFileSize(image.size)} • {formatDate(image.createdAt)}</p>
                  <div className="flex gap-1.5 mt-2">
                    {!image.watermarkEmbedded && (
                      <Button size="sm" onClick={() => onProtect(image.id)} className="flex-1 min-h-[36px] text-[10px] btn-gradient-primary">
                        <Shield className="w-2.5 h-2.5 mr-0.5" /> Protect
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDeleteRequest(image.id, image.originalName)} 
                      className="min-h-[36px] min-w-[36px] p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Recent Alerts</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.slice(0, 3).map((alert) => (
              <Card key={alert.id} className={`card-modern ${alert.severity === 'warning' ? 'border-l-4 border-l-amber-500' : alert.severity === 'error' ? 'border-l-4 border-l-red-500' : alert.severity === 'success' ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${alert.severity === 'warning' ? 'bg-amber-100' : alert.severity === 'error' ? 'bg-red-100' : alert.severity === 'success' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                      {alert.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : alert.severity === 'error' ? <XCircle className="w-4 h-4 text-red-600" /> : alert.severity === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Bell className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    </div>
                    {!alert.isRead && <Badge className="badge-gradient text-[10px]">New</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Upload Page
function UploadPage({ 
  file, 
  setFile, 
  progress, 
  result, 
  onUpload, 
  isDragging, 
  setIsDragging, 
  onProtect 
}: { 
  file: File | null; 
  setFile: (f: File | null) => void; 
  progress: number; 
  result: { success: boolean; message: string; image?: ImageType; isDuplicate?: boolean } | null; 
  onUpload: (f: File) => void; 
  isDragging: boolean; 
  setIsDragging: (v: boolean) => void; 
  onProtect: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type.startsWith('image/')) setFile(droppedFile);
  }, [setFile, setIsDragging]);

  return (
    <Card className="card-modern">
      <CardHeader className="text-center pb-2 sm:pb-4">
        {result?.success ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-shield mx-auto mb-3 flex items-center justify-center shadow-xl">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        )}
        <CardTitle className="text-lg sm:text-xl">{result?.success ? 'Protected!' : 'Upload Image'}</CardTitle>
        <CardDescription className="text-sm">{result?.success ? 'Your content is protected' : 'Add watermark and fingerprint'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
              onDragLeave={() => setIsDragging(false)} 
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="hidden" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-shield flex items-center justify-center mx-auto mb-3 shadow">
                <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <p className="font-medium text-foreground text-sm sm:text-base mb-1">{file ? file.name : 'Tap to select image'}</p>
              <p className="text-xs text-muted-foreground mb-3">{file ? formatFileSize(file.size) : 'JPG, PNG, WebP (max 10MB)'}</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="min-h-[44px]">Browse</Button>
            </div>
            {file && (
              <div className="flex items-center justify-between p-3 sm:p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white flex items-center justify-center shadow">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate max-w-[120px] sm:max-w-none">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button onClick={() => onUpload(file)} disabled={progress > 0 && progress < 100} className="btn-gradient-primary min-h-[44px]">
                  {progress > 0 && progress < 100 ? <div className="spinner" /> : <><Upload className="w-4 h-4 mr-1" /> Upload</>}
                </Button>
              </div>
            )}
            {progress > 0 && progress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {[
              { icon: FileCheck, text: 'File Uploaded' },
              { icon: Fingerprint, text: 'Fingerprint Generated' },
              { icon: Lock, text: 'Ready for Protection' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-emerald-700">{item.text}</span>
              </motion.div>
            ))}
            {result.image && (
              <div className="p-3 bg-secondary/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Content ID</p>
                <p className="font-mono text-primary font-medium text-sm">{result.image.contentId}</p>
              </div>
            )}
            {result.image && !result.image.watermarkEmbedded && (
              <Button onClick={() => onProtect(result.image!.id)} className="w-full btn-gradient-primary min-h-[44px]">
                <Shield className="w-4 h-4 mr-2" /> Protect Content
              </Button>
            )}
            <Button variant="outline" onClick={() => { setFile(null); setUploadResult(null); }} className="w-full min-h-[44px]">
              Upload Another
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Alerts Page
function AlertsPage({ 
  alerts, 
  onMarkRead, 
  onMarkAllRead 
}: { 
  alerts: AlertType[]; 
  onMarkRead: (id: string) => void; 
  onMarkAllRead: () => void;
}) {
  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-3">
      {alerts.length === 0 ? (
        <Card className="card-modern">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-cyan mx-auto mb-3 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h4 className="font-medium text-foreground mb-1">All Clear!</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">No alerts to show. You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={onMarkAllRead} className="min-h-[40px] text-xs">
                <CheckCheck className="w-3 h-3 mr-1" /> Mark all as read
              </Button>
            </div>
          )}
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`card-modern ${alert.severity === 'warning' ? 'border-l-4 border-l-amber-500' : alert.severity === 'error' ? 'border-l-4 border-l-red-500' : alert.severity === 'success' ? 'border-l-4 border-l-emerald-500' : ''} ${!alert.isRead ? 'bg-primary/5' : ''}`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${alert.severity === 'warning' ? 'bg-amber-100' : alert.severity === 'error' ? 'bg-red-100' : alert.severity === 'success' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                      {alert.severity === 'warning' ? <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" /> : alert.severity === 'error' ? <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" /> : alert.severity === 'success' ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" /> : <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground text-sm sm:text-base">{alert.title}</p>
                        <div className="flex items-center gap-1">
                          {!alert.isRead && <Badge className="badge-gradient text-[10px]">New</Badge>}
                          {!alert.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onMarkRead(alert.id)} 
                              className="min-h-[36px] min-w-[36px] p-0"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Detect Page
function DetectPage({ 
  file, 
  setFile, 
  progress, 
  result, 
  onDetect 
}: { 
  file: File | null; 
  setFile: (f: File | null) => void; 
  progress: number; 
  result: { isMatchFound: boolean; matches: MatchType[]; totalScanned: number; message: string } | null; 
  onDetect: (f: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="card-modern">
      <CardHeader className="text-center pb-2 sm:pb-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-cyan flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Search className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <CardTitle className="text-lg sm:text-xl">Detect Duplicates</CardTitle>
        <CardDescription className="text-sm">Scan for matching images</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <>
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 sm:p-8 text-center transition-all">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="hidden" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-cyan flex items-center justify-center mx-auto mb-3 shadow">
                <Scan className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <p className="font-medium text-foreground text-sm sm:text-base mb-1">{file ? file.name : 'Select image to scan'}</p>
              <p className="text-xs text-muted-foreground mb-3">Compare against protected images</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="min-h-[44px]">Browse</Button>
            </div>
            {file && (
              <div className="flex items-center justify-between p-3 sm:p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white flex items-center justify-center shadow">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate max-w-[120px] sm:max-w-none">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button onClick={() => onDetect(file)} disabled={progress > 0 && progress < 100} className="btn-gradient-secondary min-h-[44px]">
                  {progress > 0 && progress < 100 ? <div className="spinner" /> : <><Search className="w-4 h-4 mr-1" /> Scan</>}
                </Button>
              </div>
            )}
            {progress > 0 && progress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Scanning...</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`p-4 rounded-xl ${result.isMatchFound ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <div className="flex items-center gap-3">
                {result.isMatchFound ? (
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <p className={`font-medium text-sm ${result.isMatchFound ? 'text-red-700' : 'text-emerald-700'}`}>{result.message}</p>
                  <p className="text-xs text-muted-foreground">Scanned {result.totalScanned} images</p>
                </div>
              </div>
            </div>
            {result.isMatchFound && result.matches.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Matches found:</p>
                {result.matches.slice(0, 3).map((match, i) => (
                  <div key={i} className="p-3 bg-secondary/30 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground text-sm">{match.originalName}</p>
                        <p className="text-xs text-muted-foreground">Owner: {match.owner}</p>
                      </div>
                      <Badge className={match.isExactMatch ? 'badge-error text-[10px]' : 'badge-warning text-[10px]'}>
                        {match.isExactMatch ? 'Exact' : `${Math.round(match.similarity * 100)}%`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => { setFile(null); setDetectResult(null); }} className="w-full min-h-[44px]">
              Scan Another
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Need to add setUploadResult and setDetectResult to the window for the UploadPage and DetectPage
// This is a workaround since we're passing setFile but not setUploadResult/setDetectResult
declare global {
  function setUploadResult(result: { success: boolean; message: string; image?: ImageType; isDuplicate?: boolean } | null): void;
  function setDetectResult(result: { isMatchFound: boolean; matches: MatchType[]; totalScanned: number; message: string } | null): void;
}
