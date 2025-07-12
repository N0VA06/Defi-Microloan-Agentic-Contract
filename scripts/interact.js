// const hre = require("hardhat");
// const { parseEther, formatEther } = hre.ethers; // Use hre.ethers for consistency

// async function main() {
//     const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Updated to latest deploy address

//     const lender = new hre.ethers.Wallet(
//         "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
//         hre.ethers.provider
//     );

//     const [_, borrower] = await hre.ethers.getSigners();

//     // Use factory to get ABI-correct instance
//     const LoanFactory = await hre.ethers.getContractFactory("LoanContract", lender);
//     const loanContract = LoanFactory.attach(contractAddress);
//     console.log("✅ Connected to contract at:", await loanContract.getAddress());

//     // Borrower requests loan
//     const borrowerConnected = loanContract.connect(borrower);
//     const tx1 = await borrowerConnected.requestLoan(parseEther("1"));
//     await tx1.wait();
//     console.log(`Loan requested by: ${borrower.address}`);

//     // Lender funds the loan
//     const tx2 = await loanContract.fundLoan(borrower.address, {
//         value: parseEther("1"),
//     });
//     await tx2.wait();
//     console.log(`Loan funded to: ${borrower.address}`);

//     // ✅ Get loan amount
//     const loan = await loanContract.getLoanAmount(borrower.address);
//     console.log(`Loan recorded: ${formatEther(loan)} ETH`);
// }

// main().catch((error) => {
//     console.error("❌ Script failed with error:", error);
//     process.exitCode = 1;
// });
const hre = require("hardhat");

async function main() {
  const [owner, borrower1, borrower2, lender1, lender2] = await hre.ethers.getSigners();
  
  // Deploy the contract
  const MicroloanBank = await hre.ethers.getContractFactory("MicroloanBank");
  const microloanBank = await MicroloanBank.deploy();
  await microloanBank.waitForDeployment();
  
  const contractAddress = await microloanBank.getAddress();
  console.log("MicroloanBank deployed to:", contractAddress);
  console.log("Owner address:", owner.address);
  console.log("\n--- Starting Interactions ---\n");

  // Helper function to display loan status
  const getLoanStatusString = (status) => {
    const statuses = ["Requested", "Approved", "Funded", "Repaid", "Defaulted"];
    return statuses[status];
  };

  // Helper function to display loan details
  const displayLoanDetails = async (loanId) => {
    const details = await microloanBank.getLoanDetails(loanId);
    console.log(`\nLoan #${loanId} Details:`);
    console.log(`  Borrower: ${details[0]}`);
    console.log(`  Lender: ${details[1] === hre.ethers.ZeroAddress ? "None" : details[1]}`);
    console.log(`  Amount: ${hre.ethers.formatEther(details[2])} ETH`);
    console.log(`  Due Date: ${details[3] > 0 ? new Date(Number(details[3]) * 1000).toLocaleString() : "Not set"}`);
    console.log(`  Status: ${getLoanStatusString(details[4])}`);
  };

  try {
    // 1. Borrower1 requests a loan
    console.log("\n1. Borrower1 requesting a loan of 1 ETH...");
    const loanAmount = hre.ethers.parseEther("1");
    const tx1 = await microloanBank.connect(borrower1).requestLoan(loanAmount);
    const receipt1 = await tx1.wait();
    console.log("Loan requested successfully!");
    
    // Check borrower reputation
    const rep1 = await microloanBank.borrowerReputation(borrower1.address);
    console.log(`Borrower1 reputation: ${rep1}`);
    
    await displayLoanDetails(1);

    // 2. Lender1 funds the loan
    console.log("\n2. Lender1 funding the loan...");
    const tx2 = await microloanBank.connect(lender1).fundLoan(1, { value: loanAmount });
    await tx2.wait();
    console.log("Loan funded successfully!");
    
    await displayLoanDetails(1);

    // 3. Borrower1 repays the loan
    console.log("\n3. Borrower1 repaying the loan...");
    const tx3 = await microloanBank.connect(borrower1).repayLoan(1, { value: loanAmount });
    await tx3.wait();
    console.log("Loan repaid successfully!");
    
    // Check updated reputation
    const rep2 = await microloanBank.borrowerReputation(borrower1.address);
    console.log(`Borrower1 new reputation: ${rep2}`);
    
    await displayLoanDetails(1);

    // 4. Borrower2 requests a loan
    console.log("\n4. Borrower2 requesting a loan of 2 ETH...");
    const loanAmount2 = hre.ethers.parseEther("2");
    const tx4 = await microloanBank.connect(borrower2).requestLoan(loanAmount2);
    await tx4.wait();
    console.log("Loan requested successfully!");
    
    await displayLoanDetails(2);

    // 5. Show all loans for borrowers
    console.log("\n5. Checking loan history...");
    const borrower1Loans = await microloanBank.getBorrowerLoans(borrower1.address);
    console.log(`Borrower1 loans: ${borrower1Loans}`);
    
    const lender1Loans = await microloanBank.getLenderLoans(lender1.address);
    console.log(`Lender1 loans: ${lender1Loans}`);

  } catch (error) {
    console.error("Error during interaction:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });