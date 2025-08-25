require("@nomicfoundation/hardhat-toolbox");
//require("dotenv").config();
require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-verify");
require("./tasks");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("@nomicfoundation/hardhat-ethers");

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;

const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  mocha: {
    timeout: 300000, // 5 minutes max for running tests
  },
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  namedAccounts: {
    firstAccount: {
      default: 0, // here, 0 refers to the first account in the accounts array
    },
    secondAccount: {
      default: 1, // here, 1 refers to the second account in the accounts array
    },
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
};
