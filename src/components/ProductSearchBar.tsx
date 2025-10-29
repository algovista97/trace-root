import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, ExternalLink, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from '@/hooks/use-toast';

const PRODUCT_STATUSES = ['Harvested', 'At Distributor', 'At Retailer', 'Sold'];

interface Product {
  id: number;
  name: string;
  variety: string;
  quantity: number;
  status: number;
  harvestDate: number;
  farmLocation: string;
  qualityGrade: string;
  farmer: string;
  dataHash: string;
}

const ProductSearchBar = () => {
  const { getProduct, contract, chainId } = useWeb3();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'id' | 'name'>('id');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !contract) {
      toast({
        title: "Search Error",
        description: "Please enter a search term and ensure blockchain is connected",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      if (searchType === 'id') {
        // Search by Product ID
        const productId = parseInt(searchQuery);
        if (isNaN(productId)) {
          toast({
            title: "Invalid ID",
            description: "Please enter a valid product ID number",
            variant: "destructive"
          });
          return;
        }

        const product = await getProduct(productId);
        if (product.exists) {
          setSearchResults([product]);
        } else {
          setSearchResults([]);
          toast({
            title: "Product Not Found",
            description: `No product found with ID: ${productId}`,
            variant: "destructive"
          });
        }
      } else {
        // Search by Name - we'll need to iterate through products
        // For demo purposes, we'll search through first 100 product IDs
        const results: Product[] = [];
        const maxSearch = 100;
        
        for (let i = 1; i <= maxSearch; i++) {
          try {
            const product = await getProduct(i);
            if (product.exists && product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
              results.push(product);
            }
          } catch (error) {
            // Product doesn't exist, continue
            continue;
          }
        }
        
        setSearchResults(results);
        if (results.length === 0) {
          toast({
            title: "No Products Found",
            description: `No products found containing: "${searchQuery}"`,
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search products on blockchain",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getNetworkExplorerUrl = (address: string) => {
    if (chainId === '0xaa36a7') return `https://sepolia.etherscan.io/address/${address}`;
    if (chainId === '0x13881') return `https://mumbai.polygonscan.com/address/${address}`;
    if (chainId === '0x539' || chainId === '0x1337') return null; // Local network
    return null;
  };

  const verifyOnChain = async (product: Product) => {
    try {
      const onChainProduct = await getProduct(product.id);
      const isValid = onChainProduct.dataHash === product.dataHash;
      
      toast({
        title: isValid ? "Verification Successful" : "Verification Failed",
        description: isValid 
          ? "Product data matches blockchain records" 
          : "Product data does not match blockchain records",
        variant: isValid ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify product on blockchain",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Products on Blockchain
          </CardTitle>
          <CardDescription>
            Search for products by ID or name directly from the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={searchType === 'id' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('id')}
              >
                Search by ID
              </Button>
              <Button
                type="button"
                variant={searchType === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('name')}
              >
                Search by Name
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchType === 'id' 
                    ? "Enter product ID (e.g., 1, 2, 3...)" 
                    : "Enter product name (e.g., Tomatoes, Apples...)"
                }
                disabled={isSearching}
              />
              <Button type="submit" disabled={isSearching || !contract}>
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
          {searchResults.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {product.name} {product.variety && `(${product.variety})`}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">ID: #{product.id}</Badge>
                    <Badge variant={product.status === 0 ? 'default' : 'secondary'} className="bg-growth/10 text-growth border-growth/20">
                      {PRODUCT_STATUSES[product.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{product.quantity.toString()} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quality Grade</p>
                    <p className="font-medium">Grade {product.qualityGrade}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harvest Date</p>
                    <p className="font-medium">
                      {new Date(Number(product.harvestDate) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{product.farmLocation}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Farmer Address:</span>
                    <span className="font-mono ml-2">
                      {product.farmer.slice(0, 6)}...{product.farmer.slice(-4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data Hash:</span>
                    <span className="font-mono ml-2 break-all">{product.dataHash}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => verifyOnChain(product)}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Verify on Chain
                  </Button>
                  
                  {getNetworkExplorerUrl(product.farmer) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getNetworkExplorerUrl(product.farmer), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Farmer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!contract && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Blockchain Not Connected</h3>
            <p className="text-muted-foreground">
              Connect to MetaMask and ensure you're on the correct network to search products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSearchBar;