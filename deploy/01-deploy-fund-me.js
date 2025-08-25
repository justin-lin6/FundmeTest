// module.exports = async(hre) => {
//     const getNamedAcoounts = hre.getNamedAccounts
//     const deployments = hre.deployments
//     console.log("Hello from deploy script")
// }

const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
  LOCK_TIME,
  CONFIRMATIONS,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;

  let dataFeedAddr;
  let confirmations;

  if (developmentChains.includes(network.name)) {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    dataFeedAddr = mockV3Aggregator.address;
    confirmations = 0;
  } else {
    dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
    confirmations = CONFIRMATIONS;
  }
  const fundMe = await deploy("Fundme", {
    from: firstAccount,
    args: [LOCK_TIME, dataFeedAddr], // constructor arguments
    log: true,
    waitConfirmations: confirmations,
  });
  // remove deployments directory or add --reset to the deploy command to redeploy

  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: [LOCK_TIME, dataFeedAddr],
    });
  } else {
    console.log(
      "Skipping contract verification on Etherscan, either not on Sepolia or API key not set."
    );
  }
};

module.exports.tags = ["all", "fundme"];
