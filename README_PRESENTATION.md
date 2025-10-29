# AgriChain - Agricultural Transparency DApp
## Presentation Guide

### 🌾 Project Overview
AgriChain is a blockchain-based agricultural supply chain transparency platform that enables:
- **Immutable Product Registration**: Farmers can register products directly on the blockchain
- **Complete Traceability**: Track products from farm to consumer
- **QR Code Verification**: Instant authenticity verification through QR scanning
- **Multi-Stakeholder Platform**: Farmers, Distributors, Retailers, and Consumers

---

## 🚀 Quick Demo Path

### Step 1: Landing Page (/)
- Beautiful agricultural-themed landing page
- Shows platform features and benefits
- Click **"Start Tracking Now"** to go to dashboard

### Step 2: Connect Wallet (/dashboard)
1. Click **"Connect MetaMask"** button
2. Approve the connection in MetaMask
3. Select the correct network (Localhost/Sepolia/Mumbai)
4. Register as a stakeholder:
   - Choose role: **Farmer**
   - Enter your name
   - Enter organization name
   - Confirm the transaction in MetaMask

### Step 3: Register a Product
1. Go to **"Register Product"** tab
2. Fill in product details:
   - Product Name: e.g., "Organic Tomatoes"
   - Variety: e.g., "Cherry"
   - Quantity: e.g., "100" kg
   - Farm Location: e.g., "California, USA"
   - Harvest Date: Select today's date
   - Quality Grade: Select "A - Premium"
3. Click **"Register Product on Blockchain"**
4. Approve the transaction in MetaMask
5. Wait for confirmation (Status shows: Submitting → Confirming → Indexing → Completed)
6. Note the Product ID returned

### Step 4: Search for Product
1. Go to **"Search Products"** tab
2. Select **"Search by ID"**
3. Enter the Product ID from Step 3
4. Click search icon
5. View complete product details from blockchain
6. Click **"Verify on Chain"** to confirm data integrity

### Step 5: View Dashboard Overview
1. Go to **"Overview"** tab
2. See your wallet info and network status
3. View registered products count
4. See recent blockchain activity

### Step 6: View My Products
1. Go to **"My Products"** tab
2. See all products registered by your farmer account
3. View detailed product information
4. See current status of each product

### Step 7: QR Scanner (/scanner)
1. Navigate to QR Scanner from menu
2. Use the scanner to verify products
3. Works with generated QR codes

---

## 🎯 Key Features to Highlight

### 1. Blockchain Integration
- **Real Gas Transactions**: Every product registration requires MetaMask approval
- **Smart Contract**: Solidity contract stores all product data on-chain
- **Immutable Records**: Cannot be altered once recorded
- **Event Emission**: ProductRegistered events for indexing

### 2. Search Functionality
- **By Product ID**: Direct blockchain query
- **By Product Name**: Searches through blockchain records
- **Verification**: Can verify data hash against blockchain
- **Network Explorer Links**: View transactions on Etherscan/Polygonscan

### 3. User Experience
- **Status Tracking**: Real-time feedback during registration
  - Submitting → Confirming → Indexing → Completed
- **Error Handling**: Clear error messages
- **Responsive Design**: Works on desktop and mobile
- **Role-Based Access**: Only farmers can register products

### 4. Agricultural Theme
- **Custom Color Scheme**: Forest green, harvest gold, earth tones
- **Semantic Design Tokens**: All colors use HSL tokens
- **Consistent Branding**: AgriChain logo and badge
- **Professional UI**: Modern card-based layout

---

## 🔧 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Shadcn/ui** for components
- **React Router** for navigation

### Blockchain
- **Ethers.js 6** for Web3 integration
- **MetaMask** for wallet connection
- **Hardhat** for smart contract development
- **Solidity 0.8.19** for smart contracts

### Backend
- **Supabase** for off-chain indexing
- **PostgreSQL** database
- **Real-time subscriptions**

### Smart Contract Features
- Product registration with full metadata
- Stakeholder registration (Farmer, Distributor, Retailer, Consumer)
- Product transfer between stakeholders
- Status tracking (Harvested, At Distributor, At Retailer, Sold)
- Data hash verification for authenticity
- Query products by farmer address
- Transaction history for each product

---

## 🌐 Supported Networks

### Local Development
- **Hardhat Local Node** (chainId: 1337)
- Connect to: http://127.0.0.1:8545
- Deploy contract with: `npm run deploy:local`

### Testnets
- **Sepolia** (chainId: 11155111)
- **Mumbai Polygon** (chainId: 80001)

### Network Switching
Use the Network Switcher in the dashboard to change networks

---

## 📊 Demo Data Suggestions

### Sample Products
1. **Organic Tomatoes**
   - Variety: Cherry
   - Quantity: 100 kg
   - Location: California, USA
   - Grade: A

