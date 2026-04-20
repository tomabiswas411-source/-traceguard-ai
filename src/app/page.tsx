'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, Upload, Search, LogOut, User, Bell, Image as ImageIcon, 
  CheckCircle, AlertTriangle, XCircle, FileText, Download, Trash2,
  Lock, Fingerprint, Scan, Home, Menu, X, Eye, Copy,
  Plus, AlertCircle, Clock, FileCheck, ShieldCheck, Sparkles,
  Check, CheckCheck, Zap, Rocket, Star, TrendingUp, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import React from 'react';

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

// ===== FLOATING PARTICLES COMPONENT =====
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    size: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
  }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    const generatedParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 20 + 15,
      color: ['#7c3aed', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 3)],
    }));
    setParticles(generatedParticles);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="particles-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}

// ===== FLOATING ORBS COMPONENT =====
function FloatingOrbs() {
  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
    </>
  );
}

// ===== AURORA BACKGROUND =====
function AuroraBackground() {
  return <div className="aurora" />;
}

// ===== ANIMATED COUNTER =====
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return <span className="counter-value">{displayValue}</span>;
}

// ===== 3D TILT CARD =====
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      className={`card-modern rounded-2xl ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

// ===== RIPPLE BUTTON =====
function RippleButton({ children, className = '', ...props }: React.ComponentProps<typeof Button> & { className?: string }) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };
  
  return (
    <Button
      ref={buttonRef}
      className={`ripple-container overflow-hidden ${className}`}
      onClick={(e) => {
        createRipple(e);
        props.onClick?.(e);
      }}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      {children}
    </Button>
  );
}

// ===== GLOW ICON =====
function GlowIcon({ icon: Icon, className = '' }: { icon: React.ElementType; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-50" />
      <Icon className="relative z-10" />
    </motion.div>
  );
}

// ===== LOADING SCREEN =====
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-main pattern-grid flex items-center justify-center p-4">
      <FloatingOrbs />
      <FloatingParticles />
      <AuroraBackground />
      
      <motion.div 
        className="text-center relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-shield mx-auto mb-6 flex items-center justify-center animate-pulse-glow relative"
          animate={{ 
            boxShadow: [
              '0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.2)',
              '0 0 50px rgba(124, 58, 237, 0.5), 0 0 100px rgba(124, 58, 237, 0.3)',
              '0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.2)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-10" />
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
          />
        </motion.div>
        
        <div className="loading-dots justify-center mb-4">
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <motion.p 
          className="text-muted-foreground text-sm sm:text-base"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Initializing TraceGuard AI...
        </motion.p>
      </motion.div>
    </div>
  );
}

// ===== ERROR BOUNDARY =====
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
        <div className="min-h-screen bg-gradient-main pattern-grid flex items-center justify-center p-4">
          <FloatingOrbs />
          <Card className="max-w-md w-full glass-card">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center"
              >
                <AlertCircle className="w-8 h-8 text-red-400" />
              </motion.div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground text-sm mb-4">An error occurred. Please refresh the page.</p>
              <RippleButton onClick={() => window.location.reload()} className="btn-gradient-primary">
                Refresh Page
              </RippleButton>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===== MAIN COMPONENT =====
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

  const unreadAlertsCount = useMemo(() => alerts.filter(a => !a.isRead).length, [alerts]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Auth pages
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-main pattern-grid flex flex-col relative">
        <FloatingOrbs />
        <FloatingParticles />
        <AuroraBackground />
        
        {/* Header */}
        <header className="glass sticky top-0 z-50 border-b border-purple-500/20 safe-area-top">
          <div className="container-app py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer touch-feedback" 
                onClick={() => setCurrentPage('home')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage('home')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-shield flex items-center justify-center shadow-lg relative overflow-hidden"
                  animate={{ boxShadow: ['0 0 20px rgba(124, 58, 237, 0.4)', '0 0 40px rgba(124, 58, 237, 0.6)', '0 0 20px rgba(124, 58, 237, 0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{
                      background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                  />
                </motion.div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gradient-animate">TraceGuard AI</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Protect Before It's Misused</p>
                </div>
              </motion.div>
              <div className="flex items-center gap-2">
                <RippleButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentPage('login')} 
                  className="text-sm min-h-[44px] min-w-[44px] px-4 text-white/70 hover:text-white hover:bg-white/10"
                >
                  Login
                </RippleButton>
                <RippleButton 
                  size="sm" 
                  onClick={() => setCurrentPage('register')} 
                  className="btn-gradient-primary text-sm min-h-[44px] min-w-[44px] px-4"
                >
                  Get Started
                </RippleButton>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container-app py-4 sm:py-8 relative z-10">
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
        <footer className="border-t border-purple-500/20 py-4 mt-auto relative z-10">
          <div className="container-app text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">© 2024 TraceGuard AI. Protect Before It's Misused.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated layout
  return (
    <div className="min-h-screen bg-gradient-main pattern-grid flex relative">
      <FloatingOrbs />
      <FloatingParticles />
      <AuroraBackground />
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 glass-dark fixed h-full z-40 shadow-2xl sidebar-premium">
        <div className="p-5 border-b border-purple-500/20">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-shield flex items-center justify-center shadow-lg relative overflow-hidden"
              animate={{ boxShadow: ['0 0 20px rgba(124, 58, 237, 0.4)', '0 0 40px rgba(124, 58, 237, 0.6)', '0 0 20px rgba(124, 58, 237, 0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-6 h-6 text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-gradient-animate">TraceGuard AI</h1>
              <p className="text-xs text-muted-foreground">Protect Before It's Misused</p>
            </div>
          </motion.div>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button 
                  onClick={() => handleNavClick(item.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium min-h-[48px] sidebar-item ${
                    activeNav === item.id 
                      ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/30 active' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeNav === item.id ? 'text-purple-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && unreadAlertsCount > 0 && (
                    <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg">{unreadAlertsCount}</Badge>
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-purple-500/20">
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-shield flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </motion.div>
          <RippleButton variant="outline" size="sm" onClick={handleLogout} className="w-full min-h-[44px] border-purple-500/30 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </RippleButton>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.aside 
              initial={{ x: -280 }} 
              animate={{ x: 0 }} 
              exit={{ x: -280 }} 
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 glass-dark z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-shield flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-gradient-animate">TraceGuard AI</h1>
                </div>
                <RippleButton variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="min-h-[44px] min-w-[44px] text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </RippleButton>
              </div>
              <nav className="flex-1 p-3">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button 
                        onClick={() => handleNavClick(item.id)} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium touch-feedback min-h-[48px] sidebar-item ${
                          activeNav === item.id 
                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white active' 
                            : 'text-muted-foreground hover:bg-white/5'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-3 border-t border-purple-500/20">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-shield flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <RippleButton variant="outline" size="sm" onClick={handleLogout} className="w-full min-h-[44px] border-purple-500/30 hover:bg-red-500/10">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </RippleButton>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="glass sticky top-0 z-30 border-b border-purple-500/20 safe-area-top">
          <div className="container-app flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <RippleButton variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px] text-white/70 hover:text-white hover:bg-white/10" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </RippleButton>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {activeNav === 'dashboard' ? 'Dashboard' : activeNav === 'upload' ? 'Protect' : activeNav === 'alerts' ? 'Alerts' : 'Detect'}
                </h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {activeNav === 'dashboard' ? 'Overview of your protected content' : activeNav === 'upload' ? 'Upload and protect images' : activeNav === 'alerts' ? 'Monitor for misuse' : 'Scan for duplicates'}
                </p>
              </div>
            </div>
            <RippleButton onClick={() => handleNavClick('upload')} className="btn-gradient-primary min-h-[44px] px-4">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </RippleButton>
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

        {/* Mobile Bottom Nav - Premium PWA Style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="mx-3 mb-3">
            <div className="glass rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10" />
              <div className="relative flex items-center justify-around py-2 px-1">
                {navItems.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <motion.button 
                      key={item.id} 
                      onClick={() => handleNavClick(item.id)} 
                      className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 touch-feedback min-h-[48px] min-w-[48px] ${
                        isActive 
                          ? 'bg-gradient-shield text-white shadow-lg' 
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="relative">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                        {item.id === 'alerts' && unreadAlertsCount > 0 && (
                          <motion.span 
                            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] ${isActive ? 'bg-white text-purple-600' : 'bg-gradient-shield text-white'} text-[10px] font-bold rounded-full flex items-center justify-center px-1`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' }}
                          >
                            {unreadAlertsCount}
                          </motion.span>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          layoutId="activeTab"
                          transition={{ type: 'spring', damping: 25 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
                <motion.button 
                  onClick={handleLogout} 
                  className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 touch-feedback text-muted-foreground hover:text-red-400 hover:bg-red-500/10 min-h-[48px] min-w-[48px]"
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </nav>
      </div>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialog?.open} onOpenChange={(open) => !open && setCertificateDialog(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto mx-4 glass-card border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
              <FileText className="w-5 h-5 text-purple-400" /> Certificate
            </DialogTitle>
            <DialogDescription className="font-mono text-purple-400">{certificateDialog?.contentId}</DialogDescription>
          </DialogHeader>
          <div className="bg-black/30 p-3 sm:p-4 rounded-xl font-mono text-[10px] sm:text-xs whitespace-pre overflow-x-auto text-green-400 border border-green-500/20">
            {certificateDialog?.certificate}
          </div>
          <div className="flex gap-2 mt-3">
            <RippleButton 
              variant="outline" 
              size="sm" 
              onClick={() => { 
                navigator.clipboard.writeText(certificateDialog?.certificate || ''); 
                toast({ title: 'Copied!' }); 
              }} 
              className="flex-1 min-h-[44px] border-purple-500/30 hover:bg-purple-500/10"
            >
              <Copy className="w-3 h-3 mr-1" /> Copy
            </RippleButton>
            <RippleButton 
              size="sm" 
              onClick={() => { 
                const blob = new Blob([certificateDialog?.certificate || ''], { type: 'text/plain' }); 
                const a = document.createElement('a'); 
                a.href = URL.createObjectURL(blob); 
                a.download = `certificate.txt`; 
                a.click(); 
              }} 
              className="flex-1 min-h-[44px] btn-gradient-primary"
            >
              <Download className="w-3 h-3 mr-1" /> Save
            </RippleButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog?.open} onOpenChange={(open) => !open && setDeleteConfirmDialog(null)}>
        <DialogContent className="max-w-sm mx-4 glass-card border-red-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Delete Image
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleteConfirmDialog?.imageName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <RippleButton 
              variant="outline" 
              onClick={() => setDeleteConfirmDialog(null)} 
              className="flex-1 min-h-[44px] border-purple-500/30 hover:bg-white/5"
            >
              Cancel
            </RippleButton>
            <RippleButton 
              variant="destructive" 
              onClick={() => deleteConfirmDialog && handleDeleteImage(deleteConfirmDialog.imageId)} 
              className="flex-1 min-h-[44px] bg-red-500 hover:bg-red-600"
            >
              Delete
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== HOME PAGE =====
function HomePage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="py-6 sm:py-10 relative z-10">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: 'spring', damping: 15 }}
          className="mb-6 sm:mb-8"
        >
          <motion.div 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-shield mx-auto flex items-center justify-center shadow-2xl relative overflow-hidden"
            animate={{ 
              boxShadow: [
                '0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.2)',
                '0 0 50px rgba(124, 58, 237, 0.5), 0 0 100px rgba(124, 58, 237, 0.3)',
                '0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.2)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 text-white relative z-10" />
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
            />
            {/* Floating particles around icon */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/50"
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
        
        <motion.h1 
          className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground px-4" 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          Upload your Content<br />
          <span className="text-gradient-animate">Before It&apos;s Misused</span>
        </motion.h1>
        
        <motion.p 
          className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-6 sm:mb-8 px-4" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          Protect your digital images with invisible watermarks and unique fingerprints. 
          Get instant alerts when your content is found elsewhere.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4"
        >
          <RippleButton 
            size="lg" 
            onClick={onGetStarted} 
            className="btn-gradient-primary px-8 sm:px-10 min-h-[52px] text-base font-semibold"
          >
            <Rocket className="w-5 h-5 mr-2" /> Start Protecting
          </RippleButton>
          <RippleButton 
            size="lg" 
            variant="outline" 
            className="min-h-[52px] px-8 border-purple-500/30 hover:bg-purple-500/10 text-white"
          >
            <Zap className="w-5 h-5 mr-2" /> Watch Demo
          </RippleButton>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10 sm:mb-16 px-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { value: 184, label: 'Protected Images', icon: Shield, color: 'from-purple-500 to-pink-500' },
          { value: 24, label: 'Alerts Triggered', icon: AlertTriangle, color: 'from-pink-500 to-red-500' },
          { value: 99, label: 'Success Rate', icon: TrendingUp, color: 'from-cyan-500 to-blue-500', suffix: '%' },
          { value: 5000, label: 'Happy Users', icon: Award, color: 'from-green-500 to-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <TiltCard className="p-4 sm:p-5">
              <CardContent className="p-0 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  <AnimatedCounter value={stat.value} />
                  {stat.suffix}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-2">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to protect your content</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Upload, title: 'Upload', desc: 'Add your images to our secure platform with one click', step: 1 },
            { icon: Lock, title: 'Protect', desc: 'We embed invisible watermarks and create unique fingerprints', step: 2 },
            { icon: Scan, title: 'Monitor', desc: 'Get instant alerts when your content is detected elsewhere', step: 3 },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15 }}
            >
              <TiltCard className="p-5 sm:p-6 h-full">
                <CardContent className="p-0 text-center relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-shield flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {feature.step}
                  </div>
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-4 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== AUTH FORM =====
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
    <Card className="card-modern mx-2 sm:mx-0 glass-card border-purple-500/30">
      <CardHeader className="text-center pb-2 sm:pb-4">
        <motion.div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-shield flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden"
          animate={{ boxShadow: ['0 0 30px rgba(124, 58, 237, 0.4)', '0 0 50px rgba(124, 58, 237, 0.6)', '0 0 30px rgba(124, 58, 237, 0.4)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
        </motion.div>
        <CardTitle className="text-xl sm:text-2xl text-foreground">{type === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription className="text-muted-foreground">{type === 'login' ? 'Sign in to continue' : 'Start protecting your content'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Name</Label>
              <Input 
                id="name" 
                type="text" 
                value={name || ''} 
                onChange={(e) => setName?.(e.target.value)} 
                placeholder="Your name" 
                className="input-premium rounded-xl min-h-[44px] text-foreground"
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              className="input-premium rounded-xl min-h-[44px] text-foreground"
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="input-premium rounded-xl min-h-[44px] text-foreground"
            />
            {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
          </div>
          <RippleButton 
            type="submit" 
            disabled={isLoading} 
            className="w-full btn-gradient-primary min-h-[48px] text-base font-semibold"
          >
            {isLoading ? (
              <div className="loading-dots"><span></span><span></span><span></span></div>
            ) : (
              <>
                {type === 'login' ? 'Sign In' : 'Create Account'}
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            )}
          </RippleButton>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {type === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button 
            type="button" 
            onClick={onSwitch} 
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {type === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== DASHBOARD =====
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
  const protectedCount = images.filter(i => i.protectedAt).length;
  const pendingCount = images.length - protectedCount;
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border-purple-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-gradient-animate">{user.name.split(' ')[0]}</span>! 👋
          </h2>
          <p className="text-muted-foreground">
            {protectedCount > 0 
              ? `You have ${protectedCount} protected images. Keep your content safe!`
              : 'Start protecting your images today.'}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Images', value: images.length, icon: ImageIcon, color: 'from-purple-500 to-pink-500' },
          { label: 'Protected', value: protectedCount, icon: ShieldCheck, color: 'from-green-500 to-emerald-500' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'from-amber-500 to-orange-500' },
          { label: 'Alerts', value: unreadAlerts, icon: Bell, color: 'from-red-500 to-pink-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <TiltCard className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Protected Images */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Protected Content</h3>
          {images.length > 0 && (
            <RippleButton size="sm" onClick={onUpload} className="btn-gradient-primary">
              <Plus className="w-4 h-4 mr-1" /> Add More
            </RippleButton>
          )}
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl border-purple-500/20">
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ImageIcon className="w-10 h-10 text-purple-400" />
            </motion.div>
            <h4 className="text-lg font-medium text-foreground mb-2">No images yet</h4>
            <p className="text-muted-foreground mb-4">Start protecting your content today</p>
            <RippleButton onClick={onUpload} className="btn-gradient-primary">
              <Upload className="w-4 h-4 mr-2" /> Upload First Image
            </RippleButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, i) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <TiltCard className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${image.protectedAt ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
                          {image.protectedAt ? <ShieldCheck className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{image.originalName}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(image.size)}</p>
                        </div>
                      </div>
                      <Badge className={image.protectedAt ? 'badge-success' : 'badge-warning'}>
                        {image.protectedAt ? 'Protected' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <CalendarIcon className="w-3 h-3" />
                      {formatDate(image.createdAt)}
                    </div>

                    <div className="flex gap-2">
                      {!image.protectedAt && (
                        <RippleButton 
                          size="sm" 
                          onClick={() => onProtect(image.id)} 
                          className="flex-1 btn-gradient-primary text-xs"
                        >
                          <Shield className="w-3 h-3 mr-1" /> Protect
                        </RippleButton>
                      )}
                      {image.protectedAt && (
                        <RippleButton 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <FileCheck className="w-3 h-3 mr-1" /> View Cert
                        </RippleButton>
                      )}
                      <RippleButton 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onDeleteRequest(image.id, image.originalName)} 
                        className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </RippleButton>
                    </div>
                  </CardContent>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Simple calendar icon
function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

// ===== UPLOAD PAGE =====
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
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  }, [setFile, setIsDragging]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, [setIsDragging]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="card-modern glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" /> Upload Image
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Drop your image or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Drop Zone */}
            <motion.div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/5'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {!file ? (
                <div className="space-y-4">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Upload className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-foreground font-medium">Drop your image here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Upload Button */}
            {file && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <RippleButton 
                  onClick={() => onUpload(file)} 
                  className="w-full btn-gradient-primary min-h-[48px]"
                  disabled={progress > 0 && progress < 100}
                >
                  {progress > 0 && progress < 100 ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" /> Upload & Protect
                    </>
                  )}
                </RippleButton>
              </motion.div>
            )}

            {/* Progress Bar */}
            {progress > 0 && progress < 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 space-y-2"
              >
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-premium h-2">
                  <motion.div 
                    className="progress-premium-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-4 rounded-xl ${
                  result.success 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? 'Success!' : 'Error'}
                    </p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>

                {result.success && result.image && !result.image.protectedAt && (
                  <div className="mt-4">
                    <RippleButton 
                      onClick={() => onProtect(result.image!.id)} 
                      className="w-full btn-gradient-primary"
                    >
                      <Shield className="w-4 h-4 mr-2" /> Protect Now
                    </RippleButton>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ===== DETECT PAGE =====
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
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  }, [setFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="card-modern glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" /> Detect Duplicates
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Check if an image exists in our protected database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Drop Zone */}
            <motion.div
              className="relative border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 rounded-2xl p-8 text-center transition-all hover:bg-purple-500/5"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {!file ? (
                <div className="space-y-4">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Search className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-foreground font-medium">Drop image to scan</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Scan Button */}
            {file && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <RippleButton 
                  onClick={() => onDetect(file)} 
                  className="w-full btn-gradient-secondary min-h-[48px]"
                  disabled={progress > 0 && progress < 100}
                >
                  {progress > 0 && progress < 100 ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Search className="w-4 h-4" />
                      </motion.div>
                      Scanning...
                    </div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" /> Start Scan
                    </>
                  )}
                </RippleButton>
              </motion.div>
            )}

            {/* Progress */}
            {progress > 0 && progress < 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 space-y-2"
              >
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Scanning database...</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-premium h-2">
                  <motion.div 
                    className="progress-premium-bar"
                    style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-4 rounded-xl ${
                  result.isMatchFound 
                    ? 'bg-amber-500/10 border border-amber-500/30' 
                    : 'bg-green-500/10 border border-green-500/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {result.isMatchFound ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center"
                    >
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  <div>
                    <p className={`font-medium ${result.isMatchFound ? 'text-amber-400' : 'text-green-400'}`}>
                      {result.isMatchFound ? 'Match Found!' : 'No Matches'}
                    </p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>

                {result.matches.length > 0 && (
                  <div className="space-y-2">
                    {result.matches.map((match, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{match.originalName}</p>
                            <p className="text-xs text-muted-foreground">Similarity: {match.similarity}%</p>
                          </div>
                        </div>
                        <Badge className={match.isExactMatch ? 'badge-error' : 'badge-warning'}>
                          {match.isExactMatch ? 'Exact' : 'Similar'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ===== ALERTS PAGE =====
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
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <RippleButton 
            size="sm" 
            variant="outline" 
            onClick={onMarkAllRead}
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
          </RippleButton>
        )}
      </motion.div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 glass-card rounded-2xl border-purple-500/20"
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bell className="w-10 h-10 text-purple-400" />
          </motion.div>
          <h4 className="text-lg font-medium text-foreground mb-2">No alerts yet</h4>
          <p className="text-muted-foreground">We'll notify you when we find matches</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TiltCard className={`p-4 ${!alert.isRead ? 'border-purple-500/40' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.severity === 'high' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                      alert.severity === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                      'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}>
                      {alert.severity === 'high' ? <XCircle className="w-5 h-5 text-white" /> :
                       alert.severity === 'medium' ? <AlertTriangle className="w-5 h-5 text-white" /> :
                       <Bell className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{alert.title}</p>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(alert.createdAt)}</p>
                    </div>
                    {!alert.isRead && (
                      <RippleButton 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onMarkRead(alert.id)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        <Check className="w-4 h-4" />
                      </RippleButton>
                    )}
                  </div>
                </CardContent>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
