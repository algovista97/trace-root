import { useEffect, useRef } from 'react';
import { useWeb3 } from './useWeb3';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export const useProductIndexer = () => {
  const { listenForProductRegistered, contract, account, getProduct } = useWeb3();
  const listenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!contract || !account) return;

    // Clean up previous listener
    if (listenerRef.current) {
      listenerRef.current();
    }

    // Set up new listener
    const cleanup = listenForProductRegistered(async (productId, farmer, blockNumber) => {
      console.log('ProductRegistered event received:', { productId, farmer, blockNumber });
      
      try {
        // Check if this product is already indexed
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('batch_id', `BC-${productId}`)
          .single();

        if (existingProduct) {
          console.log('Product already indexed:', productId);
          return;
        }

        // Get full product details from blockchain
        const productDetails = await getProduct(productId);

        if (!productDetails || !productDetails.exists) {
          console.warn('Product not found on blockchain:', productId);
          return;
        }

        // Index the product in Supabase
        const { error } = await supabase
          .from('products')
          .insert({
            batch_id: `BC-${productId}`,
            product_name: productDetails.name,
            variety: productDetails.variety || '',
            quantity: Number(productDetails.quantity),
            unit: 'kg',
            farmer_id: farmer,
            farm_location: productDetails.farmLocation,
            harvest_date: new Date(Number(productDetails.harvestDate) * 1000).toISOString().split('T')[0],
            quality_grade: productDetails.qualityGrade,
            status: 'harvested',
            qr_code: `AgriChain-${productId}-${Date.now()}`,
            blockchain_hash: productDetails.dataHash
          });

        if (error) {
          console.error('Failed to index product:', error);
          toast({
            title: "Indexing Failed",
            description: `Failed to index product ${productId}: ${error.message}`,
            variant: "destructive"
          });
        } else {
          console.log('Product indexed successfully:', productId);
          toast({
            title: "Product Indexed",
            description: `Product ${productId} has been indexed for fast search`,
          });
        }

      } catch (error) {
        console.error('Error processing ProductRegistered event:', error);
        toast({
          title: "Indexer Error",
          description: `Failed to process product registration event: ${error}`,
          variant: "destructive"
        });
      }
    });

    listenerRef.current = cleanup;

    // Cleanup on unmount
    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, [contract, account, listenForProductRegistered, getProduct]);

  return {
    // Return any indexer status or methods if needed
    isListening: !!listenerRef.current
  };
};