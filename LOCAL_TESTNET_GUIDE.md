# Local Testnet Testing Guide

This guide walks you through testing the blockchain-based supply chain DApp with a local testnet using the single source of truth approach.

## Prerequisites

1. **MetaMask installed** and connected to your local network (http://127.0.0.1:8545)
2. **Hardhat local node running** on port 8545
3. **Smart contract deployed** to your local network

## Setup Instructions

### 1. Start Local Blockchain

```bash
# Start Hardhat local network
npx hardhat node

# Deploy contract (in another terminal)
npx hardhat run scripts/deploy-local.js --network localhost
```

### 2. Configure MetaMask

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Add Custom Network:
   - **Network Name:** Localhost 8545
   - **New RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH

4. Import test accounts from Hardhat (private keys shown in terminal)

### 3. Update Contract Address

After deployment, copy the contract address and update `src/hooks/useWeb3.tsx`:

```typescript
const CONTRACT_ADDRESSES = {
  localhost: '0xYourDeployedContractAddress', // Replace with actual address
  // ... other networks
};
```

## Testing Workflow

### A. Register Product (Blockchain First)

1. **Navigate to Dashboard** → Register Product tab
2. **Connect MetaMask** to localhost network
3. **Register as Stakeholder** (role: Farmer)
4. **Fill out product form** with test data:
   - Product Name: "Test Tomatoes"
   - Variety: "Cherry"
   - Quantity: 100
   - Farm Location: "Test Farm, CA"
   - Harvest Date: Today's date
   - Quality Grade: A

5. **Click "Register Product on Blockchain"**
6. **Approve MetaMask transaction**
7. **Watch the status progression**:
   - ✅ Submitting to blockchain...
   - ✅ Waiting for confirmation...
   - ✅ Indexing product...
   - ✅ Product registered successfully!

8. **Note the Product ID and Transaction Hash** displayed

### B. Confirm Transaction

1. **Check transaction in MetaMask** Activity tab
2. **Verify block number** matches what's displayed
3. **Copy transaction hash** for verification

### C. Wait for Indexer

1. **Product indexer runs automatically** when ProductRegistered event is emitted
2. **Check browser console** for indexer logs:
   ```
   ProductRegistered event received: {productId: 1, farmer: "0x...", blockNumber: 123}
   Product indexed successfully: 1
   ```
3. **Toast notification** should appear: "Product Indexed"

### D. Search Product and Verify On-Chain Hash

1. **Navigate to "Search Products" tab**
2. **Test different search modes**:

   **Blockchain Only:**
   - Select "Blockchain Only"
   - Enter Product ID (e.g., "1")
   - Click Search
   - Should return blockchain data directly

   **Index Only:**
   - Select "Index Only" 
   - Enter Product ID (e.g., "BC-1")
   - Click Search
   - Should return indexed data with verification status

   **Both + Verify:**
   - Select "Both + Verify"
   - Enter Product ID
   - Click Search
   - Should return both sources with verification

3. **Verify the product hash**:
   - Look for "Verified Index" or "Unverified Index" badge
   - Click "Verify On-Chain" button if unverified
   - Should show verification result

### E. QR Scanner Verification

1. **Navigate to Scanner page**
2. **Search manually** using Product ID or Batch ID
3. **Verify blockchain information section** shows:
   - ✅ Verified badge if hash matches
   - ❌ Unverified badge if hash doesn't match
   - Transaction hash and block data
   - "Verify On-Chain" button for re-verification

## Expected Results

### Successful Registration Flow:
1. **MetaMask transaction approved** ✅
2. **ProductRegistered event emitted** ✅  
3. **Product indexed automatically** ✅
4. **Search returns verified results** ✅
5. **Hash verification passes** ✅

### Error Scenarios to Test:

**Network Issues:**
- Disconnect from localhost → Should show demo mode
- Wrong contract address → Should fallback to mock contract

**Search Edge Cases:**
- Search non-existent product → "Product not found"
- Search immediately after registration → Retry with backoff
- Blockchain unavailable → Falls back to index search

**Verification Failures:**
- Modified index data → Hash verification fails
- Contract not deployed → Verification unavailable

## Troubleshooting

### MetaMask Issues:
- **Reset account** if nonce errors occur
- **Switch networks** back and forth to refresh
- **Check account has ETH** from Hardhat accounts

### Contract Issues:
- **Verify contract deployed** with correct ABI
- **Check contract address** in useWeb3.tsx matches deployed address
- **Restart Hardhat node** and redeploy if needed

### Indexer Issues:
- **Check browser console** for event listener errors
- **Verify Supabase connection** and table structure
- **Manual re-index** by searching product again

## Demo Mode Fallback

If blockchain is unavailable, the DApp automatically switches to demo mode:
- Mock transactions with random IDs
- Simulated confirmation delays
- Toast notifications explain demo mode active
- All UI flows work but with mock data

This ensures the DApp remains usable even when blockchain infrastructure is down.

## Production Deployment

For production deployment to Sepolia/Mumbai:
1. Update contract addresses in `useWeb3.tsx`
2. Deploy contracts using deployment scripts
3. Test with testnet ETH/MATIC
4. Monitor indexer performance and error rates
5. Set up proper error handling and retry logic

The same testing workflow applies to testnets, just with longer confirmation times.
