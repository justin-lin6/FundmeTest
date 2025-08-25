const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function () {
      let fundMe;
      let fundMeSecondAccount;
      let firstAccount;
      let secondAccount;
      let mockV3Aggregator;

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        secondAccount = (await getNamedAccounts()).secondAccount;
        const fundMeDeployment = await deployments.get("Fundme");
        mockV3Aggregator = await deployments.get("MockV3Aggregator");
        //await fundMeDeployment.waitForDeployment();
        fundMe = await ethers.getContractAt("Fundme", fundMeDeployment.address);
        fundMeSecondAccount = await ethers.getContract("Fundme", secondAccount);
      });

      it("test if the owner is msg.sender", async function () {
        await fundMe.waitForDeployment();
        const owner = await fundMe.owner();
        console.log("firstAccount address: " + firstAccount);
        console.log("owner address: " + owner);
        assert.equal(owner, firstAccount);
      });

      it("test if the datafeed is assigned correctly", async function () {
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.dataFeed(), mockV3Aggregator.address);
      });

      // unit test for fund function
      it("window closed, value greater than minimum, fund failed", async function () {
        // to let the windows closed
        await helpers.time.increase(200);
        await helpers.mine();

        //value is greater than minimum
        expect(
          await fundMe.fund({ value: ethers.parseEther("0.5") })
        ).to.be.revertedWith("window is closed");
      });

      it("window open, value less than minimum, fund failed", async function () {
        //value is less than minimum
        await expect(
          fundMe.fund({ value: ethers.parseEther("0.001") })
        ).to.be.revertedWith("Send more ETH");
      });

      it("window open, value greater than minimum, fund success", async function () {
        // greater than minimum
        await fundMe.fund({ value: ethers.parseEther("0.2") });
        const balance = await fundMe.fundersToAmount(firstAccount);
        expect(balance).to.equal(ethers.parseEther("0.2"));
      });

      //unit test for getFund
      //onlyOwner, windowClose, target reached
      it("not owner, window closed, target reached, getFund failed", async function () {
        //target reached
        await fundMe.fund({ value: ethers.parseEther("1") });

        //let the windows closed
        await helpers.time.increase(200);
        await helpers.mine();

        await expect(fundMeSecondAccount.getFund()).to.be.revertedWith(
          "only the owner can do this"
        );
      });

      it("window open, target reached，getFund  failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await expect(fundMe.getFund()).to.be.revertedWith(
          "window is not closed"
        );
      });

      it("window closed, target not reached, getFund  failed", async function () {
        //fund
        await fundMe.fund({ value: ethers.parseEther("0.1") });

        //let the windows closed
        await helpers.time.increase(200);
        await helpers.mine();

        await expect(fundMe.getFund()).to.be.revertedWith(
          "Target is not reached"
        );
      });

      it("window closed, target reached, getFund success", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });

        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.getFund())
          .to.emit(fundMe, "FundWithdrawByOwner")
          .withArgs(ethers.parseEther("1"));
      });

      // refund
      // windowClosed, target not reached, funder has balance

      it("window open, target not reached, funder has balabnce", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });

        await expect(fundMe.refund()).to.be.revertedWith(
          "window is not closed"
        );
      });

      it("window closed, target reached, funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });

        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.refund()).to.be.revertedWith("Target is reached");
      });

      it("window closed, target not reached, funder does not has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });

        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMeSecondAccount.refund()).to.be.revertedWith(
          "there is no fund from you"
        );
      });

      it("window closed, target not reacher, funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });

        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.refund())
          .to.emit(fundMe, "RefundByFunder")
          .withArgs(firstAccount, ethers.parseEther("0.1"));
      });
    });
