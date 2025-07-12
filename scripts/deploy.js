const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DynamicMicroloanBank contract...");

  // Get the contract factory
  const DynamicMicroloanBank = await ethers.getContractFactory("DynamicMicroloanBank");
  
  // Deploy the contract
  const microloanBank = await DynamicMicroloanBank.deploy();
  
  // Wait for deployment to complete
  await microloanBank.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await microloanBank.getAddress();
  
  console.log("DynamicMicroloanBank deployed to:", contractAddress);
  
  // Optional: Verify some basic contract functions
  console.log("Owner:", await microloanBank.owner());
  console.log("Loan counter:", await microloanBank.loanCounter());
  console.log("Contract deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });