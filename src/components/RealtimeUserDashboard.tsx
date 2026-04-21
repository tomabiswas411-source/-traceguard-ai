'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Clock, Monitor, Smartphone, Tablet,
  Chrome, Circle, TrendingUp, Eye, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeUsers, useRealtimeStats } from '@/lib/useRealtimeUsers';

// Status indicator
const StatusDot = ({ status }: { status: 'online' | 'away' | 'offline' }) => {
  const colors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };
  
  return (
    <span className={`relative flex h-3 w-3`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[status]}`}></span>
    </span>
  );
};

// Device icon
const DeviceIcon = ({ device }: { device: 'desktop' | 'mobile' | 'tablet' }) => {
  const icons = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet
  };
  const Icon = icons[device];
  return <Icon className="w-4 h-4 text-muted-foreground" />;
};

// Activity item
const ActivityItem = ({ activity, index }: { activity: { 
  id: string; 
  userName: string; 
  action: string; 
  timestamp: Date | null;
  details?: Record<string, unknown>;
}; index: number }) => {
  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐';
    if (action.includes('upload')) return '📤';
    if (action.includes('protect')) return '🛡️';
    if (action.includes('detect')) return '🔍';
    if (action.includes('view')) return '👁️';
    return '⚡';
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <span className="text-lg">{getActionIcon(activity.action)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">
          <span className="font-medium">{activity.userName}</span>
          <span className="text-muted-foreground"> {activity.action}</span>
        </p>
      </div>
      <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
    </motion.div>
  );
};

// Online user item
const OnlineUserItem = ({ user, index }: { user: {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'away' | 'offline';
  currentPage: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
}; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10"
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-shield flex items-center justify-center text-white font-medium text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <StatusDot status={user.status} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
        <div className="flex items-center gap-2">
          <DeviceIcon device={user.device} />
          <span className="text-xs text-muted-foreground truncate">{user.currentPage}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Chrome className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{user.browser}</span>
      </div>
    </motion.div>
  );
};

export default function RealtimeUserDashboard() {
  const { onlineUsers, recentActivities, loading, onlineCount } = useRealtimeUsers();
  const { stats } = useRealtimeStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-purple-500/10 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Online Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Online Now</p>
                  <p className="text-3xl font-bold text-gradient-animate">{onlineCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500">Live tracking</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activities</p>
                  <p className="text-3xl font-bold text-foreground">{stats.activities}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-time Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-xl font-bold text-green-500 flex items-center gap-2">
                    <Circle className="w-3 h-3 fill-green-500 animate-pulse" />
                    Connected
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Online Users Panel */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Online Users
              </CardTitle>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {onlineCount} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {onlineUsers.length > 0 ? (
                  onlineUsers.map((user, index) => (
                    <OnlineUserItem key={user.id} user={user} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No users online</p>
                    <p className="text-xs">Be the first to login!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Panel */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Live Activity
              </CardTitle>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Real-time
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-xs">Activity will appear here</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
