import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBlockchain } from '@/components/BlockchainSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { 
  QrCode, 
  Camera, 
  Search, 
  MapPin,
  Calendar,
  Thermometer,
  Truck,
  CheckCircle,
  Shield,
  Leaf,
  AlertTriangle
} from 'lucide-react';

export const QRScanner = () => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [productId, setProductId] = useState('');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getTransactionsByProduct } = useBlockchain();

  const searchProduct = async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    try {
      // Search by batch ID or QR code
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .or(`batch_id.eq.${searchTerm},qr_code.eq.${searchTerm}`)
        .single();

      if (productError || !productData) {
        setError('Product not found. Please check the ID and try again.');
        setScannedProduct(null);
        setTransactions([]);
        return;
      }

      // Fetch all transactions for this product
      const { data: transactionData, error: transactionError } = await supabase
        .from('supply_chain_transactions')
        .select(`
          *,
          from_profile:from_stakeholder_id(full_name, role, organization),
          to_profile:to_stakeholder_id(full_name, role, organization)
        `)
        .eq('product_id', productData.id)
        .order('timestamp', { ascending: true });

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
        setError('Error loading product history.');
        return;
      }

      // Get blockchain transactions
      const blockchainTransactions = getTransactionsByProduct(productData.batch_id);

      setScannedProduct(productData);
      setTransactions(transactionData || []);
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching for the product.');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    // In a real implementation, this would activate the camera and scan QR codes
    // For demo purposes, we'll use a mock QR code
    await searchProduct('AGRI-' + Date.now().toString(36));
  };

  const handleManualSearch = async () => {
    if (productId.trim()) {
      await searchProduct(productId.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'harvested': return 'bg-green-500';
      case 'in_transit': return 'bg-yellow-500';
      case 'at_distributor': return 'bg-blue-500';
      case 'at_retailer': return 'bg-purple-500';
      case 'sold': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'harvest': return Leaf;
      case 'transport': return Truck;
      case 'transfer': return CheckCircle;
      case 'quality_check': return Shield;
      default: return CheckCircle;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Product Verification</h1>
          <p className="text-muted-foreground">
            Scan QR code or enter product ID to view complete supply chain history
          </p>
        </div>

        {/* Scanner Interface */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-forest" />
                <span>Product Scanner</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant={scanMode === 'camera' ? 'default' : 'outline'}
                  onClick={() => setScanMode('camera')}
                  size="sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <Button 
                  variant={scanMode === 'manual' ? 'default' : 'outline'}
                  onClick={() => setScanMode('manual')}
                  size="sm"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Manual
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scanMode === 'camera' ? (
              <div className="text-center space-y-4">
                <div className="w-64 h-64 mx-auto bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-forest/30">
                  <div className="text-center space-y-2">
                    <Camera className="h-12 w-12 text-forest mx-auto" />
                    <p className="text-muted-foreground">Camera viewfinder</p>
                    <p className="text-sm text-muted-foreground">Position QR code in center</p>
                  </div>
                </div>
                <Button 
                  onClick={handleScan} 
                  className="bg-forest hover:bg-forest/90"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Scanning...' : 'Start Scanning'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter Product ID or Batch ID"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <Button 
                    onClick={handleManualSearch} 
                    className="bg-forest hover:bg-forest/90"
                    disabled={loading || !productId.trim()}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Information */}
        {scannedProduct && (
          <div className="space-y-6">
            {/* Product Overview */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-foreground">{scannedProduct.product_name}</CardTitle>
                    <CardDescription className="text-lg">
                      Batch ID: {scannedProduct.batch_id}
                    </CardDescription>
                    <CardDescription>
                      QR Code: {scannedProduct.qr_code}
                    </CardDescription>
                  </div>
                  <Badge className="bg-growth text-white">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified Authentic
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <Leaf className="h-5 w-5 text-forest" />
                    <div>
                      <p className="font-medium">Farm Location</p>
                      <p className="text-sm text-muted-foreground">{scannedProduct.farm_location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-harvest" />
                    <div>
                      <p className="font-medium">Harvest Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(scannedProduct.harvest_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blockchain" />
                    <div>
                      <p className="font-medium">Quality Grade</p>
                      <p className="text-sm text-muted-foreground">{scannedProduct.quality_grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(scannedProduct.status)}`}></div>
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {scannedProduct.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Product Details */}
                <div className="mt-6 grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="font-medium">Quantity</p>
                    <p className="text-sm text-muted-foreground">
                      {scannedProduct.quantity} {scannedProduct.unit}
                    </p>
                  </div>
                  {scannedProduct.variety && (
                    <div>
                      <p className="font-medium">Variety</p>
                      <p className="text-sm text-muted-foreground">{scannedProduct.variety}</p>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {scannedProduct.certifications && scannedProduct.certifications.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {scannedProduct.certifications.map((cert: string, index: number) => (
                        <Badge key={index} variant="outline">{cert}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supply Chain Journey */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Supply Chain Journey</CardTitle>
                <CardDescription>Complete transparent history from farm to shelf</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => {
                      const IconComponent = getTransactionIcon(transaction.transaction_type);
                      return (
                        <div key={transaction.id} className="relative">
                          <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 rounded-full bg-growth text-white flex items-center justify-center">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0 pb-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground capitalize">
                                  {transaction.transaction_type.replace('_', ' ')}
                                </h4>
                                <Badge variant={transaction.verified ? 'default' : 'secondary'}>
                                  {transaction.verified ? 'Verified' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="grid md:grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{transaction.location}</span>
                                </div>
                                {transaction.temperature && (
                                  <div className="flex items-center space-x-1">
                                    <Thermometer className="h-3 w-3" />
                                    <span>{transaction.temperature}°C</span>
                                  </div>
                                )}
                                {transaction.to_profile && (
                                  <div>
                                    <span>{transaction.to_profile.full_name} ({transaction.to_profile.role})</span>
                                  </div>
                                )}
                              </div>
                              {transaction.quality_notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {transaction.quality_notes}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(transaction.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {index < transactions.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-0 w-px bg-border"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground p-8">
                    No transaction history available for this product.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Information */}
            {scannedProduct.blockchain_hash && (
              <Card className="border-0 shadow-soft border-blockchain/20 bg-blockchain/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blockchain">
                    <Shield className="h-5 w-5" />
                    <span>Blockchain Verification</span>
                  </CardTitle>
                  <CardDescription>Immutable record stored on distributed ledger</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Transaction Hash</p>
                      <p className="text-muted-foreground font-mono break-all">
                        {scannedProduct.blockchain_hash}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Product ID</p>
                      <p className="text-muted-foreground">{scannedProduct.batch_id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Network</p>
                      <p className="text-muted-foreground">AgriChain Network</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Status</p>
                      <p className="text-muted-foreground">Verified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};