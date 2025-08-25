const DECIMALS = 8;
const INITIAL_ANSWER = 300000000000; // 3000 * 10**8
const developmentChains = ["hardhat", "localhost"];

const CONFIRMATIONS = 5; // Number of confirmations to wait for before verifying on Etherscan
const LOCK_TIME = 180; // 3 minutes

const networkConfig = {
  11155111: {
    ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

module.exports = {
  DECIMALS,
  INITIAL_ANSWER,
  developmentChains,
  networkConfig,
  LOCK_TIME,
  CONFIRMATIONS,
};
