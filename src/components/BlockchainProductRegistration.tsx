import React, { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Package, Loader2 } from 'lucide-react';
import crypto from 'crypto-js';

const BlockchainProductRegistration = () => {
  const { account, stakeholder, registerProduct, isConnected } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);

    try {
      // Generate product hash
      const dataHash = generateProductHash(formData);
      
      // Register product on blockchain
      const productId = await registerProduct({
        name: formData.productName,
        variety: formData.variety,
        quantity: parseInt(formData.quantity),
        farmLocation: formData.farmLocation,
        harvestDate: formData.harvestDate,
        qualityGrade: formData.qualityGrade,
        dataHash
      });

      // Generate QR code
      const qrCodeData = generateQRCode(productId);

      // Store additional data in Supabase for UI purposes
      const { error: supabaseError } = await supabase
        .from('products')
        .insert({
          batch_id: `BC-${productId}`,
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
          blockchain_hash: dataHash
        });

      if (supabaseError) {
        console.warn('Supabase storage failed:', supabaseError);
        // Don't throw error as blockchain registration was successful
      }

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
        description: `Product registered on blockchain with ID: ${productId}`,
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register product on blockchain",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={formData.variety}
                onChange={(e) => handleInputChange('variety', e.target.value)}
                placeholder="e.g., Cherry Tomatoes"
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityGrade">Quality Grade</Label>
              <Select value={formData.qualityGrade} onValueChange={(value) => handleInputChange('qualityGrade', value)}>
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
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Registering on Blockchain...' : 'Register Product on Blockchain'}
          </Button>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p><strong>Note:</strong> This action will:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Record your product permanently on the blockchain</li>
              <li>Generate a unique product ID and QR code</li>
              <li>Create an immutable ownership record</li>
              <li>Require MetaMask transaction approval</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlockchainProductRegistration;