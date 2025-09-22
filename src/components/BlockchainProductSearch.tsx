import React, { useState } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Link, Database, Shield, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type SearchSource = 'blockchain' | 'index' | 'both';

const BlockchainProductSearch = () => {
  const { getProduct, getProductsByFarmer, isProductAuthentic, account, isConnected } = useWeb3();
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<SearchSource>('blockchain');
  const [searchResults, setSearchResults] = useState<{
    blockchain?: any;
    index?: any;
    verified: boolean;
    source: SearchSource;
  } | null>(null);

  const searchBlockchain = async (id: number): Promise<any> => {
    try {
      const product = await getProduct(id);
      return product;
    } catch (error) {
      console.error('Blockchain search failed:', error);
      return null;
    }
  };

  const searchIndex = async (searchTerm: string): Promise<any> => {
    try {
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .or(`batch_id.eq.BC-${searchTerm},batch_id.eq.${searchTerm},qr_code.eq.${searchTerm}`)
        .single();

      if (error || !productData) {
        return null;
      }

      return productData;
    } catch (error) {
      console.error('Index search failed:', error);
      return null;
    }
  };

  const verifyProductOnChain = async (product: any, id: number): Promise<boolean> => {
    if (!product?.blockchain_hash) return false;
    
    try {
      return await isProductAuthentic(id, product.blockchain_hash);
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  };

  const handleSearch = async () => {
    if (!productId.trim()) return;

    setLoading(true);
    setSearchResults(null);

    try {
      const numericId = parseInt(productId.replace(/^BC-/, ''));
      let blockchainResult = null;
      let indexResult = null;
      let verified = false;

      // Always try blockchain first as the source of truth
      if (searchSource === 'blockchain' || searchSource === 'both') {
        blockchainResult = await searchBlockchain(numericId);
      }

      // Then try index for faster results or as fallback
      if (searchSource === 'index' || searchSource === 'both' || !blockchainResult) {
        indexResult = await searchIndex(productId);
        
        // If we have index result, verify it on-chain
        if (indexResult) {
          verified = await verifyProductOnChain(indexResult, numericId);
        }
      }

      // Determine the actual source used
      let actualSource: SearchSource = 'blockchain';
      if (blockchainResult && indexResult) {
        actualSource = 'both';
      } else if (indexResult && !blockchainResult) {
        actualSource = 'index';
      }

      if (!blockchainResult && !indexResult) {
        toast({
          title: "Product Not Found",
          description: "No product found with the given ID on blockchain or in index.",
          variant: "destructive"
        });
        return;
      }

      setSearchResults({
        blockchain: blockchainResult,
        index: indexResult,
        verified,
        source: actualSource
      });

      // Show appropriate message based on results
      if (blockchainResult) {
        toast({
          title: "Product Found",
          description: "Product verified on blockchain",
        });
      } else if (indexResult && verified) {
        toast({
          title: "Product Found",
          description: "Product found in index and verified on-chain",
        });
      } else if (indexResult && !verified) {
        toast({
          title: "Product Found (Unverified)",
          description: "Product found in index but could not verify on-chain",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "An error occurred during search",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const retryWithBackoff = async () => {
    setLoading(true);
    
    // Implement exponential backoff
    const delays = [1000, 2000, 4000]; // 1s, 2s, 4s
    
    for (let i = 0; i < delays.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delays[i]));
      
      try {
        await handleSearch();
        break;
      } catch (error) {
        console.error(`Retry ${i + 1} failed:`, error);
        if (i === delays.length - 1) {
          toast({
            title: "Search Failed",
            description: "Product not found after multiple retries. Try again later.",
            variant: "destructive"
          });
        }
      }
    }
    
    setLoading(false);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Search</CardTitle>
          <CardDescription>Connect your wallet to search for products</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please connect your wallet to continue.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Blockchain Product Search
          </CardTitle>
          <CardDescription>
            Search for products on blockchain (source of truth) or in fast index
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Source Selection */}
          <div className="flex gap-2">
            <Button
              variant={searchSource === 'blockchain' ? 'default' : 'outline'}
              onClick={() => setSearchSource('blockchain')}
              size="sm"
            >
              <Link className="w-4 h-4 mr-2" />
              Blockchain Only
            </Button>
            <Button
              variant={searchSource === 'index' ? 'default' : 'outline'}
              onClick={() => setSearchSource('index')}
              size="sm"
            >
              <Database className="w-4 h-4 mr-2" />
              Index Only
            </Button>
            <Button
              variant={searchSource === 'both' ? 'default' : 'outline'}
              onClick={() => setSearchSource('both')}
              size="sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              Both + Verify
            </Button>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter Product ID (e.g., 123 or BC-123)"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading || !productId.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Retry Button */}
          {searchResults === null && productId && (
            <Button
              variant="outline"
              onClick={retryWithBackoff}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry with Backoff
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Results</CardTitle>
              <div className="flex gap-2">
                <Badge variant={searchResults.source === 'blockchain' ? 'default' : 'outline'}>
                  <Link className="w-3 h-3 mr-1" />
                  Blockchain
                </Badge>
                {searchResults.index && (
                  <Badge variant={searchResults.verified ? 'default' : 'destructive'}>
                    <Database className="w-3 h-3 mr-1" />
                    {searchResults.verified ? 'Verified Index' : 'Unverified Index'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Blockchain Data */}
            {searchResults.blockchain && (
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Blockchain Data (Source of Truth)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">ID:</span> {searchResults.blockchain.id?.toString()}</div>
                  <div><span className="font-medium">Name:</span> {searchResults.blockchain.name}</div>
                  <div><span className="font-medium">Farmer:</span> {searchResults.blockchain.farmer}</div>
                  <div><span className="font-medium">Status:</span> {searchResults.blockchain.status?.toString()}</div>
                  <div><span className="font-medium">Exists:</span> {searchResults.blockchain.exists ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}

            {/* Index Data */}
            {searchResults.index && (
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Index Data {searchResults.verified ? '(Verified)' : '(Unverified)'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Batch ID:</span> {searchResults.index.batch_id}</div>
                  <div><span className="font-medium">Name:</span> {searchResults.index.product_name}</div>
                  <div><span className="font-medium">Quantity:</span> {searchResults.index.quantity} {searchResults.index.unit}</div>
                  <div><span className="font-medium">Status:</span> {searchResults.index.status}</div>
                  <div><span className="font-medium">Location:</span> {searchResults.index.farm_location}</div>
                  <div><span className="font-medium">Grade:</span> {searchResults.index.quality_grade}</div>
                </div>
              </div>
            )}

            {/* Verify Button */}
            {searchResults.index && !searchResults.verified && (
              <Button
                variant="outline"
                onClick={() => {
                  const numericId = parseInt(productId.replace(/^BC-/, ''));
                  verifyProductOnChain(searchResults.index, numericId).then(verified => {
                    setSearchResults(prev => prev ? { ...prev, verified } : null);
                    toast({
                      title: verified ? "Verification Successful" : "Verification Failed",
                      description: verified 
                        ? "Product hash verified on blockchain" 
                        : "Product hash does not match blockchain record",
                      variant: verified ? "default" : "destructive"
                    });
                  });
                }}
                className="w-full"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verify On-Chain
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlockchainProductSearch;