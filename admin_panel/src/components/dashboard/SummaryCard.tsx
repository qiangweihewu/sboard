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
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-20 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg animate-pulse"></div>
            {trend && (
              <div className="h-4 w-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse"></div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </div>
            <div className="flex items-center space-x-2">
              {trend && (
                <Badge variant="outline" className={`text-xs font-medium px-2 py-1 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="ml-1">{trend}</span>
                </Badge>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Enhanced decorative gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full translate-y-8 -translate-x-8" />
    </Card>
  );
};

export default SummaryCard;