const { task } = require("hardhat/config");

task("deploy-fundme", "deploy and verify fundme contract").setAction(
  async (taskArgs, hre) => {
    //create factory
    const fundMeFactory = await ethers.getContractFactory("Fundme");
    //deploy contract
    console.log("Deploying FundMe contract...");
    const fundMe = await fundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log(
      "contract has been deployed successfully, contract address: " +
        fundMe.target
    );

    if (
      hre.network.config.chainId == 11155111 &&
      process.env.ETHERSCAN_API_KEY
    ) {
      console.log(
        "waiting for 5 blocks to verify the contract on Etherscan..."
      );
      const response = fundMe.deploymentTransaction();
      await response.wait(5);

      await verifyFundMe(fundMe.target, [300]);
    } else {
      console.log(
        "Skipping contract verification on Etherscan, either not on Sepolia or API key not set."
      );
    }
  }
);

async function verifyFundMe(fundMeAddr, constructorArgs) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: constructorArgs,
  });
}

module.exports = {};
