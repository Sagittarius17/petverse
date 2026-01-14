import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from 'lucide-react';
import { Skeleton } from "./ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string;
  valueLabel?: string;
  additionalValue?: string;
  additionalLabel?: string;
  icon: LucideIcon;
  description: string;
  isLoading?: boolean;
}

export default function StatsCard({ title, value, valueLabel, additionalValue, additionalLabel, icon: Icon, description, isLoading }: StatsCardProps) {
  const hasAdditionalValue = additionalValue !== undefined && additionalLabel !== undefined;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (
          <>
            {hasAdditionalValue ? (
              <div className="flex items-end gap-4">
                <div className="text-center">
                   <div className="text-2xl font-bold">{value}</div>
                   <p className="text-xs font-medium text-muted-foreground">{valueLabel}</p>
                </div>
                <div className="text-2xl text-muted-foreground pb-1">|</div>
                <div className="text-center">
                   <div className="text-2xl font-bold">{additionalValue}</div>
                   <p className="text-xs font-medium text-muted-foreground">{additionalLabel}</p>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold">{value}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
