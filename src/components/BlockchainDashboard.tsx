import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, TrendingUp, Users, Activity, ExternalLink, Wallet } from 'lucide-react';
import BlockchainProductRegistration from './BlockchainProductRegistration';
import MetaMaskAuth from './MetaMaskAuth';

const ROLE_NAMES = ['Farmer', 'Distributor', 'Retailer', 'Consumer'];
const PRODUCT_STATUSES = ['Harvested', 'At Distributor', 'At Retailer', 'Sold'];

const BlockchainDashboard = () => {
  const { 
    account, 
    stakeholder, 
    isConnected, 
    chainId,
    getProductsByFarmer,
    getProduct,
    getProductTransactions
  } = useWeb3();

  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!isConnected || !stakeholder?.isRegistered || !account) return;

    setIsLoading(true);
    try {
      // Fetch products based on role
      if (stakeholder.role === 0) { // Farmer
        const productIds = await getProductsByFarmer(account);
        const productPromises = productIds.map(id => getProduct(Number(id)));
        const productData = await Promise.all(productPromises);
        
        const formattedProducts = productData.map(product => ({
          id: Number(product.id),
          name: product.name,
          variety: product.variety,
          quantity: Number(product.quantity),
          status: PRODUCT_STATUSES[product.status],
          harvestDate: new Date(Number(product.harvestDate) * 1000),
          farmLocation: product.farmLocation,
          qualityGrade: product.qualityGrade
        }));

        setProducts(formattedProducts);

        // Fetch recent transactions for farmer's products
        const allTransactions = [];
        for (const productId of productIds) {
          const txs = await getProductTransactions(Number(productId));
          const formattedTxs = txs.map(tx => ({
            id: `${tx.productId}-${tx.timestamp}`,
            productId: Number(tx.productId),
            type: tx.transactionType,
            from: tx.from,
            to: tx.to,
            location: tx.location,
            timestamp: new Date(Number(tx.timestamp) * 1000),
            status: PRODUCT_STATUSES[tx.newStatus]
          }));
          allTransactions.push(...formattedTxs);
        }
        
        // Sort by timestamp and take recent ones
        allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setTransactions(allTransactions.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isConnected, stakeholder, account]);

  if (!isConnected || !stakeholder?.isRegistered) {
    return <MetaMaskAuth />;
  }

  const getStats = () => {
    const baseStats = [
      {
        title: "Wallet Address",
        value: `${account?.slice(0, 6)}...${account?.slice(-4)}`,
        icon: <Wallet className="w-4 h-4" />
      },
      {
        title: "Network",
        value: chainId === '0xaa36a7' ? 'Sepolia' : chainId === '0x13881' ? 'Mumbai' : 'Unknown',
        icon: <Activity className="w-4 h-4" />
      }
    ];

    if (stakeholder.role === 0) { // Farmer
      return [
        ...baseStats,
        {
          title: "Products Registered",
          value: products.length.toString(),
          icon: <Package className="w-4 h-4" />
        },
        {
          title: "Total Transactions",
          value: transactions.length.toString(),
          icon: <TrendingUp className="w-4 h-4" />
        }
      ];
    }

    return baseStats;
  };

  const getNetworkExplorerUrl = () => {
    if (chainId === '0xaa36a7') return 'https://sepolia.etherscan.io';
    if (chainId === '0x13881') return 'https://mumbai.polygonscan.com';
    return null;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blockchain Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Role: <Badge>{ROLE_NAMES[stakeholder.role]}</Badge>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Connected Account</p>
            <p className="font-mono text-sm">{account}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="register">Register Product</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Blockchain Activity</CardTitle>
                <CardDescription>Latest transactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Product #{transaction.productId} - {transaction.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.location} • {transaction.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{transaction.status}</Badge>
                      </div>
                    ))}
                    
                    {getNetworkExplorerUrl() && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${getNetworkExplorerUrl()}/address/${account}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Block Explorer
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <BlockchainProductRegistration />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {products.length > 0 ? (
              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {product.name} {product.variety && `(${product.variety})`}
                        </CardTitle>
                        <Badge className={`${product.status.toLowerCase().includes('harvested') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {product.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Blockchain ID</p>
                          <p className="font-medium">#{product.id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{product.quantity} kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quality Grade</p>
                          <p className="font-medium">Grade {product.qualityGrade}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Harvest Date</p>
                          <p className="font-medium">{product.harvestDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <p className="text-sm text-muted-foreground">
                        <strong>Location:</strong> {product.farmLocation}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                  <p className="text-muted-foreground">
                    {stakeholder.role === 0 
                      ? "Start by registering your first product on the blockchain"
                      : "No products available for your role"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {transactions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All blockchain transactions for your products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">Product #{transaction.productId}</Badge>
                            <span className="font-medium capitalize">{transaction.type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.location} • {transaction.timestamp.toLocaleString()}
                          </p>
                          {transaction.from !== '0x0000000000000000000000000000000000000000' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              From: {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                            </p>
                          )}
                        </div>
                        <Badge>{transaction.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Transactions</h3>
                  <p className="text-muted-foreground">
                    Blockchain transactions will appear here once you start using the platform
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlockchainDashboard;