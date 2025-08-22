const { task } = require("hardhat/config");

task("interact-fundme", "interact with FundMe contract")
  .addParam("addr", "fundme contract address")
  .setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("Fundme");
    const fundMe = await fundMeFactory.attach(taskArgs.addr);
    //init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();
    //fund the contract with the first account
    const fundTx = await fundMe.fund({ value: ethers.utils.parseEther("0.5") });
    await fundTx.wait();

    //check the balance of the contract
    const contractBalance = await ethers.provider.getBalance(fundMe.target);
    console.log(
      "Contract balance after funding: " + contractBalance.toString()
    );

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
  });
