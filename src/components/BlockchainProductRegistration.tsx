import React, { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Package, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import crypto from 'crypto-js';

type RegistrationStatus = 'idle' | 'submitting' | 'confirming' | 'indexing' | 'completed' | 'failed';

const BlockchainProductRegistration = () => {
  const { account, stakeholder, registerProduct, isConnected } = useWeb3();
  const [status, setStatus] = useState<RegistrationStatus>('idle');
  const [productResult, setProductResult] = useState<{
    productId: number;
    blockNumber: number;
    transactionHash: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    variety: '',
    quantity: '',
    farmLocation: '',
    harvestDate: '',
    qualityGrade: 'A',
    additionalNotes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateProductHash = (data: any) => {
    const hashData = {
      name: data.productName,
      variety: data.variety,
      farmer: account,
      harvestDate: data.harvestDate,
      location: data.farmLocation
    };
    return crypto.SHA256(JSON.stringify(hashData)).toString();
  };

  const generateQRCode = (productId: number) => {
    return `AgriChain-${productId}-${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !stakeholder?.isRegistered) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet and register as a stakeholder first.",
        variant: "destructive"
      });
      return;
    }

    if (stakeholder.role !== 0) { // 0 = Farmer
      toast({
        title: "Access Denied",
        description: "Only farmers can register products.",
        variant: "destructive"
      });
      return;
    }

    setStatus('submitting');
    setProductResult(null);

    try {
      // Generate product hash
      const dataHash = generateProductHash(formData);
      
      // Step 1: Register product on blockchain and wait for confirmation
      setStatus('confirming');
      const blockchainResult = await registerProduct({
        name: formData.productName,
        variety: formData.variety,
        quantity: parseInt(formData.quantity),
        farmLocation: formData.farmLocation,
        harvestDate: formData.harvestDate,
        qualityGrade: formData.qualityGrade,
        dataHash
      });

      setProductResult(blockchainResult);

      // Step 2: Index the product in Supabase database after blockchain confirmation
      setStatus('indexing');
      const qrCodeData = generateQRCode(blockchainResult.productId);

      const { error: supabaseError } = await supabase
        .from('products')
        .insert({
          batch_id: `BC-${blockchainResult.productId}`,
          product_name: formData.productName,
          variety: formData.variety,
          quantity: parseInt(formData.quantity),
          unit: 'kg',
          farmer_id: account,
          farm_location: formData.farmLocation,
          harvest_date: formData.harvestDate,
          quality_grade: formData.qualityGrade,
          status: 'harvested',
          qr_code: qrCodeData,
          blockchain_hash: blockchainResult.transactionHash
        });

      if (supabaseError) {
        console.warn('Supabase indexing failed:', supabaseError);
        toast({
          title: "Indexing Warning",
          description: "Product registered on blockchain but indexing failed. You can still verify on-chain.",
          variant: "destructive",
        });
      }

      // Step 3: Mark as completed
      setStatus('completed');

      // Reset form
      setFormData({
        productName: '',
        variety: '',
        quantity: '',
        farmLocation: '',
        harvestDate: '',
        qualityGrade: 'A',
        additionalNotes: ''
      });

      toast({
        title: "Success!",
        description: `Product registered and indexed with ID: ${blockchainResult.productId}`,
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      setStatus('failed');
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register product on blockchain",
        variant: "destructive"
      });
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'submitting':
        return { icon: Loader2, text: 'Submitting to blockchain...', color: 'text-blue-500' };
      case 'confirming':
        return { icon: Clock, text: 'Waiting for confirmation...', color: 'text-yellow-500' };
      case 'indexing':
        return { icon: Loader2, text: 'Indexing product...', color: 'text-blue-500' };
      case 'completed':
        return { icon: CheckCircle, text: 'Product registered successfully!', color: 'text-green-500' };
      case 'failed':
        return { icon: AlertCircle, text: 'Registration failed', color: 'text-red-500' };
      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Register Product
          </CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to register products on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please connect your wallet to continue.</p>
        </CardContent>
      </Card>
    );
  }

  if (!stakeholder?.isRegistered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Register Product
          </CardTitle>
          <CardDescription>
            Register as a stakeholder to start registering products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please complete your stakeholder registration first.</p>
        </CardContent>
      </Card>
    );
  }

  if (stakeholder.role !== 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Register Product
          </CardTitle>
          <CardDescription>
            Only farmers can register new products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your role does not permit product registration.</p>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Register Product on Blockchain
        </CardTitle>
        <CardDescription>
          Register your agricultural produce on the immutable blockchain ledger
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status Display */}
        {statusInfo && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <statusInfo.icon className={`w-4 h-4 ${statusInfo.color} ${status === 'submitting' || status === 'indexing' ? 'animate-spin' : ''}`} />
              <span className={statusInfo.color}>{statusInfo.text}</span>
            </div>
            
            {productResult && (
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="font-medium">Product ID:</span> {productResult.productId}
                </div>
                <div>
                  <span className="font-medium">Block Number:</span> {productResult.blockNumber}
                </div>
                <div>
                  <span className="font-medium">Transaction Hash:</span>
                  <span className="font-mono text-xs break-all ml-1">{productResult.transactionHash}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="e.g., Organic Tomatoes"
                required
                disabled={status !== 'idle' && status !== 'failed'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={formData.variety}
                onChange={(e) => handleInputChange('variety', e.target.value)}
                placeholder="e.g., Cherry Tomatoes"
                disabled={status !== 'idle' && status !== 'failed'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (kg) *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="100"
                required
                disabled={status !== 'idle' && status !== 'failed'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityGrade">Quality Grade</Label>
              <Select 
                value={formData.qualityGrade} 
                onValueChange={(value) => handleInputChange('qualityGrade', value)}
                disabled={status !== 'idle' && status !== 'failed'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Grade A - Premium</SelectItem>
                  <SelectItem value="B">Grade B - Good</SelectItem>
                  <SelectItem value="C">Grade C - Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmLocation">Farm Location *</Label>
              <Input
                id="farmLocation"
                value={formData.farmLocation}
                onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                placeholder="e.g., California, USA"
                required
                disabled={status !== 'idle' && status !== 'failed'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest Date *</Label>
              <Input
                id="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                required
                disabled={status !== 'idle' && status !== 'failed'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Input
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any additional information about the product"
              disabled={status !== 'idle' && status !== 'failed'}
            />
          </div>

          <Button
            type="submit"
            disabled={status !== 'idle' && status !== 'failed'}
            className="w-full"
          >
            {(status === 'submitting' || status === 'confirming' || status === 'indexing') && 
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            }
            {status === 'idle' || status === 'failed'
              ? 'Register Product on Blockchain'
              : status === 'submitting'
              ? 'Submitting Transaction...'
              : status === 'confirming'
              ? 'Confirming on Blockchain...'
              : status === 'indexing'
              ? 'Indexing Product...'
              : 'Product Registered!'
            }
          </Button>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p><strong>Registration Process:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Submit transaction to blockchain (requires MetaMask approval)</li>
              <li>Wait for blockchain confirmation</li>  
              <li>Index product data for fast search</li>
              <li>Product becomes available for verification and transfers</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlockchainProductRegistration;