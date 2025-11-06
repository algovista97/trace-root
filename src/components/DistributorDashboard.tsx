import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, TrendingUp, MapPin } from 'lucide-react';
import BlockchainProductSearch from './BlockchainProductSearch';

const DistributorDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    {
      title: "In Transit",
      value: "0",
      icon: <Truck className="w-4 h-4" />,
      description: "Products being distributed"
    },
    {
      title: "Deliveries",
      value: "0",
      icon: <MapPin className="w-4 h-4" />,
      description: "Completed this month"
    },
    {
      title: "Total Handled",
      value: "0",
      icon: <Package className="w-4 h-4" />,
      description: "Products distributed"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-harvest/10 to-sky/10 border-harvest/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-harvest" />
            <div>
              <CardTitle>Distributor Dashboard</CardTitle>
              <CardDescription>
                Welcome back, {profile?.full_name || 'Distributor'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search Products</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <BlockchainProductSearch />
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Inventory</CardTitle>
              <CardDescription>Products currently in your distribution network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products in inventory.</p>
                <p className="text-sm mt-2">Connect your wallet to view and manage products!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>Track product transfers and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transfer history available.</p>
                <p className="text-sm mt-2">Product transfers will appear here once you start distributing.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DistributorDashboard;
