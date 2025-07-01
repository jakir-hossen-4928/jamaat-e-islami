import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'pink' | 'yellow';
  link?: string;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-600',
  green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-600',
  purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-600',
  orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-600',
  red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600',
  indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-600',
  pink: 'bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-600',
  yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-600',
};

const valueColorClasses = {
  blue: 'text-blue-700',
  green: 'text-green-700',
  purple: 'text-purple-700',
  orange: 'text-orange-700',
  red: 'text-red-700',
  indigo: 'text-indigo-700',
  pink: 'text-pink-700',
  yellow: 'text-yellow-700',
};

const subtitleColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  indigo: 'text-indigo-600',
  pink: 'text-pink-600',
  yellow: 'text-yellow-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  link,
  onClick,
}) => {
  const cardContent = (
    <Card className={`${colorClasses[color]} transition-colors cursor-pointer`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color].split(' ')[2]}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColorClasses[color]}`}>
          {value}
        </div>
        {subtitle && (
          <p className={`text-xs ${subtitleColorClasses[color]}`}>{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link to={link}>{cardContent}</Link>;
  }

  if (onClick) {
    return (
      <div onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  return cardContent;
}; 