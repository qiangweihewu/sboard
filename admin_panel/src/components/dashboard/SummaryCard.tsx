// src/components/dashboard/SummaryCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  // CardDescription, // Optional
  // CardFooter, // Optional
} from "@/components/ui/card"; // Shadcn UI Card components

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string; // Optional description or subtext
  // icon?: React.ReactNode; // Optional icon
  isLoading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  description,
  // icon,
  isLoading = false
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {/* {icon && <div className="text-muted-foreground">{icon}</div>} */}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="text-2xl font-bold animate-pulse bg-muted h-8 w-1/2 rounded-md"></div>
            {description && <p className="text-xs text-muted-foreground animate-pulse bg-muted h-4 w-3/4 mt-1 rounded-md"></p>}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
      {/* Optional CardFooter can be added here if needed */}
    </Card>
  );
};

export default SummaryCard;
