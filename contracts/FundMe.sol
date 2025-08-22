//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Fundme {
    mapping(address => uint256) public fundersToAmount;

    uint256 constant MINIMUM_VALUE = 100 * 10 ** 18;

    AggregatorV3Interface internal dataFeed;

    uint256 constant TARGET = 1000 * 10 ** 18;

    address public owner;

    uint256 deploymentTimestamp;
    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    constructor(uint256 _lockTime) {
        //sepolia testnet
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        fundersToAmount[msg.sender] = msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(
        uint256 ethAmount
    ) internal view returns (uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (ethAmount * ethPrice) / (10 ** 8);
    }

    function getFund() external windowClosed onlyOwner {
        require(
            convertEthToUsd(address(this).balance) >= TARGET,
            "Target is not reached"
        );

        //payable(msg.sender).transfer(address(this).balance);

        //bool success = payable(msg.sender).send(address(this).balance);
        //require(success,"tx failed");
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(success, "tx failed");
        fundersToAmount[msg.sender] = 0;
        getFundSuccess = true;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function refund() external windowClosed {
        require(
            convertEthToUsd(address(this).balance) < TARGET,
            "Target is reached"
        );
        require(fundersToAmount[msg.sender] != 0, "there is no fund from you");

        bool success;
        (success, ) = payable(msg.sender).call{
            value: fundersToAmount[msg.sender]
        }("");
        require(success, "tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(
        address funder,
        uint256 amountToUpdate
    ) external {
        require(
            msg.sender == erc20Addr,
            "you do not have permission to. call this function"
        );
        fundersToAmount[funder] = amountToUpdate;
    }

    modifier windowClosed() {
        require(
            block.timestamp >= deploymentTimestamp + lockTime,
            "funding period is not over"
        );
        _;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only the owner can do this");
        _;
    }
}
