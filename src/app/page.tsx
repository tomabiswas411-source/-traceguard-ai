'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Upload, Search, LogOut, User, Bell, Image as ImageIcon, 
  CheckCircle, AlertTriangle, XCircle, FileText, Download, Trash2,
  Lock, Fingerprint, Scan, Home, Menu, X, Eye, Copy, ChevronRight,
  Plus, AlertCircle, Clock, FileCheck, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface Image {
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

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

interface Match {
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
  { id: 'account', icon: User, label: 'Account' },
];

// Main Component
export default function TraceGuardApp() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'dashboard' | 'upload' | 'detect' | 'alerts' | 'account'>('home');
  const [images, setImages] = useState<Image[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    image?: Image;
    isDuplicate?: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Detection state
  const [detectFile, setDetectFile] = useState<File | null>(null);
  const [detectProgress, setDetectProgress] = useState(0);
  const [detectResult, setDetectResult] = useState<{
    isMatchFound: boolean;
    matches: Match[];
    totalScanned: number;
    message: string;
  } | null>(null);
  
  // Certificate state
  const [certificateDialog, setCertificateDialog] = useState<{
    open: boolean;
    certificate: string;
    contentId: string;
  } | null>(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch user data when logged in
  useEffect(() => {
    if (user) {
      fetchImages();
      fetchAlerts();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images/user');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
      }
    } catch (error) {
      console.error('Fetch images error:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Fetch alerts error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setCurrentPage('dashboard');
        setActiveNav('dashboard');
        toast({ title: 'Success', description: data.message });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setCurrentPage('dashboard');
        setActiveNav('dashboard');
        toast({ title: 'Success', description: data.message });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setCurrentPage('home');
      setImages([]);
      setAlerts([]);
      toast({ title: 'Success', description: 'Logged out successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Logout failed', variant: 'destructive' });
    }
  };

  const handleUpload = async (file: File) => {
    setUploadProgress(0);
    setUploadResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message,
          image: data.image,
          isDuplicate: data.isDuplicate,
        });
        fetchImages();
        fetchAlerts();
      } else {
        setUploadResult({
          success: false,
          message: data.error,
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadResult({
        success: false,
        message: 'Upload failed',
      });
    }
  };

  const handleProtect = async (imageId: string) => {
    try {
      const response = await fetch('/api/images/protect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });
      const data = await response.json();
      
      if (response.ok) {
        fetchImages();
        fetchAlerts();
        setCertificateDialog({
          open: true,
          certificate: data.certificate,
          contentId: data.image.contentId,
        });
        toast({ title: 'Success', description: data.message });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Protection failed', variant: 'destructive' });
    }
  };

  const handleDetect = async (file: File) => {
    setDetectProgress(0);
    setDetectResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const progressInterval = setInterval(() => {
      setDetectProgress(prev => Math.min(prev + 5, 90));
    }, 100);
    
    try {
      const response = await fetch('/api/images/detect', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      clearInterval(progressInterval);
      setDetectProgress(100);
      
      if (response.ok) {
        setDetectResult(data);
        fetchAlerts();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast({ title: 'Error', description: 'Detection failed', variant: 'destructive' });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchImages();
        toast({ title: 'Success', description: 'Image deleted' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Copied to clipboard' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    if (navId === 'dashboard') setCurrentPage('dashboard');
    else if (navId === 'upload') setCurrentPage('upload');
    else if (navId === 'alerts') setCurrentPage('alerts');
    else if (navId === 'account') setCurrentPage('account');
    setSidebarOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero sparkle-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading TraceGuard AI...</p>
        </div>
      </div>
    );
  }

  // Auth pages (no sidebar)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero sparkle-bg flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setCurrentPage('home')}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-shield flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">TraceGuard AI</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Protect Before It's Misused</p>
                </div>
              </motion.div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentPage('login')}
                  className="text-foreground"
                >
                  Login
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setCurrentPage('register')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <HomePage onGetStarted={() => setCurrentPage('register')} />
              </motion.div>
            )}

            {currentPage === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
                <AuthForm type="login" email={email} password={password} setEmail={setEmail} setPassword={setPassword} onSubmit={handleLogin} isLoading={isSubmitting} onSwitch={() => setCurrentPage('register')} />
              </motion.div>
            )}

            {currentPage === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
                <AuthForm type="register" email={email} password={password} name={name} setEmail={setEmail} setPassword={setPassword} setName={setName} onSubmit={handleRegister} isLoading={isSubmitting} onSwitch={() => setCurrentPage('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-pink-100 py-4 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-sm">© 2024 TraceGuard AI. Protect Before It's Misused.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated layout with sidebar
  return (
    <div className="min-h-screen bg-gradient-hero sparkle-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-pink-100 fixed h-full z-40">
        {/* Logo */}
        <div className="p-4 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-shield flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">TraceGuard AI</h1>
              <p className="text-xs text-muted-foreground">Protect Before It's Misused</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeNav === item.id
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-pink-50 hover:text-primary'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'alerts' && alerts.filter(a => !a.isRead).length > 0 && (
                    <Badge className="ml-auto bg-white/20 text-white">{alerts.filter(a => !a.isRead).length}</Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-pink-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full border-pink-200 text-muted-foreground hover:bg-pink-50">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col"
            >
              <div className="p-4 border-b border-pink-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-shield flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-foreground">TraceGuard AI</h1>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeNav === item.id
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-pink-50 hover:text-primary'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.id === 'alerts' && alerts.filter(a => !a.isRead).length > 0 && (
                          <Badge className="ml-auto">{alerts.filter(a => !a.isRead).length}</Badge>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t border-pink-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-pink-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="font-semibold text-foreground">
                {activeNav === 'dashboard' && 'Dashboard'}
                {activeNav === 'upload' && 'Protect Content'}
                {activeNav === 'alerts' && 'Misuse Alerts'}
                {activeNav === 'account' && 'My Account'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('detect')} className="text-muted-foreground hover:text-primary">
                <Search className="w-4 h-4 mr-2" /> Detect
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 pb-24 lg:pb-4">
          <AnimatePresence mode="wait">
            {currentPage === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Dashboard user={user} images={images} alerts={alerts} onProtect={handleProtect} onDelete={handleDeleteImage} onUpload={() => handleNavClick('upload')} />
              </motion.div>
            )}

            {currentPage === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                <UploadPage file={uploadFile} setFile={setUploadFile} progress={uploadProgress} result={uploadResult} onUpload={handleUpload} isDragging={isDragging} setIsDragging={setIsDragging} onProtect={handleProtect} />
              </motion.div>
            )}

            {currentPage === 'alerts' && (
              <motion.div key="alerts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <AlertsPage alerts={alerts} />
              </motion.div>
            )}

            {currentPage === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                <AccountPage user={user} onLogout={handleLogout} />
              </motion.div>
            )}

            {currentPage === 'detect' && (
              <motion.div key="detect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                <DetectPage file={detectFile} setFile={setDetectFile} progress={detectProgress} result={detectResult} onDetect={handleDetect} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 bottom-nav z-30">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  activeNav === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.id === 'alerts' && alerts.filter(a => !a.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {alerts.filter(a => !a.isRead).length}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialog?.open} onOpenChange={(open) => !open && setCertificateDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              Ownership Certificate
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Content ID: {certificateDialog?.contentId}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-pink-50 p-4 rounded-xl font-mono text-xs whitespace-pre overflow-x-auto">
            {certificateDialog?.certificate}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(certificateDialog?.certificate || '')} className="border-pink-200 hover:bg-pink-50">
              <Copy className="w-4 h-4 mr-2" /> Copy Certificate
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const blob = new Blob([certificateDialog?.certificate || ''], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `certificate-${certificateDialog?.contentId}.txt`;
              a.click();
            }} className="border-pink-200 hover:bg-pink-50">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Home Page Component
function HomePage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-shield mx-auto flex items-center justify-center mb-4 animate-pulse-pink">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Upload your Content
          <br />
          <span className="text-primary">Before It's Misused</span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Protect your digital images with invisible watermarks and unique fingerprints. Detect unauthorized use instantly.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button size="lg" onClick={onGetStarted} className="bg-primary hover:bg-primary/90 glow-pink">
            <Shield className="w-5 h-5 mr-2" /> Start Protecting
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white border-pink-100 card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">184</p>
            <p className="text-sm text-muted-foreground">TOTAL</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-pink-100 card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">24</p>
            <p className="text-sm text-muted-foreground">MISUSE ALERTS</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {[
          { icon: Lock, title: 'Invisible Watermark', desc: 'Embedded in your content' },
          { icon: Fingerprint, title: 'Unique Fingerprint', desc: 'AI-powered detection' },
          { icon: Scan, title: 'Instant Alerts', desc: 'Real-time monitoring' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <Card className="bg-white border-pink-100 card-hover">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Auth Form Component
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
}) {
  return (
    <Card className="bg-white border-pink-100">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl text-foreground">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {type === 'login' 
            ? 'Sign in to access your protected content' 
            : 'Start protecting your digital content today'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName?.(e.target.value)}
                className="bg-pink-50 border-pink-100 focus:border-primary focus:ring-primary"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-pink-50 border-pink-100 focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-pink-50 border-pink-100 focus:border-primary focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner w-4 h-4 mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {type === 'login' ? (
            <>
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={onSwitch}>
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={onSwitch}>
                Sign in
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Component
function Dashboard({
  user,
  images,
  alerts,
  onProtect,
  onDelete,
  onUpload,
}: {
  user: User;
  images: Image[];
  alerts: Alert[];
  onProtect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpload: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-pink-100 card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{images.length}</p>
                <p className="text-xs text-muted-foreground">Total Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-pink-100 card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{images.filter(i => i.watermarkEmbedded).length}</p>
                <p className="text-xs text-muted-foreground">Protected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-pink-100 card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
                <p className="text-xs text-muted-foreground">Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-pink-100 card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{alerts.filter(a => !a.isRead).length}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Protected Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">My Protected Content</h3>
          <Button size="sm" onClick={onUpload} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1" /> Upload
          </Button>
        </div>

        {images.length === 0 ? (
          <Card className="bg-white border-pink-100">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-2">No images yet</h4>
              <p className="text-sm text-muted-foreground mb-4">Upload your first image to start protecting</p>
              <Button onClick={onUpload} className="bg-primary hover:bg-primary/90">
                <Upload className="w-4 h-4 mr-2" /> Upload Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="bg-white border-pink-100 overflow-hidden card-hover">
                <div className="aspect-video bg-pink-50 relative">
                  <img
                    src={`/api/images/${image.id}`}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                  {image.watermarkEmbedded && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" /> Protected
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-foreground truncate text-sm">{image.originalName}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(image.size)}</span>
                    <span>•</span>
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {!image.watermarkEmbedded && (
                      <Button size="sm" onClick={() => onProtect(image.id)} className="flex-1 bg-primary hover:bg-primary/90">
                        <Shield className="w-3 h-3 mr-1" /> Protect
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onDelete(image.id)} className="border-pink-200 hover:bg-pink-50">
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
          <h3 className="font-semibold text-foreground mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <Card key={alert.id} className={`bg-white border-pink-100 ${alert.severity === 'warning' ? 'border-l-4 border-l-orange-400' : alert.severity === 'error' ? 'border-l-4 border-l-red-400' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      alert.severity === 'warning' ? 'bg-orange-100' : 
                      alert.severity === 'error' ? 'bg-red-100' : 
                      alert.severity === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {alert.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      ) : alert.severity === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : alert.severity === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Bell className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    </div>
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

// Upload Page Component
function UploadPage({
  file,
  setFile,
  progress,
  result,
  onUpload,
  isDragging,
  setIsDragging,
  onProtect,
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  progress: number;
  result: { success: boolean; message: string; image?: Image; isDuplicate?: boolean } | null;
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
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  }, [setFile, setIsDragging]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <Card className="bg-white border-pink-100">
      <CardHeader className="text-center">
        {result?.success ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-shield mx-auto mb-4"
          >
            <div className="w-full h-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
        )}
        <CardTitle className="text-foreground">
          {result?.success ? 'Protection Added!' : 'Upload Image'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {result?.success 
            ? 'Your content is now protected' 
            : 'Select an image to protect with watermark and fingerprint'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result ? (
          <>
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-primary bg-pink-50 scale-102' 
                  : 'border-pink-200 hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {file ? file.name : 'Drag & drop your image here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file 
                      ? `${formatFileSize(file.size)} • ${file.type.split('/')[1].toUpperCase()}`
                      : 'JPG, PNG, WebP (max 10MB)'}
                  </p>
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-pink-200 hover:bg-pink-50">
                  Browse Files
                </Button>
              </div>
            </div>

            {/* File Preview */}
            {file && (
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => onUpload(file)} 
                  disabled={progress > 0 && progress < 100}
                  className="bg-primary hover:bg-primary/90"
                >
                  {progress > 0 && progress < 100 ? (
                    <div className="spinner w-4 h-4 mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload
                </Button>
              </div>
            )}

            {/* Progress */}
            {progress > 0 && progress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-pink-100" />
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Success indicators */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Invisible Watermark Embedded</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Fingerprint Generated</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Protected Successfully</span>
              </div>
            </div>

            {result.image && (
              <div className="p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Content ID</p>
                <p className="font-mono text-primary font-medium">{result.image.contentId}</p>
              </div>
            )}

            {result.image && !result.image.watermarkEmbedded && (
              <Button onClick={() => onProtect(result.image!.id)} className="w-full bg-primary hover:bg-primary/90">
                <Shield className="w-4 h-4 mr-2" /> Protect Content
              </Button>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setUploadResult(null); }} className="w-full border-pink-200 hover:bg-pink-50">
              Upload Another
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Alerts Page Component
function AlertsPage({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card className="bg-white border-pink-100">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="font-medium text-foreground mb-2">No Alerts</h4>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card key={alert.id} className={`bg-white border-pink-100 ${
            alert.severity === 'warning' ? 'border-l-4 border-l-orange-400' : 
            alert.severity === 'error' ? 'border-l-4 border-l-red-400' : 
            alert.severity === 'success' ? 'border-l-4 border-l-green-400' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  alert.severity === 'warning' ? 'bg-orange-100' : 
                  alert.severity === 'error' ? 'bg-red-100' : 
                  alert.severity === 'success' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {alert.severity === 'warning' ? (
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                  ) : alert.severity === 'error' ? (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  ) : alert.severity === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Bell className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                    {!alert.isRead && (
                      <Badge className="bg-primary">New</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// Account Page Component
function AccountPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <Card className="bg-white border-pink-100">
      <CardHeader className="text-center">
        <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-foreground">{user.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-pink-50 rounded-xl">
          <p className="text-sm text-muted-foreground mb-1">Member Since</p>
          <p className="font-medium text-foreground">{formatDate(user.createdAt)}</p>
        </div>
        <div className="p-4 bg-pink-50 rounded-xl">
          <p className="text-sm text-muted-foreground mb-1">Account ID</p>
          <p className="font-mono text-sm text-foreground">{user.id}</p>
        </div>
        <Button onClick={onLogout} variant="outline" className="w-full border-pink-200 hover:bg-pink-50 text-muted-foreground">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </CardContent>
    </Card>
  );
}

// Detect Page Component
function DetectPage({
  file,
  setFile,
  progress,
  result,
  onDetect,
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  progress: number;
  result: { isMatchFound: boolean; matches: Match[]; totalScanned: number; message: string } | null;
  onDetect: (f: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <Card className="bg-white border-pink-100">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-foreground">Detect Duplicates</CardTitle>
        <CardDescription className="text-muted-foreground">
          Scan an image to check for duplicates in the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result ? (
          <>
            {/* File Input */}
            <div className="border-2 border-dashed border-pink-200 hover:border-primary/50 rounded-2xl p-8 text-center transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <Scan className="w-7 h-7 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">
                {file ? file.name : 'Select image to scan'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Compare against all protected images
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-pink-200 hover:bg-pink-50">
                Browse Files
              </Button>
            </div>

            {/* File Preview */}
            {file && (
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => onDetect(file)} 
                  disabled={progress > 0 && progress < 100}
                  className="bg-primary hover:bg-primary/90"
                >
                  {progress > 0 && progress < 100 ? (
                    <div className="spinner w-4 h-4 mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Scan
                </Button>
              </div>
            )}

            {/* Progress */}
            {progress > 0 && progress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scanning...</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-pink-100" />
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Result */}
            <div className={`p-4 rounded-xl ${result.isMatchFound ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="flex items-center gap-3">
                {result.isMatchFound ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                <div>
                  <p className={`font-medium ${result.isMatchFound ? 'text-red-700' : 'text-green-700'}`}>
                    {result.message}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Scanned {result.totalScanned} images
                  </p>
                </div>
              </div>
            </div>

            {/* Matches */}
            {result.isMatchFound && result.matches.length > 0 && (
              <div className="space-y-3">
                {result.matches.map((match, i) => (
                  <div key={i} className="p-4 bg-pink-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{match.originalName}</p>
                        <p className="text-sm text-muted-foreground">Owner: {match.owner}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{match.contentId}</p>
                      </div>
                      <Badge className={match.isExactMatch ? 'bg-red-500' : 'bg-orange-500'}>
                        {match.isExactMatch ? 'Exact' : `${Math.round(match.similarity * 100)}%`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setDetectResult(null); }} className="w-full border-pink-200 hover:bg-pink-50">
              Scan Another
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
