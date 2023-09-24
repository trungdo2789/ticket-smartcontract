require("@nomicfoundation/hardhat-toolbox");
const dotEnvConfig = require("dotenv");
dotEnvConfig.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: `${process.env.ALCHEMY_SEPOLIA_URL}`,
      accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY}`],
    },
    bscTest: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY}`],
    }
  },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: "USD",
  // },
  // etherscan: {
  //   apiKey: process.env.POLYGONSCAN_API_KEY,
  // },
};
