import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Leaf } from 'lucide-react';
import BlockchainProductRegistration from './BlockchainProductRegistration';
import BlockchainProductSearch from './BlockchainProductSearch';

const FarmerDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    {
      title: "Total Products",
      value: "0",
      icon: <Package className="w-4 h-4" />,
      description: "Products registered on blockchain"
    },
    {
      title: "Active Harvests",
      value: "0",
      icon: <Leaf className="w-4 h-4" />,
      description: "Currently tracked products"
    },
    {
      title: "Transactions",
      value: "0",
      icon: <TrendingUp className="w-4 h-4" />,
      description: "Total supply chain events"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-forest/10 to-growth/10 border-forest/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-forest" />
            <div>
              <CardTitle>Farmer Dashboard</CardTitle>
              <CardDescription>
                Welcome back, {profile?.full_name || 'Farmer'}
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
      <Tabs defaultValue="register" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register">Register Product</TabsTrigger>
          <TabsTrigger value="search">Search Products</TabsTrigger>
          <TabsTrigger value="products">My Products</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <BlockchainProductRegistration />
        </TabsContent>

        <TabsContent value="search">
          <BlockchainProductSearch />
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>My Registered Products</CardTitle>
              <CardDescription>View all products you've registered on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products registered yet.</p>
                <p className="text-sm mt-2">Connect your wallet and register your first product!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmerDashboard;
