'use client';

import { memo } from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export default memo(function StatsCard({ label, value, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <div className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</div>
      <p className="text-gray-600 mt-2">{label}</p>
    </div>
  );
});
