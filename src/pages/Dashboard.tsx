import React from 'react';
import { Navigation } from '@/components/Navigation';
import BlockchainDashboard from '@/components/BlockchainDashboard';
import { useProductIndexer } from '@/hooks/useProductIndexer';

const Dashboard = () => {
  useProductIndexer();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BlockchainDashboard />
    </div>
  );
};

export default Dashboard;