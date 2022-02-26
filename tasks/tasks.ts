/* eslint-disable prettier/prettier */
import hre from "hardhat";
const ethers = hre.ethers;

const contractAddress = "0x6e4Fd6a8730Fc0ffF9Bc12FC07B1B1E6eFA39751";

task("Transfer", "Send tokens")
  .addParam("Address", "The address you would like to send funds to")
  .addParam("Amount", "How much do you want to send")
  .setAction(async (taskArgs) => {

    const token = await ethers.getContractAt("OwnERC20", contractAddress);
    await token.transfer(taskArgs.Address, taskArgs.Amount);
});

task("TransferFrom", "Send tokens from another address")
  .addParam("AddressFrom", "Address from which you want to send tokens")
  .addParam("AddressTo", "The address you would like to send funds to")
  .addParam("Amount", "How much do you want to send")
  .setAction(async (taskArgs) => {

    const token = await ethers.getContractAt("OwnERC20", contractAddress);
    await token.transferFrom(taskArgs.AddressFrom, taskArgs.AddressTo, taskArgs.Amount);
});

task("approve", "Allowing another user to withdraw tokens from your balance")
  .addParam("Address ", "The address to which you want to give access to tokens on your account")
  .addParam("Amount", "The number of tokens you want to give access to")
  .setAction(async (taskArgs) => {

    const token = await ethers.getContractAt("OwnERC20", contractAddress);
    await token.approve(taskArgs.Address, taskArgs.Amount);
});