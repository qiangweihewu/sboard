// src/components/dashboard/SummaryCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<LucideProps>;
  isLoading?: boolean;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  isLoading = false,
  trend,
  trendDirection = 'neutral'
}) => {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            {trend && (
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </div>
            <div className="flex items-center space-x-2">
              {trend && (
                <Badge variant="outline" className={`text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="ml-1">{trend}</span>
                </Badge>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full -translate-y-10 translate-x-10" />
    </Card>
  );
};

export default SummaryCard;