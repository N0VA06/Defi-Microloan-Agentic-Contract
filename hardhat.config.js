// require("@nomicfoundation/hardhat-toolbox");

// module.exports = {
//   solidity: "0.8.20",
//   networks: {
//     localhost: {
//       url: "http://127.0.0.1:8545",
//     },
//   },
// };
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000" // 10,000 ETH per account
      }
    }
  }
};