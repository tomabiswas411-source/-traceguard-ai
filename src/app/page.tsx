'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Upload, Search, LogOut, User, Bell, Image as ImageIcon, 
  CheckCircle, AlertTriangle, XCircle, FileText, Download, Trash2,
  Lock, Fingerprint, Scan, Home, Menu, X, Eye, Copy,
  Plus, AlertCircle, Clock, FileCheck, ShieldCheck, Settings,
  ChevronRight, Sparkles, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
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
        toast({ title: 'Welcome back!', description: data.message });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
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
        toast({ title: 'Welcome!', description: data.message });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
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
      toast({ title: 'Goodbye!', description: 'Logged out successfully' });
    } catch {
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
        setUploadResult({ success: false, message: data.error });
      }
    } catch {
      clearInterval(progressInterval);
      setUploadResult({ success: false, message: 'Upload failed' });
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
        toast({ title: 'Protected!', description: data.message });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
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
    } catch {
      clearInterval(progressInterval);
      toast({ title: 'Error', description: 'Detection failed', variant: 'destructive' });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchImages();
        toast({ title: 'Deleted', description: 'Image removed' });
      }
    } catch {
      toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
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
      <div className="min-h-screen bg-gradient-main pattern-grid flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="w-20 h-20 rounded-2xl bg-gradient-shield mx-auto mb-6 flex items-center justify-center animate-pulse-glow"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading TraceGuard AI...</p>
        </div>
      </div>
    );
  }

  // Auth pages (no sidebar)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-main pattern-grid flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-border/50">
          <div className="container-wide py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setCurrentPage('home')}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-shield flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">TraceGuard AI</h1>
                  <p className="text-sm text-muted-foreground">Protect Before It's Misused</p>
                </div>
              </motion.div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => setCurrentPage('login')} className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
                <Button onClick={() => setCurrentPage('register')} className="btn-gradient-primary">
                  Get Started <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container-wide py-8">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <HomePage onGetStarted={() => setCurrentPage('register')} />
              </motion.div>
            )}

            {currentPage === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-lg mx-auto">
                <AuthForm type="login" email={email} password={password} setEmail={setEmail} setPassword={setPassword} onSubmit={handleLogin} isLoading={isSubmitting} onSwitch={() => setCurrentPage('register')} />
              </motion.div>
            )}

            {currentPage === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-lg mx-auto">
                <AuthForm type="register" email={email} password={password} name={name} setEmail={setEmail} setPassword={setPassword} setName={setName} onSubmit={handleRegister} isLoading={isSubmitting} onSwitch={() => setCurrentPage('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-6 mt-auto">
          <div className="container-wide text-center">
            <p className="text-muted-foreground">© 2024 TraceGuard AI. Protect Before It's Misused.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated layout with wide sidebar
  return (
    <div className="min-h-screen bg-gradient-main pattern-grid flex">
      {/* Desktop Sidebar - Wide */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-border/50 fixed h-full z-40 shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-shield flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TraceGuard AI</h1>
              <p className="text-sm text-muted-foreground">Protect Before It's Misused</p>
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
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium ${
                    activeNav === item.id
                      ? 'bg-gradient-shield text-white shadow-lg'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && alerts.filter(a => !a.isRead).length > 0 && (
                    <Badge className="ml-auto bg-white/20 text-white border-0">
                      {alerts.filter(a => !a.isRead).length}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Quick Actions
            </h4>
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setCurrentPage('detect')}
              >
                <Search className="w-4 h-4 mr-2" /> Detect Duplicates
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => handleNavClick('upload')}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload New
              </Button>
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-shield flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full">
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
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-shield flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-foreground">TraceGuard AI</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
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
              <div className="p-4 border-t border-border/50">
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50">
          <div className="container-wide flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {activeNav === 'dashboard' && 'Dashboard'}
                  {activeNav === 'upload' && 'Protect Content'}
                  {activeNav === 'alerts' && 'Misuse Alerts'}
                  {activeNav === 'account' && 'My Account'}
                </h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {activeNav === 'dashboard' && 'Overview of your protected content'}
                  {activeNav === 'upload' && 'Upload and protect your images'}
                  {activeNav === 'alerts' && 'Monitor for unauthorized use'}
                  {activeNav === 'account' && 'Manage your profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentPage('detect')} className="hidden sm:flex">
                <Search className="w-4 h-4 mr-2" /> Detect
              </Button>
              <Button onClick={() => handleNavClick('upload')} className="btn-gradient-primary">
                <Plus className="w-4 h-4 mr-2" /> Upload
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 container-wide py-6 pb-24 lg:pb-6">
          <AnimatePresence mode="wait">
            {currentPage === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Dashboard user={user} images={images} alerts={alerts} onProtect={handleProtect} onDelete={handleDeleteImage} onUpload={() => handleNavClick('upload')} />
              </motion.div>
            )}

            {currentPage === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
                <UploadPage file={uploadFile} setFile={setUploadFile} progress={uploadProgress} result={uploadResult} onUpload={handleUpload} isDragging={isDragging} setIsDragging={setIsDragging} onProtect={handleProtect} />
              </motion.div>
            )}

            {currentPage === 'alerts' && (
              <motion.div key="alerts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <AlertsPage alerts={alerts} />
              </motion.div>
            )}

            {currentPage === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
                <AccountPage user={user} onLogout={handleLogout} />
              </motion.div>
            )}

            {currentPage === 'detect' && (
              <motion.div key="detect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
                <DetectPage file={detectFile} setFile={setDetectFile} progress={detectProgress} result={detectResult} onDetect={handleDetect} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/50 bottom-nav z-30">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  activeNav === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.id === 'alerts' && alerts.filter(a => !a.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-shield text-white text-xs rounded-full flex items-center justify-center">
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-shield flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Ownership Certificate
            </DialogTitle>
            <DialogDescription>
              Content ID: <code className="font-mono text-primary">{certificateDialog?.contentId}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/30 p-6 rounded-xl font-mono text-sm whitespace-pre overflow-x-auto">
            {certificateDialog?.certificate}
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => copyToClipboard(certificateDialog?.certificate || '')}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button onClick={() => {
              const blob = new Blob([certificateDialog?.certificate || ''], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `certificate-${certificateDialog?.contentId}.txt`;
              a.click();
            }}>
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
    <div className="py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="w-28 h-28 rounded-3xl bg-gradient-shield mx-auto flex items-center justify-center shadow-2xl animate-pulse-glow">
            <ShieldCheck className="w-14 h-14 text-white" />
          </div>
        </motion.div>
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Upload your Content
          <br />
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Before It's Misused
          </span>
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Protect your digital images with invisible watermarks and unique fingerprints. 
          Detect unauthorized use instantly across the internet.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button size="lg" onClick={onGetStarted} className="btn-gradient-primary text-lg px-8">
            <Sparkles className="w-5 h-5 mr-2" /> Start Protecting
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            <Eye className="w-5 h-5 mr-2" /> See How It Works
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { value: '184', label: 'Total Protected', icon: Shield },
          { value: '24', label: 'Misuse Alerts', icon: AlertTriangle },
          { value: '99%', label: 'Success Rate', icon: CheckCircle },
          { value: '<1s', label: 'Detection Speed', icon: Zap },
        ].map((stat, i) => (
          <Card key={i} className="card-modern text-center">
            <CardContent className="p-6">
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Features */}
      <div className="max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold text-foreground text-center mb-8">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Upload, title: 'Upload', desc: 'Upload your images securely to our platform' },
            { icon: Lock, title: 'Protect', desc: 'Embed invisible watermarks and generate fingerprints' },
            { icon: Scan, title: 'Monitor', desc: 'Get instant alerts when misuse is detected' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Card className="card-modern h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
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
    <Card className="card-modern">
      <CardHeader className="text-center pb-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {type === 'login' 
            ? 'Sign in to access your protected content' 
            : 'Start protecting your digital content today'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          {type === 'register' && (
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName?.(e.target.value)}
                className="h-12"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <Button type="submit" className="w-full h-12 btn-gradient-primary" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner w-5 h-5" />
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {type === 'login' ? 'Sign In' : 'Create Account'}
              </>
            )}
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
  const protectedCount = images.filter(i => i.watermarkEmbedded).length;
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, {user.name}! 👋</h2>
          <p className="text-muted-foreground">Here's an overview of your protected content</p>
        </div>
        <Button onClick={onUpload} className="btn-gradient-primary">
          <Plus className="w-4 h-4 mr-2" /> Upload New
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-purple flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{images.length}</p>
                <p className="text-sm text-muted-foreground">Total Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-cyan flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{protectedCount}</p>
                <p className="text-sm text-muted-foreground">Protected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-pink flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{unreadAlerts}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Protected Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">My Protected Content</h3>
          {images.length > 0 && (
            <Button variant="outline" onClick={onUpload}>
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
          )}
        </div>

        {images.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-shield mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">No images yet</h4>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload your first image to start protecting your digital content with invisible watermarks and fingerprints.
              </p>
              <Button onClick={onUpload} className="btn-gradient-primary">
                <Upload className="w-4 h-4 mr-2" /> Upload Your First Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="card-modern overflow-hidden group">
                <div className="aspect-video bg-secondary/30 relative">
                  <img
                    src={`/api/images/${image.id}`}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                  {image.watermarkEmbedded && (
                    <Badge className="absolute top-3 right-3 badge-success">
                      <CheckCircle className="w-3 h-3 mr-1" /> Protected
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="font-medium text-foreground truncate mb-1">{image.originalName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span>{formatFileSize(image.size)}</span>
                    <span>•</span>
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    {!image.watermarkEmbedded && (
                      <Button size="sm" onClick={() => onProtect(image.id)} className="flex-1 btn-gradient-primary">
                        <Shield className="w-3 h-3 mr-1" /> Protect
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onDelete(image.id)}>
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
          <h3 className="text-xl font-semibold text-foreground mb-4">Recent Alerts</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {alerts.slice(0, 4).map((alert) => (
              <Card key={alert.id} className={`card-modern ${
                alert.severity === 'warning' ? 'border-l-4 border-l-amber-500' : 
                alert.severity === 'error' ? 'border-l-4 border-l-red-500' : 
                alert.severity === 'success' ? 'border-l-4 border-l-emerald-500' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alert.severity === 'warning' ? 'bg-amber-100' : 
                      alert.severity === 'error' ? 'bg-red-100' : 
                      alert.severity === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                      {alert.severity === 'warning' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      ) : alert.severity === 'error' ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : alert.severity === 'success' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Bell className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground">{alert.title}</p>
                        {!alert.isRead && (
                          <Badge className="badge-gradient shrink-0">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(alert.createdAt)}
                      </p>
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
    <Card className="card-modern">
      <CardHeader className="text-center pb-4">
        {result?.success ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-3xl bg-gradient-shield mx-auto mb-4 flex items-center justify-center shadow-xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
        )}
        <CardTitle className="text-2xl">
          {result?.success ? 'Protection Added!' : 'Upload Image'}
        </CardTitle>
        <CardDescription className="text-base">
          {result?.success 
            ? 'Your content is now protected with invisible watermark' 
            : 'Select an image to protect with watermark and fingerprint'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result ? (
          <>
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                isDragging 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-border hover:border-primary/50 hover:bg-secondary/30'
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-shield flex items-center justify-center mx-auto shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    {file ? file.name : 'Drag & drop your image here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file 
                      ? `${formatFileSize(file.size)} • ${file.type.split('/')[1].toUpperCase()}`
                      : 'Supports JPG, PNG, WebP (max 10MB)'}
                  </p>
                </div>
                <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
              </div>
            </div>

            {/* File Preview */}
            {file && (
              <div className="flex items-center justify-between p-5 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow">
                    <ImageIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => onUpload(file)} 
                  disabled={progress > 0 && progress < 100}
                  className="btn-gradient-primary"
                  size="lg"
                >
                  {progress > 0 && progress < 100 ? (
                    <div className="spinner w-5 h-5 mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload
                </Button>
              </div>
            )}

            {/* Progress */}
            {progress > 0 && progress < 100 && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Success indicators */}
            <div className="space-y-3">
              {[
                { icon: FileCheck, text: 'File Uploaded Successfully' },
                { icon: Fingerprint, text: 'Fingerprint Generated' },
                { icon: Lock, text: 'Ready for Protection' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-emerald-700">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {result.image && (
              <div className="p-5 bg-secondary/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Content ID</p>
                <p className="font-mono text-primary font-semibold text-lg">{result.image.contentId}</p>
              </div>
            )}

            {result.image && !result.image.watermarkEmbedded && (
              <Button onClick={() => onProtect(result.image!.id)} className="w-full btn-gradient-primary h-12">
                <Shield className="w-4 h-4 mr-2" /> Protect Content
              </Button>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setUploadResult(null); }} className="w-full h-12">
              Upload Another Image
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
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-cyan mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">All Clear!</h4>
            <p className="text-muted-foreground">No alerts to show. You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`card-modern ${
              alert.severity === 'warning' ? 'border-l-4 border-l-amber-500' : 
              alert.severity === 'error' ? 'border-l-4 border-l-red-500' : 
              alert.severity === 'success' ? 'border-l-4 border-l-emerald-500' : ''
            }`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    alert.severity === 'warning' ? 'bg-amber-100' : 
                    alert.severity === 'error' ? 'bg-red-100' : 
                    alert.severity === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
                  }`}>
                    {alert.severity === 'warning' ? (
                      <AlertTriangle className="w-7 h-7 text-amber-600" />
                    ) : alert.severity === 'error' ? (
                      <AlertCircle className="w-7 h-7 text-red-600" />
                    ) : alert.severity === 'success' ? (
                      <CheckCircle className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <Bell className="w-7 h-7 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{alert.title}</h4>
                      {!alert.isRead && <Badge className="badge-gradient">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(alert.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Account Page Component
function AccountPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="card-modern">
        <CardHeader className="text-center pb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-shield mx-auto mb-4 flex items-center justify-center shadow-lg">
            <User className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription className="text-base">{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-5 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Member Since</p>
            <p className="font-semibold text-foreground">{formatDate(user.createdAt)}</p>
          </div>
          <div className="p-5 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Account ID</p>
            <p className="font-mono text-sm text-foreground">{user.id}</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="w-full h-12">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
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
    <Card className="card-modern">
      <CardHeader className="text-center pb-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-cyan flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Search className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl">Detect Duplicates</CardTitle>
        <CardDescription className="text-base">
          Scan an image to check for duplicates in our protected database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result ? (
          <>
            {/* File Input */}
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-10 text-center transition-all hover:bg-secondary/30">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-gradient-cyan flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                {file ? file.name : 'Select image to scan'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Compare against all protected images in the database
              </p>
              <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </Button>
            </div>

            {/* File Preview */}
            {file && (
              <div className="flex items-center justify-between p-5 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow">
                    <ImageIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => onDetect(file)} 
                  disabled={progress > 0 && progress < 100}
                  className="btn-gradient-secondary"
                  size="lg"
                >
                  {progress > 0 && progress < 100 ? (
                    <div className="spinner w-5 h-5 mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Scan
                </Button>
              </div>
            )}

            {/* Progress */}
            {progress > 0 && progress < 100 && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scanning database...</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Result */}
            <div className={`p-6 rounded-xl ${result.isMatchFound ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <div className="flex items-center gap-4">
                {result.isMatchFound ? (
                  <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <p className={`text-lg font-semibold ${result.isMatchFound ? 'text-red-700' : 'text-emerald-700'}`}>
                    {result.message}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scanned {result.totalScanned} images in database
                  </p>
                </div>
              </div>
            </div>

            {/* Matches */}
            {result.isMatchFound && result.matches.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Matching Results</h4>
                {result.matches.map((match, i) => (
                  <div key={i} className="p-5 bg-secondary/30 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{match.originalName}</p>
                        <p className="text-sm text-muted-foreground">Owner: {match.owner}</p>
                        <p className="text-xs font-mono text-primary mt-2">{match.contentId}</p>
                      </div>
                      <Badge className={match.isExactMatch ? 'badge-error' : 'badge-warning'}>
                        {match.isExactMatch ? 'Exact Match' : `${Math.round(match.similarity * 100)}% Similar`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={() => { setFile(null); setDetectResult(null); }} className="w-full h-12">
              Scan Another Image
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
