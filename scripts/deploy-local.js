const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying SupplyChain contract to local network...");

  // Get the contract factory
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");

  // Deploy the contract
  console.log("📦 Deploying contract...");
  const supplyChain = await SupplyChain.deploy();

  // Wait for deployment to finish
  await supplyChain.waitForDeployment();

  const contractAddress = await supplyChain.getAddress();
  
  console.log("✅ SupplyChain contract deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  console.log("⛽ Gas used: Check transaction receipt");

  // Save deployment info to JSON file
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address,
    chainId: hre.network.config.chainId
  };
  
  const deploymentPath = path.join(__dirname, "../src/contracts/deployed-contract.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n✅ Contract address saved to src/contracts/deployed-contract.json");
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🔧 Next steps:");
  console.log("1. Make sure Hardhat node is running (npm run node)");
  console.log("2. Connect MetaMask to localhost:8545");
  console.log("3. The frontend will automatically use the new contract address");

  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log(`\n🎉 Deployment complete! Contract address: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });