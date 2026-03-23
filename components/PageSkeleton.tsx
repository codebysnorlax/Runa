import React from 'react';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';

const PageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-9 w-3/4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="h-48 p-0"><Skeleton className="w-full h-full" /></Card>
      <Card className="h-48 p-0"><Skeleton className="w-full h-full" /></Card>
    </div>
    <Card className="h-64 p-0"><Skeleton className="w-full h-full" /></Card>
  </div>
);

export default PageSkeleton;
