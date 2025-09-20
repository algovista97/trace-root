import React from 'react';
import { Navigation } from '@/components/Navigation';
import BlockchainQRScanner from '@/components/BlockchainQRScanner';

const Scanner = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BlockchainQRScanner />
    </div>
  );
};

export default Scanner;