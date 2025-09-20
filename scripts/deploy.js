const hre = require("hardhat");

async function main() {
  console.log("Deploying SupplyChain contract...");

  // Get the ContractFactory and Signers here.
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  
  // Deploy the contract
  const supplyChain = await SupplyChain.deploy();
  
  await supplyChain.waitForDeployment();
  
  const contractAddress = await supplyChain.getAddress();
  
  console.log("SupplyChain deployed to:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  
  // Save the contract address and ABI for frontend use
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'src/contracts/deployed-contract.json',
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("Contract info saved to src/contracts/deployed-contract.json");
  
  // Verify contract on Etherscan (if not on hardhat network)
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await supplyChain.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });