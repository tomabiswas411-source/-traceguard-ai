'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Upload, Search, LogOut, User, Bell, Image as ImageIcon, 
  CheckCircle, AlertTriangle, XCircle, FileText, Download, Trash2,
  Lock, Fingerprint, Scan, Home, Menu, X, Eye, Copy, Check
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

// Main Component
export default function TraceGuardApp() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'dashboard' | 'upload' | 'detect'>('home');
  const [images, setImages] = useState<Image[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    
    // Simulate progress
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
    formData.append('file', formData.get('file') || file);
    formData.append('file', file);
    
    // Simulate progress
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading TraceGuard AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentPage(user ? 'dashboard' : 'home')}
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src="/logo.png" 
                alt="TraceGuard AI" 
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  TraceGuard AI
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Image Protection Platform</p>
              </div>
            </motion.div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentPage('dashboard')}
                    className={currentPage === 'dashboard' ? 'bg-primary/20' : ''}
                  >
                    <Home className="w-4 h-4 mr-2" /> Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentPage('upload')}
                    className={currentPage === 'upload' ? 'bg-primary/20' : ''}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentPage('detect')}
                    className={currentPage === 'detect' ? 'bg-primary/20' : ''}
                  >
                    <Search className="w-4 h-4 mr-2" /> Detect
                  </Button>
                  <div className="relative ml-4">
                    <Button variant="ghost" size="sm">
                      <Bell className="w-4 h-4" />
                      {alerts.filter(a => !a.isRead).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                          {alerts.filter(a => !a.isRead).length}
                        </span>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentPage('login')}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setCurrentPage('register')}
                    className="glow-purple"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-border/50"
              >
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}>
                      <Home className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                    <Button variant="ghost" onClick={() => { setCurrentPage('upload'); setMobileMenuOpen(false); }}>
                      <Upload className="w-4 h-4 mr-2" /> Upload
                    </Button>
                    <Button variant="ghost" onClick={() => { setCurrentPage('detect'); setMobileMenuOpen(false); }}>
                      <Search className="w-4 h-4 mr-2" /> Detect
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <Button variant="ghost" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" onClick={() => { setCurrentPage('login'); setMobileMenuOpen(false); }}>
                      Login
                    </Button>
                    <Button onClick={() => { setCurrentPage('register'); setMobileMenuOpen(false); }} className="glow-purple">
                      Get Started
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Home Page */}
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HomePage onGetStarted={() => setCurrentPage('register')} />
            </motion.div>
          )}

          {/* Login Page */}
          {currentPage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <AuthForm
                type="login"
                email={email}
                password={password}
                setEmail={setEmail}
                setPassword={setPassword}
                onSubmit={handleLogin}
                isLoading={isSubmitting}
                onSwitch={() => setCurrentPage('register')}
              />
            </motion.div>
          )}

          {/* Register Page */}
          {currentPage === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
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
                onSwitch={() => setCurrentPage('login')}
              />
            </motion.div>
          )}

          {/* Dashboard Page */}
          {currentPage === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard
                user={user}
                images={images}
                alerts={alerts}
                onProtect={handleProtect}
                onDelete={handleDeleteImage}
                onUpload={() => setCurrentPage('upload')}
                onDetect={() => setCurrentPage('detect')}
              />
            </motion.div>
          )}

          {/* Upload Page */}
          {currentPage === 'upload' && user && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
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

          {/* Detect Page */}
          {currentPage === 'detect' && user && (
            <motion.div
              key="detect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
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

      {/* Footer */}
      <footer className="glass border-t border-border/50 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 TraceGuard AI. Protecting your digital content with advanced fingerprinting technology.
          </p>
        </div>
      </footer>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialog?.open} onOpenChange={(open) => !open && setCertificateDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Ownership Certificate
            </DialogTitle>
            <DialogDescription>
              Content ID: {certificateDialog?.contentId}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/30 p-4 rounded-lg font-mono text-xs whitespace-pre overflow-x-auto">
            {certificateDialog?.certificate}
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(certificateDialog?.certificate || '')}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Certificate
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const blob = new Blob([certificateDialog?.certificate || ''], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `certificate-${certificateDialog?.contentId}.txt`;
                a.click();
              }}
            >
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            AI-Powered Protection
          </Badge>
        </motion.div>
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Protect Your Digital
          </span>
          <br />
          <span className="text-foreground">Content with AI</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          TraceGuard AI embeds invisible watermarks and generates unique fingerprints 
          for your images, enabling detection of unauthorized use across the internet.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button size="lg" onClick={onGetStarted} className="glow-purple animate-pulse-glow">
            <Shield className="w-5 h-5 mr-2" /> Start Protecting Now
          </Button>
          <Button size="lg" variant="outline">
            <Eye className="w-5 h-5 mr-2" /> See How It Works
          </Button>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: <Lock className="w-8 h-8" />,
            title: 'Invisible Watermarking',
            description: 'Embed undetectable watermarks in your images that survive compression, cropping, and editing.',
            color: 'from-purple-500 to-purple-600',
          },
          {
            icon: <Fingerprint className="w-8 h-8" />,
            title: 'Content Fingerprinting',
            description: 'Generate unique fingerprints for each image using advanced perceptual hashing algorithms.',
            color: 'from-pink-500 to-pink-600',
          },
          {
            icon: <Scan className="w-8 h-8" />,
            title: 'Duplicate Detection',
            description: 'Automatically detect when your protected content is reused or duplicated elsewhere.',
            color: 'from-blue-500 to-blue-600',
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <Card className="glass h-full hover:border-primary/30 transition-all duration-300 group">
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Upload', desc: 'Upload your image to TraceGuard' },
            { step: '02', title: 'Protect', desc: 'Click "Protect Content" to embed watermark' },
            { step: '03', title: 'Fingerprint', desc: 'Get unique Content ID and certificate' },
            { step: '04', title: 'Detect', desc: 'Scan for duplicates anywhere' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{item.step}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-primary">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        className="text-center glass rounded-2xl p-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
      >
        <h3 className="text-xl font-bold mb-4">Ready to protect your content?</h3>
        <p className="text-muted-foreground mb-6">
          Join thousands of creators who trust TraceGuard AI to protect their digital assets.
        </p>
        <Button size="lg" onClick={onGetStarted} className="glow-purple">
          Get Started Free
        </Button>
      </motion.div>
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
    <Card className="glass">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
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
        <form onSubmit={onSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName?.(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-secondary/50"
            />
          </div>
          <Button type="submit" className="w-full glow-purple" disabled={isLoading}>
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
  onDetect,
}: {
  user: User;
  images: Image[];
  alerts: Alert[];
  onProtect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpload: () => void;
  onDetect: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, {user.name}!</h2>
            <p className="text-muted-foreground">
              You have {images.length} protected images and {alerts.filter(a => !a.isRead).length} unread alerts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onUpload} className="glow-purple">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
            <Button variant="outline" onClick={onDetect}>
              <Search className="w-4 h-4 mr-2" /> Detect
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Images', value: images.length, icon: <ImageIcon className="w-5 h-5" /> },
          { label: 'Protected', value: images.filter(i => i.watermarkEmbedded).length, icon: <Lock className="w-5 h-5" /> },
          { label: 'Alerts', value: alerts.length, icon: <Bell className="w-5 h-5" /> },
          { label: 'Unread', value: alerts.filter(a => !a.isRead).length, icon: <AlertTriangle className="w-5 h-5" /> },
        ].map((stat, i) => (
          <Card key={i} className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="images" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="images">My Images</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          {images.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No images yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first image to start protecting your content.</p>
                <Button onClick={onUpload} className="glow-purple">
                  <Upload className="w-4 h-4 mr-2" /> Upload Image
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="glass overflow-hidden group">
                  <div className="aspect-video bg-secondary/30 relative overflow-hidden">
                    <img
                      src={`/api/images/${image.id}`}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                    {image.watermarkEmbedded && (
                      <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" /> Protected
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium truncate mb-1">{image.originalName}</h4>
                    <div className="text-xs text-muted-foreground space-y-1 mb-3">
                      <p>Content ID: <span className="font-mono">{image.contentId}</span></p>
                      <p>Size: {formatFileSize(image.size)}</p>
                      <p>Uploaded: {formatDate(image.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      {!image.watermarkEmbedded && (
                        <Button 
                          size="sm" 
                          onClick={() => onProtect(image.id)}
                          className="flex-1 glow-purple"
                        >
                          <Shield className="w-3 h-3 mr-1" /> Protect
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onDelete(image.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          {alerts.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">No alerts</h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={`glass ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <AlertDescription className="text-sm opacity-80">
                        {alert.message}
                      </AlertDescription>
                      <p className="text-xs mt-1 opacity-60">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                    {!alert.isRead && (
                      <Badge variant="outline" className="text-xs">New</Badge>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
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
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Image
        </CardTitle>
        <CardDescription>
          Upload your image to protect it with invisible watermark and fingerprinting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/10 scale-102' 
              : 'border-border hover:border-primary/50'
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
          <motion.div
            animate={{ scale: isDragging ? 1.05 : 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium mb-1">
                {file ? file.name : 'Drag & drop your image here'}
              </p>
              <p className="text-sm text-muted-foreground">
                {file 
                  ? `${formatFileSize(file.size)} • ${file.type.split('/')[1].toUpperCase()}`
                  : 'Supports JPG, PNG, WebP (max 10MB)'}
              </p>
            </div>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </Button>
          </motion.div>
        </div>

        {/* File Preview */}
        {file && !result && (
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button 
              onClick={() => onUpload(file)} 
              disabled={progress > 0 && progress < 100}
              className="glow-purple"
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
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              result.success 
                ? result.isDuplicate 
                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                result.isDuplicate ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                )
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{result.message}</h4>
                {result.image && (
                  <div className="mt-2 text-sm space-y-1">
                    <p>Content ID: <code className="font-mono text-primary">{result.image.contentId}</code></p>
                    <p>Fingerprint: <code className="font-mono text-xs">{result.image.fingerprintHash.slice(0, 16)}...</code></p>
                    {!result.image.watermarkEmbedded && (
                      <Button 
                        size="sm" 
                        onClick={() => onProtect(result.image!.id)}
                        className="mt-3 glow-purple"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Protect Content
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reset */}
        {(result || file) && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => { setFile(null); }}
          >
            Upload Another Image
          </Button>
        )}
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
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Detect Duplicates
        </CardTitle>
        <CardDescription>
          Scan an image to check if it matches any protected content in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Input */}
        <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center transition-all">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Scan className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-medium mb-1">
            {file ? file.name : 'Select image to scan'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            We'll compare it against all protected images in the database
          </p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
        </div>

        {/* File Preview */}
        {file && !result && (
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button 
              onClick={() => onDetect(file)} 
              disabled={progress > 0 && progress < 100}
              className="glow-blue"
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
              <span>Scanning database...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`p-4 rounded-lg border ${
              result.isMatchFound 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-green-500/10 border-green-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {result.isMatchFound ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium">{result.message}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scanned {result.totalScanned} images in the database
                  </p>
                </div>
              </div>
            </div>

            {/* Matches */}
            {result.isMatchFound && result.matches.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Matching Results</h4>
                {result.matches.map((match, i) => (
                  <div key={i} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{match.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {match.owner}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Content ID: <code className="font-mono text-primary">{match.contentId}</code>
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          match.isExactMatch 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }>
                          {match.isExactMatch ? 'Exact Match' : `${Math.round(match.similarity * 100)}% Similar`}
                        </Badge>
                        {match.protectedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Protected: {formatDate(match.protectedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Reset */}
        {(result || file) && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => { setFile(null); }}
          >
            Scan Another Image
          </Button>
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

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'success': return 'border-green-500/30';
    case 'warning': return 'border-yellow-500/30';
    case 'error': return 'border-red-500/30';
    default: return 'border-blue-500/30';
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <Bell className="w-5 h-5 text-blue-500" />;
  }
}
