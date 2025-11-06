import React from 'react';
import { Navigation } from '@/components/Navigation';
import FarmerDashboard from '@/components/FarmerDashboard';
import DistributorDashboard from '@/components/DistributorDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useProductIndexer } from '@/hooks/useProductIndexer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { profile, loading } = useAuth();
  useProductIndexer();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Card>
            <CardContent className="flex items-center p-6">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading dashboard...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {profile?.role === 'farmer' && <FarmerDashboard />}
        {profile?.role === 'distributor' && <DistributorDashboard />}
        {profile?.role === 'retailer' && <DistributorDashboard />}
        {profile?.role === 'consumer' && <DistributorDashboard />}
        {!profile?.role && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Please complete your profile setup to access the dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;