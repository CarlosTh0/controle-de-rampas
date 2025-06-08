
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  textColor?: string;
}

const StatsCard = ({ title, value, icon, textColor = "text-slate-800" }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
