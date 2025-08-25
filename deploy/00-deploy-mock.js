const {
  DECIMALS,
  INITIAL_ANSWER,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  if (developmentChains.includes(network.name)) {
    const { firstAccount } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy("MockV3Aggregator", {
      from: firstAccount,
      args: [DECIMALS, INITIAL_ANSWER], // constructor arguments
      log: true,
    });
  } else {
    console.log(
      "You are on a live network, no need to deploy mocks. Proceeding..."
    );
  }
};

module.exports.tags = ["all", "mock"];
