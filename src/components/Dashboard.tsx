import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ProductRegistration from '@/components/ProductRegistration';
import BlockchainProductRegistration from '@/components/BlockchainProductRegistration';
import BlockchainProductSearch from '@/components/BlockchainProductSearch';
import { useProductIndexer } from '@/hooks/useProductIndexer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Shield, 
  Clock,
  MapPin,
  Thermometer,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Initialize product indexer
  useProductIndexer();

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user's products if farmer
      if (profile?.role === 'farmer') {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('farmer_id', user?.id)
          .order('created_at', { ascending: false });
        
        setProducts(productsData || []);
      } else {
        // Fetch all products for other roles
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        setProducts(productsData || []);
      }

      // Fetch recent transactions
      const { data: transactionsData } = await supabase
        .from('supply_chain_transactions')
        .select(`
          *,
          products:product_id (batch_id, product_name)
        `)
        .order('timestamp', { ascending: false })
        .limit(10);
      
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getStats = () => {
    switch (profile?.role) {
      case 'farmer':
        return [
          { title: 'Products Registered', value: products.length.toString(), change: '+12%', icon: Package },
          { title: 'Active Batches', value: products.filter(p => p.status !== 'sold').length.toString(), change: '+5%', icon: Clock },
          { title: 'Quality Score', value: '9.8/10', change: '+0.2', icon: Shield },
          { title: 'This Month', value: products.filter(p => new Date(p.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length.toString(), change: '+18%', icon: TrendingUp }
        ];
      case 'distributor':
        return [
          { title: 'Shipments Tracked', value: transactions.filter(t => t.transaction_type === 'transport').length.toString(), change: '+8%', icon: Package },
          { title: 'In Transit', value: products.filter(p => p.status === 'in_transit').length.toString(), change: '-2%', icon: Clock },
          { title: 'Deliveries', value: transactions.filter(t => t.transaction_type === 'transfer').length.toString(), change: '+1.2%', icon: CheckCircle },
          { title: 'Temperature Alerts', value: '2', change: '-50%', icon: Thermometer }
        ];
      default:
        return [
          { title: 'Products Viewed', value: products.length.toString(), change: '+15%', icon: Package },
          { title: 'Quality Verified', value: products.filter(p => p.quality_grade).length.toString(), change: '+14%', icon: Shield },
          { title: 'Recent Scans', value: '47', change: '+23%', icon: BarChart3 },
          { title: 'Trust Score', value: '4.9/5', change: '+0.1', icon: TrendingUp }
        ];
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Supply Chain Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {profile?.full_name}
              </p>
            </div>
            
            {profile?.role && (
              <Badge variant="outline" className="capitalize text-lg px-4 py-2">
                {profile.role}
              </Badge>
            )}
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {profile?.role === 'farmer' && <TabsTrigger value="register">Register Product</TabsTrigger>}
              <TabsTrigger value="search">Search Products</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getStats().map((stat, index) => (
                  <Card key={index} className="border-0 shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                          <p className="text-sm text-growth mt-1">{stat.change}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                          <stat.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activities */}
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest updates in the supply chain</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                          <div className="w-2 h-2 rounded-full mt-2 bg-growth"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {transaction.transaction_type === 'harvest' && 'Product registered'}
                              {transaction.transaction_type === 'transfer' && 'Product transferred'}
                              {transaction.transaction_type === 'transport' && 'Product in transit'}
                              {transaction.transaction_type === 'quality_check' && 'Quality inspection completed'}
                              {!['harvest', 'transfer', 'transport', 'quality_check'].includes(transaction.transaction_type) && 'Supply chain update'}
                              {transaction.products && ` - ${transaction.products.product_name}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(transaction.timestamp).toLocaleDateString()} at {transaction.location}
                            </p>
                          </div>
                          <Badge variant="default">
                            {transaction.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground p-8">No recent activities</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {profile?.role === 'farmer' && (
              <TabsContent value="register">
                <BlockchainProductRegistration />
              </TabsContent>
            )}

            <TabsContent value="search">
              <BlockchainProductSearch />
            </TabsContent>

            <TabsContent value="products">
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    {profile?.role === 'farmer' ? 'Your registered products' : 'All products in the supply chain'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : products.length > 0 ? (
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div key={product.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{product.product_name}</h3>
                            <Badge variant={product.status === 'sold' ? 'secondary' : 'default'}>
                              {product.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Batch ID: {product.batch_id}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {product.quantity} {product.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Harvest Date: {new Date(product.harvest_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground p-8">No products found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Recent supply chain transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium capitalize">{transaction.transaction_type.replace('_', ' ')}</h3>
                            <Badge variant={transaction.verified ? 'default' : 'secondary'}>
                              {transaction.verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </div>
                          {transaction.products && (
                            <p className="text-sm text-muted-foreground">
                              Product: {transaction.products.product_name} ({transaction.products.batch_id})
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">Location: {transaction.location}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(transaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground p-8">No transactions found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};