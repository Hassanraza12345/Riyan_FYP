import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

export interface Activity {
  id: string;
  name: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'success' | 'info';
  confidence?: number;
}

interface ActivityCardProps {
  activity: Activity;
}

const getSeverityConfig = (severity: Activity['severity']) => {
  switch (severity) {
    case 'critical':
      return {
        bgColor: 'bg-critical/10 border-critical/30',
        textColor: 'text-critical',
        badgeColor: 'bg-critical text-critical-foreground',
        icon: AlertTriangle,
        label: 'CRITICAL'
      };
    case 'warning':
      return {
        bgColor: 'bg-warning/10 border-warning/30',
        textColor: 'text-warning',
        badgeColor: 'bg-warning text-warning-foreground',
        icon: AlertCircle,
        label: 'WARNING'
      };
    case 'success':
      return {
        bgColor: 'bg-success/10 border-success/30',
        textColor: 'text-success',
        badgeColor: 'bg-success text-success-foreground',
        icon: CheckCircle,
        label: 'NORMAL'
      };
    default:
      return {
        bgColor: 'bg-info/10 border-info/30',
        textColor: 'text-info',
        badgeColor: 'bg-info text-info-foreground',
        icon: Info,
        label: 'INFO'
      };
  }
};

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const config = getSeverityConfig(activity.severity);
  const IconComponent = config.icon;

  return (
    <Card className={`p-4 ${config.bgColor} border-2 transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${config.textColor}`} />
          <h3 className="font-semibold text-foreground">{activity.name}</h3>
        </div>
        <Badge className={`${config.badgeColor} text-xs font-semibold`}>
          {config.label}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {new Date(activity.timestamp).toLocaleTimeString()}
        </span>
        {activity.confidence && (
          <span className={`${config.textColor} font-medium`}>
            {Math.round(activity.confidence * 100)}%
          </span>
        )}
      </div>
    </Card>
  );
};