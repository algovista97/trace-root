# AgriChain - Blockchain DApp Setup Guide

Welcome to AgriChain, a complete blockchain-based supply chain transparency platform for agricultural produce. This guide will help you deploy the smart contract to a testnet and start using the DApp.

## 🚀 Quick Start

### Prerequisites

1. **Install MetaMask**: [Download MetaMask](https://metamask.io) browser extension
2. **Node.js**: Version 16 or higher
3. **Git**: For cloning the repository

### Step 1: Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd agrichain-dapp
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# For contract deployment (optional - only needed for deployment)
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://rpc.sepolia.org
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

**⚠️ Security Note**: Never commit your private key to version control. The `.env.local` file is gitignored for security.

### Step 3: Get Testnet ETH/MATIC (Free)

#### For Sepolia Testnet (Ethereum):
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your MetaMask wallet address
3. Request test ETH (free)

#### For Mumbai Testnet (Polygon):
1. Visit [Mumbai Faucet](https://faucet.polygon.technology/)
2. Select "Mumbai" network and "MATIC Token"
3. Enter your wallet address and request test MATIC

### Step 4: Deploy Smart Contract

#### Option A: Deploy to Sepolia (Ethereum Testnet)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### Option B: Deploy to Mumbai (Polygon Testnet)  
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

**Important**: After deployment, copy the contract address from the console output.

### Step 5: Update Contract Address

1. Open `src/hooks/useWeb3.tsx`
2. Find the `CONTRACT_ADDRESSES` object
3. Replace the placeholder address with your deployed contract address:

```typescript
const CONTRACT_ADDRESSES = {
  sepolia: '0xYourDeployedContractAddress', // Replace this
  mumbai: '0xYourDeployedContractAddress'  // Replace this
};
```

### Step 6: Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Using the DApp

### 1. Connect MetaMask Wallet

1. Open the application
2. Click "Connect MetaMask"
3. Approve the connection in MetaMask
4. Switch to your preferred testnet (Sepolia or Mumbai)

### 2. Register as a Stakeholder

1. After connecting, choose your role:
   - **Farmer**: Can register products
   - **Distributor**: Can receive products from farmers
   - **Retailer**: Can receive products from distributors  
   - **Consumer**: Can verify product authenticity

2. Fill in your name and organization
3. Click "Register on Blockchain"
4. Confirm the transaction in MetaMask

### 3. Register Products (Farmers Only)

1. Go to "Register Product" tab
2. Fill in product details:
   - Product name (e.g., "Organic Tomatoes")
   - Variety (e.g., "Cherry Tomatoes")
   - Quantity in kg
   - Farm location
   - Harvest date
   - Quality grade (A, B, or C)

3. Click "Register Product on Blockchain"
4. Confirm transaction in MetaMask
5. Note the Product ID from the success message

### 4. Verify Products (All Users)

1. Go to the Scanner page
2. Enter a Product ID (e.g., 1, 2, 3...)
3. Click "Search" to view:
   - Product details
   - Supply chain journey
   - Blockchain verification status

## 🌐 Network Information

### Sepolia Testnet (Ethereum)
- **Chain ID**: 11155111
- **Currency**: ETH (test)
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### Mumbai Testnet (Polygon)
- **Chain ID**: 80001  
- **Currency**: MATIC (test)
- **Block Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology

## 📋 Smart Contract Features

Our `SupplyChain.sol` contract provides:

- **Product Registration**: Farmers can register products with immutable records
- **Ownership Transfer**: Track product movement through supply chain
- **Role-Based Access**: Different permissions for farmers, distributors, retailers
- **Authenticity Verification**: Verify product authenticity using cryptographic hashes
- **Transaction History**: Complete audit trail of all product movements
- **Stakeholder Registry**: On-chain registration of all supply chain participants

## 🔍 Contract Functions

### For Farmers:
- `registerProduct()`: Register new agricultural products
- `transferProduct()`: Transfer products to distributors

### For Distributors:
- `transferProduct()`: Transfer products to retailers

### For Retailers:
- `transferProduct()`: Record product sales

### For Everyone:
- `getProduct()`: View product details
- `getProductTransactions()`: View product history
- `isProductAuthentic()`: Verify product authenticity

## 🛠️ Development Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Verify contract on Etherscan (after deployment)
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 🔒 Security Features

- **Immutable Records**: All product data is permanently stored on blockchain
- **Role-Based Access Control**: Only authorized users can perform specific actions
- **Cryptographic Verification**: Product authenticity verified using hash functions
- **Transparent Audit Trail**: Complete transaction history visible to all
- **MetaMask Integration**: Secure wallet-based authentication

## 🎯 Key Benefits

1. **Transparency**: Complete visibility into product journey
2. **Trust**: Immutable blockchain records prevent fraud
3. **Efficiency**: Automated verification reduces manual processes
4. **Traceability**: Instant product tracking and history
5. **Cost-Effective**: Uses free testnets for demonstration

## 🆘 Troubleshooting

### MetaMask Connection Issues:
- Ensure MetaMask is installed and unlocked
- Check you're on the correct network (Sepolia or Mumbai)
- Refresh the page if connection fails

### Transaction Failures:
- Ensure you have sufficient test ETH/MATIC for gas fees
- Check if you're using the correct role for the action
- Verify the contract is deployed on the current network

### Contract Interaction Issues:
- Confirm the contract address is correctly set in `useWeb3.tsx`
- Ensure you're connected to the same network where contract is deployed
- Check browser console for detailed error messages

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your MetaMask setup and network configuration
3. Ensure you have sufficient test tokens for transactions
4. Confirm contract deployment was successful

## 🎉 Congratulations!

You now have a fully functional blockchain-based supply chain transparency platform running on a free testnet. The system provides real blockchain immutability while being completely free to use for testing and demonstration purposes.

---

**Note**: This is a testnet deployment for demonstration purposes. For production use, additional security audits and mainnet deployment would be required.