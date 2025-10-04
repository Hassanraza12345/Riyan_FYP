import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LiveFeed } from "./components/LiveFeed";
import { Dashboard } from "./components/Dashboard";
import { Activity } from "./components/ActivityCard";
import { Shield, Activity as ActivityIcon } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  const handleActivityDetected = (activity: Activity) => {
    setActivities(prev => [activity, ...prev]);
  };

  const handleClearActivities = () => {
    setActivities([]);
  };

  const toggleMonitoring = () => {
    setIsMonitoringActive(prev => !prev);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">AI Surveillance System</h1>
                    <p className="text-sm text-muted-foreground">Smart Activity Detection & Monitoring</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ActivityIcon className={`h-5 w-5 ${isMonitoringActive ? 'text-success animate-pulse' : 'text-muted-foreground'}`} />
                    <span className="text-sm text-muted-foreground">
                      Status: {isMonitoringActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Live Feed - Takes up 2 columns on xl screens */}
              <div className="xl:col-span-2">
                <LiveFeed 
                  onActivityDetected={handleActivityDetected}
                  isActive={isMonitoringActive}
                  onToggleActive={toggleMonitoring}
                />
              </div>

              {/* Dashboard - Takes up 1 column on xl screens */}
              <div className="xl:col-span-1">
                <Dashboard 
                  activities={activities}
                  onClearActivities={handleClearActivities}
                />
              </div>
            </div>
          </main>
        </div>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
