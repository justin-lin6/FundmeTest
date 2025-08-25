const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function () {
      let fundMe;
      let firstAccount;

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        const fundMeDeployment = await deployments.get("Fundme");
        //await fundMeDeployment.waitForDeployment();
        fundMe = await ethers.getContractAt("Fundme", fundMeDeployment.address);
      });

      // test fund and getFund successfully
      it("fund and getFund successfully", async function () {
        //make sure target reached
        await fundMe.fund({ value: ethers.parseEther("0.5") });
        //make sure
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000)); // wait for 181 seconds
        //make sure we can get receipt
        const getFundTx = await fundMe.getFund();
        const getFundTxReceipt = await getFundTx.wait();

        expect(getFundTxReceipt)
          .to.be.emit(fundMe, "FundWithdrawByOwner")
          .withArgs(ethers.parseEther("0.5"));
      });

      // test fund and  refund successfully
      it("fund and refund successfully", async function () {
        //make sure target not reached
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        //make sure
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000)); // wait for 181 seconds
        //make sure we can get receipt
        const refundTx = await fundMe.getFund();
        const refundTxReceipt = await refundTx.wait();

        expect(refundTxReceipt)
          .to.be.emit(fundMe, "RefundByFunder")
          .withArgs(firstAccount, ethers.parseEther("0.1"));
      });
    });
