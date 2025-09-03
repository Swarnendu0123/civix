import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  helpText?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, helpText, icon, trend }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && (
              <div className="text-gray-400">
                {icon}
              </div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </div>
                )}
              </dd>
              {helpText && (
                <dd className="text-sm text-gray-500 mt-1">
                  {helpText}
                </dd>
              )}
              {trend && (
                <dd className="text-xs text-gray-400 mt-1">
                  {trend.label}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;