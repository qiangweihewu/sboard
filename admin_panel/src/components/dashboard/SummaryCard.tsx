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
    <Card className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] animate-fade-in">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/30 to-purple-50/50 dark:from-slate-800/50 dark:via-slate-900/30 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 animate-pulse-slow">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg animate-pulse bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
            {trend && (
              <div className="h-4 w-16 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
              {value}
            </div>
            <div className="flex items-center space-x-2">
              {trend && (
                <Badge variant="outline" className={`text-xs font-medium px-2 py-1 transition-all duration-300 hover:scale-105 ${getTrendColor()}`}>
                  <span className="animate-pulse">{getTrendIcon()}</span>
                  <span className="ml-1">{trend}</span>
                </Badge>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Enhanced decorative gradients with animation */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 group-hover:rotate-45 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700" />
      
      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
        animation: 'shimmer 3s infinite'
      }} />
    </Card>
  );
};

export default SummaryCard;