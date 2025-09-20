import React, { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { QrCode, Search, Camera, Package, MapPin, Calendar, User, Shield, Clock, ExternalLink } from 'lucide-react';

const PRODUCT_STATUSES = ['Harvested', 'At Distributor', 'At Retailer', 'Sold'];
const ROLE_NAMES = ['Farmer', 'Distributor', 'Retailer', 'Consumer'];

const BlockchainQRScanner = () => {
  const { getProduct, getProductTransactions, isProductAuthentic, chainId } = useWeb3();
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const searchProduct = async (searchTerm: string) => {
    setIsLoading(true);
    setError('');
    setProduct(null);
    setTransactions([]);

    try {
      const productIdNum = parseInt(searchTerm);
      if (isNaN(productIdNum) || productIdNum <= 0) {
        throw new Error('Please enter a valid product ID (positive number)');
      }

      // Get product data from blockchain
      const productData = await getProduct(productIdNum);
      
      if (!productData.exists) {
        throw new Error('Product not found on blockchain');
      }

      // Get transaction history
      const transactionHistory = await getProductTransactions(productIdNum);

      // Format product data
      const formattedProduct = {
        id: Number(productData.id),
        name: productData.name,
        variety: productData.variety,
        quantity: Number(productData.quantity),
        farmLocation: productData.farmLocation,
        harvestDate: new Date(Number(productData.harvestDate) * 1000),
        qualityGrade: productData.qualityGrade,
        status: PRODUCT_STATUSES[productData.status],
        farmer: productData.farmer,
        dataHash: productData.dataHash
      };

      // Format transaction history
      const formattedTransactions = transactionHistory.map((tx: any) => ({
        id: `${tx.productId}-${tx.timestamp}`,
        type: tx.transactionType,
        from: tx.from,
        to: tx.to,
        status: PRODUCT_STATUSES[tx.newStatus],
        location: tx.location,
        timestamp: new Date(Number(tx.timestamp) * 1000),
        additionalData: tx.additionalData
      }));

      setProduct(formattedProduct);
      setTransactions(formattedTransactions);

      toast({
        title: "Product Found",
        description: `Successfully loaded ${formattedProduct.name} from blockchain`,
      });

    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to fetch product data');
      toast({
        title: "Search Failed",
        description: error.message || "Product not found on blockchain",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = () => {
    // Simulate QR code scan for demo
    const simulatedProductId = '1';
    setProductId(simulatedProductId);
    searchProduct(simulatedProductId);
  };

  const handleManualSearch = () => {
    if (!productId.trim()) {
      toast({
        title: "Missing Product ID",
        description: "Please enter a product ID to search",
        variant: "destructive"
      });
      return;
    }
    searchProduct(productId.trim());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'harvested': return 'bg-green-100 text-green-800';
      case 'at distributor': return 'bg-blue-100 text-blue-800';
      case 'at retailer': return 'bg-purple-100 text-purple-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'harvest': return <Package className="w-4 h-4" />;
      case 'transfer': return <User className="w-4 h-4" />;
      case 'transport': return <MapPin className="w-4 h-4" />;
      case 'sale': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getBlockExplorerUrl = (txHash?: string) => {
    if (!chainId || !txHash) return null;
    
    if (chainId === '0xaa36a7') {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    } else if (chainId === '0x13881') {
      return `https://mumbai.polygonscan.com/tx/${txHash}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Blockchain Product Verification
          </h1>
          <p className="text-muted-foreground">
            Verify product authenticity and trace its journey on the blockchain
          </p>
        </div>

        {/* Scanner Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Product Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                variant={scanMode === 'camera' ? 'default' : 'outline'}
                onClick={() => setScanMode('camera')}
                size="sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
              <Button
                variant={scanMode === 'manual' ? 'default' : 'outline'}
                onClick={() => setScanMode('manual')}
                size="sm"
              >
                <Search className="w-4 h-4 mr-2" />
                Manual
              </Button>
            </div>

            {scanMode === 'camera' && (
              <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Camera scanner not implemented in demo</p>
                <Button onClick={handleScan} disabled={isLoading}>
                  Simulate QR Scan (Product ID: 1)
                </Button>
              </div>
            )}

            {scanMode === 'manual' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Product ID (e.g., 1, 2, 3...)"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <Button onClick={handleManualSearch} disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Information */}
        {product && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.variety && (
                    <p className="text-muted-foreground">{product.variety}</p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
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
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{product.farmLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Harvested: {product.harvestDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">
                      {product.farmer.slice(0, 6)}...{product.farmer.slice(-4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supply Chain Journey */}
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        {index < transactions.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium capitalize">{transaction.type}</h4>
                          <span className="text-xs text-muted-foreground">
                            {transaction.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Location: {transaction.location}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {transactions.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No transaction history available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Verification */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium text-green-800">Verified on Blockchain</p>
                    <p className="text-sm text-green-600">Immutable record confirmed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium text-blue-800">Data Integrity</p>
                    <p className="text-sm text-blue-600">Hash: {product.dataHash.slice(0, 16)}...</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-medium text-purple-800">Transaction Count</p>
                    <p className="text-sm text-purple-600">{transactions.length} recorded events</p>
                  </div>
                </div>

                {chainId && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Network: {chainId === '0xaa36a7' ? 'Sepolia Testnet' : 'Mumbai Testnet'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!product && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Product Selected</h3>
              <p className="text-muted-foreground">
                Enter a product ID or scan a QR code to view blockchain verification data
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlockchainQRScanner;