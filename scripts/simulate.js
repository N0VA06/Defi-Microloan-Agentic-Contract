const hre = require("hardhat");

async function main() {
  console.log("Starting Microloan Bank Simulation...\n");
  
  const signers = await hre.ethers.getSigners();
  const [owner, ...users] = signers;
  
  // Deploy contract
  const MicroloanBank = await hre.ethers.getContractFactory("MicroloanBank");
  const bank = await MicroloanBank.deploy();
  await bank.waitForDeployment();
  
  console.log(`Contract deployed at: ${await bank.getAddress()}`);
  console.log(`Owner: ${owner.address}\n`);

  // Simulation scenarios
  const scenarios = [
    {
      name: "Successful Loan Cycle",
      borrower: users[0],
      lender: users[1],
      amount: "0.5",
      repay: true
    },
    {
      name: "Multiple Loans Same Borrower",
      borrower: users[0],
      lender: users[2],
      amount: "0.3",
      repay: true
    },
    {
      name: "Low Reputation Borrower",
      borrower: users[3],
      lender: users[4],
      amount: "1.0",
      repay: false,
      manualApprove: true
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);
    
    // Request loan
    const amount = hre.ethers.parseEther(scenario.amount);
    console.log(`${scenario.borrower.address.slice(0, 6)}... requests ${scenario.amount} ETH`);
    
    const requestTx = await bank.connect(scenario.borrower).requestLoan(amount);
    const requestReceipt = await requestTx.wait();
    
    // Get loan ID from events
    const loanId = requestReceipt.logs[0].args[0];
    console.log(`Loan #${loanId} created`);
    
    // Check if manual approval needed
    if (scenario.manualApprove) {
      console.log("Manual approval required...");
      await bank.connect(owner).approveLoan(loanId);
      console.log("Loan approved by owner");
    }
    
    // Fund loan
    console.log(`${scenario.lender.address.slice(0, 6)}... funds the loan`);
    await bank.connect(scenario.lender).fundLoan(loanId, { value: amount });
    
    // Check reputation
    const repBefore = await bank.borrowerReputation(scenario.borrower.address);
    console.log(`Borrower reputation: ${repBefore}`);
    
    // Repay or default
    if (scenario.repay) {
      console.log("Borrower repays the loan...");
      await bank.connect(scenario.borrower).repayLoan(loanId, { value: amount });
      const repAfter = await bank.borrowerReputation(scenario.borrower.address);
      console.log(`Reputation increased to: ${repAfter}`);
    } else {
      console.log("Simulating loan default...");
      // Fast forward time
      await hre.network.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await hre.network.provider.send("evm_mine");
      
      await bank.checkAndDefaultLoans();
      const repAfter = await bank.borrowerReputation(scenario.borrower.address);
      console.log(`Reputation decreased to: ${repAfter}`);
    }
    
    // Display final loan status
    const details = await bank.getLoanDetails(loanId);
    const statusNames = ["Requested", "Approved", "Funded", "Repaid", "Defaulted"];
    console.log(`Final status: ${statusNames[details[4]]}`);
  }

  // Summary statistics
  console.log("\n--- Summary ---");
  console.log(`Total loans created: ${await bank.loanCounter()}`);
  
  for (let i = 0; i < 4; i++) {
    const rep = await bank.borrowerReputation(users[i].address);
    if (rep > 0) {
      console.log(`User ${i}: Reputation = ${rep}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });