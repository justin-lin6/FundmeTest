//const { ethers } = require("hardhat");

async function main() {
  //create factory
  const fundMeFactory = await ethers.getContractFactory("Fundme");
  //deploy contract
  console.log("Deploying FundMe contract...");
  const fundMe = await fundMeFactory.deploy(300);
  await fundMe.waitForDeployment();
  //console.log(`FundMe deployed to: ${fundMe.address}`)
  console.log(
    "contract has been deployed successfully, contract address: " +
      fundMe.target
  );

  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("waiting for 5 blocks to verify the contract on Etherscan...");
    const response = fundMe.deploymentTransaction();
    await response.wait(5);

    await verifyFundMe(fundMe.target, [300]);
  } else {
    console.log(
      "Skipping contract verification on Etherscan, either not on Sepolia or API key not set."
    );
  }
  //init 2 accounts
  const [firstAccount, secondAccount] = await ethers.getSigners();
  //fund the contract with the first account
  const fundTx = await fundMe.fund({ value: ethers.utils.parseEther("0.5") });
  await fundTx.wait();

  //check the balance of the contract
  const contractBalance = await ethers.provider.getBalance(fundMe.target);
  console.log("Contract balance after funding: " + contractBalance.toString());

  //fund the contract with the second account
  const fundTx2 = await fundMe
    .connect(secondAccount)
    .fund({ value: ethers.utils.parseEther("0.5") });
  await fundTx2.wait();

  //check the balance of the contract again
  const contractBalance2 = await ethers.provider.getBalance(fundMe.target);
  console.log(
    "Contract balance after second funding: " + contractBalance2.toString()
  );

  //check mapping of funders
  const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(
    firstAccount.address
  );
  const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(
    secondAccount.address
  );

  console.log(
    `Balance of first account ${firstAccount.address} is: ${firstAccountBalanceInFundMe}`
  );
  console.log(
    `Balance of second account ${secondAccountAccount.address} is: ${secondAccountAccountBalanceInFundMe}`
  );
}

async function verifyFundMe(fundMeAddr, constructorArgs) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: constructorArgs,
  });
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