2. **Fresh Apples**
   - Variety: Gala
   - Quantity: 250 kg
   - Location: Washington, USA
   - Grade: A

3. **Organic Lettuce**
   - Variety: Romaine
   - Quantity: 50 kg
   - Location: Arizona, USA
   - Grade: B

---

## 🎤 Presentation Talking Points

### Problem Statement
- Lack of transparency in agricultural supply chains
- Food fraud and counterfeiting
- Difficulty in tracing product origins
- Consumer trust issues

### Our Solution
- Blockchain-based immutable records
- Complete farm-to-fork traceability
- QR code verification
- Multi-stakeholder collaboration

### Benefits
- **For Farmers**: Fair pricing, direct market access, verified authenticity
- **For Distributors**: Efficient tracking, reduced fraud
- **For Retailers**: Verified suppliers, quality assurance
- **For Consumers**: Product authenticity, origin verification, safety

### Unique Value Propositions
1. **Decentralized Trust**: No single point of control
2. **Immutable Records**: Cannot be altered or deleted
3. **Real-time Verification**: Instant QR code scanning
4. **Full Transparency**: Complete supply chain visibility
5. **Smart Contracts**: Automated, trustless transactions

---

## ⚠️ Known Limitations (For Prototype)

1. **Search by Name**: Currently loops through 100 products (can be optimized with events/subgraph)
2. **Gas Costs**: Real blockchain transactions require test ETH
3. **Network Required**: Must be connected to correct network
4. **MetaMask Required**: Desktop only (mobile needs WalletConnect)
5. **Indexing Dependency**: Search works best after indexing completes

---

## 🔮 Future Enhancements

1. **The Graph Integration**: Efficient blockchain querying
2. **IPFS Storage**: Decentralized file storage for product images
3. **IoT Integration**: Automated product tracking with sensors
4. **Mobile App**: Native iOS/Android apps with WalletConnect
5. **Advanced Analytics**: Supply chain insights and reporting
6. **Multi-Chain Support**: Deploy on Ethereum, Polygon, Arbitrum
7. **NFT Certificates**: Unique digital certificates for products
8. **Marketplace**: Direct farmer-to-consumer marketplace

---

## 🛠️ Deployment Instructions

### Local Testnet
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contract
npm run deploy:local

# Terminal 3: Start frontend
npm run dev
```

### Testnet Deployment
```bash
# Set up .env file with private key
# Get test ETH from faucet
# Deploy to Sepolia
npm run deploy:sepolia

# Update contract address in useWeb3.tsx
```

---

## 📸 Screenshot Checklist

For your presentation, capture:
- [ ] Landing page hero section
- [ ] MetaMask connection flow
- [ ] Stakeholder registration
- [ ] Product registration form
- [ ] Transaction confirmation status
- [ ] Product search results
- [ ] Product details with verification
- [ ] Dashboard overview with stats
- [ ] My Products list
- [ ] Transaction history
- [ ] QR Scanner interface

---

## 🎬 Presentation Flow (5-10 minutes)

1. **Introduction (1 min)**: Problem statement and solution overview
2. **Landing Page (30 sec)**: Show features and UI
3. **Live Demo (5-7 min)**:
   - Connect wallet
   - Register as farmer
   - Register a product (show transaction)
   - Search and verify product
   - Show dashboard analytics
4. **Technical Overview (1 min)**: Stack and architecture
5. **Benefits (1 min)**: Value propositions for all stakeholders
6. **Future Plans (30 sec)**: Roadmap and enhancements
7. **Q&A**: Address questions

---

## ✅ Pre-Presentation Checklist

- [ ] Test MetaMask connection works
- [ ] Have test ETH in wallet
- [ ] Contract deployed and address updated
- [ ] Test product registration end-to-end
- [ ] Test search functionality
- [ ] Check all navigation links work
- [ ] Prepare backup screenshots in case of live demo issues
- [ ] Have product data ready to input
- [ ] Test on presentation screen/projector
- [ ] Close unnecessary browser tabs
- [ ] Clear browser console

---

## 🆘 Troubleshooting

### MetaMask Not Connecting
- Ensure MetaMask is installed
- Check you're on correct network
- Try disconnecting and reconnecting

### Transaction Failing
- Check you have sufficient test ETH
- Verify contract is deployed
- Check correct network is selected

### Product Not Appearing
- Wait for transaction confirmation
- Check block explorer for transaction
- Refresh the page
- Try searching by ID directly

### Search Not Working
- Ensure blockchain is connected
- Verify contract address is correct
- Check product ID exists
- Try searching by ID first, then name

---

## 📞 Support Resources

- GitHub: [Your Repository]
- Documentation: `/docs` folder
- Smart Contract: `contracts/SupplyChain.sol`
- Frontend: `src/` directory
- Testing Guide: `TESTING_GUIDE.md`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`

---

**Good luck with your presentation! 🌾✨**
