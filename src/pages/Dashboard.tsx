import React from 'react';
import { Navigation } from '@/components/Navigation';
import BlockchainDashboard from '@/components/BlockchainDashboard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BlockchainDashboard />
    </div>
  );
};

export default Dashboard;