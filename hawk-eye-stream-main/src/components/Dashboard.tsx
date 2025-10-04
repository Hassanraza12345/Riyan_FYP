import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityCard, Activity } from './ActivityCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  BarChart3, 
  Activity as ActivityIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Trash2,
  Filter
} from 'lucide-react';

interface DashboardProps {
  activities: Activity[];
  onClearActivities: () => void;
}

export const Dashboard = ({ activities, onClearActivities }: DashboardProps) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Statistics calculations
  const stats = useMemo(() => {
    const total = activities.length;
    const critical = activities.filter(a => a.severity === 'critical').length;
    const warning = activities.filter(a => a.severity === 'warning').length;
    const normal = activities.filter(a => a.severity === 'success').length;
    const info = activities.filter(a => a.severity === 'info').length;

    return { total, critical, warning, normal, info };
  }, [activities]);

  // Chart data for activity frequency
  const chartData = useMemo(() => {
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity.name] = (acc[activity.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(activityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 activities
  }, [activities]);

  // Pie chart data for severity distribution
  const severityData = [
    { name: 'Critical', value: stats.critical, color: 'hsl(var(--critical))' },
    { name: 'Warning', value: stats.warning, color: 'hsl(var(--warning))' },
    { name: 'Normal', value: stats.normal, color: 'hsl(var(--success))' },
    { name: 'Info', value: stats.info, color: 'hsl(var(--info))' }
  ].filter(item => item.value > 0);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    if (filterSeverity === 'all') return activities;
    return activities.filter(a => a.severity === filterSeverity);
  }, [activities, filterSeverity]);

  // Recent activities (last 24 hours simulation)
  const recentActivities = useMemo(() => {
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-secondary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <ActivityIcon className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-critical/10 to-critical/5 border-critical/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-critical">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-critical" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-warning">{stats.warning}</p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Normal</p>
              <p className="text-2xl font-bold text-success">{stats.normal}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </Card>
      </div>

      {/* Charts and Activity Feed */}
      <Tabs defaultValue="feed" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-secondary text-foreground rounded-md px-3 py-1 text-sm border border-border"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="success">Normal</option>
                <option value="info">Info</option>
              </select>
            </div>
            <Button
              onClick={onClearActivities}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        <TabsContent value="feed" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
              <Badge variant="outline">
                {filteredActivities.length} activities
              </Badge>
            </div>
            
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {filterSeverity === 'all' 
                        ? 'No activities detected yet. Start the live feed to begin monitoring.'
                        : `No ${filterSeverity} activities found.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Activity Frequency
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3" />
              <p>Timeline chart coming soon...</p>
              <p className="text-sm">This will show activity patterns over time</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};