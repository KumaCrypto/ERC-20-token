import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { OwnERC20, OwnERC20__factory } from "../typechain-types";

describe("OwnERC20", function () {
  let token: OwnERC20;
  let signers: SignerWithAddress[];

  beforeEach(async function () {
    signers = await ethers.getSigners();
    token = await new OwnERC20__factory(signers[0]).deploy();
  });

  describe("Checking constants", () => {
    it("name", async () => {
      const tokenName = await token.name();
      expect(tokenName).to.eq("IMISS");
    });
    it("symbol", async () => {
      const tokenSymbol = await token.symbol();
      expect(tokenSymbol).to.eq("MSS");
    });
    it("decimals", async () => {
      const tokenDecimals = await token.decimals();
      expect(tokenDecimals).to.eq(18);
    });
    it("totalSupply", async () => {
      const tokenTotalSupply = await token.totalSupply();
      expect(tokenTotalSupply).to.eq(100000);
    });
  });
  describe("Token balances & amount", () => {
    it("Check owner balance", async () => {
      const tokenTotalSupply = await token.totalSupply();
      const ownerBalance = ethers.BigNumber.from(
        await token.balanceOf(signers[0].address)
      );
      expect(tokenTotalSupply).to.eq(ownerBalance);
    });
    it("transfer decrease a balance", async () => {
      const ownerBalanceBefore = await token.balanceOf(signers[0].address);
      await token.transfer(signers[1].address, 100);
      const ownerBalanceAfter = await token.balanceOf(signers[0].address);
      expect(ownerBalanceAfter).to.eq(ownerBalanceBefore.sub(100));
    });
    it("transfer increase a balance", async () => {
      const receiverBalanceBefore = await token.balanceOf(signers[1].address);
      await token.transfer(signers[1].address, 100);
      const receiverBalanceAfter = await token.balanceOf(signers[1].address);
      expect(receiverBalanceAfter).to.eq(receiverBalanceBefore.add(100));
    });
    it("Transfer event ", async () => {
      expect(await token.transfer(signers[1].address, 100))
        .to.emit(token, "Transfer")
        .withArgs(signers[0].address, signers[1].address, 100);
    });
    it("require to = 0 address", async () => {
      await expect(
        token.transfer(ethers.constants.AddressZero, 100)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });
    it("require from = 0 address", async () => {
      await expect(
        token
          .connect(ethers.constants.AddressZero)
          .transfer(ethers.constants.AddressZero, 100)
      ).to.be.revertedWith("ERC20: transfer from the zero address");
    });
    it("require amount > balance", async () => {
      await expect(
        token.connect(signers[1]).transfer(signers[2].address, 100)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });
  describe("allowance", () => {
    it("Allowance equal to 0", async () => {
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(0);
    });
    it("approve increased a balance", async () => {
      await token.approve(signers[1].address, 100);
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(100);
    });
    it("Approval event ", async () => {
      expect(await token.approve(signers[1].address, 100))
        .to.emit(token, "Approval")
        .withArgs(signers[0].address, signers[1].address, 100);
    });
    it("transferFrom", async () => {
      await token.approve(signers[1].address, 100);
      await token
        .connect(signers[1])
        .transferFrom(signers[0].address, signers[2].address, 50);
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(50);
    });
  });
  describe("increaseAllowance", () => {
    it("Allowance increased", async () => {
      await token.increaseAllowance(signers[1].address, 100);
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(100);
    });
  });
  describe("decreaseAllowance", () => {
    it("SpendAllowance with transferFrom", async () => {
      await token.approve(signers[1].address, 100);
      await token
        .connect(signers[1])
        .transferFrom(signers[0].address, signers[2].address, 50);
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(50);
    });
    it("SpendAllowance with transferFrom", async () => {
      const amount = ethers.BigNumber.from(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );
      const receiverBalanceBefore = await token.balanceOf(signers[2].address);
      const senderBalanceBefore = ethers.BigNumber.from(
        await token.balanceOf(signers[0].address)
      );
      await token.approve(signers[1].address, amount);
      await token
        .connect(signers[1])
        .transferFrom(signers[0].address, signers[2].address, 100);
      const receiverBalanceAfter = await token.balanceOf(signers[2].address);
      const senderBalanceAfter = ethers.BigNumber.from(
        await token.balanceOf(signers[0].address)
      );
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(amount);
      expect(receiverBalanceAfter).to.eq(receiverBalanceBefore.add(100));
      expect(senderBalanceBefore).to.eq(senderBalanceAfter.add(100));
    });
    it("require spendAllowance, currentAllowance >= amount", async () => {
      await expect(
        token
          .connect(signers[1])
          .transferFrom(signers[0].address, signers[2].address, 50)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
    it("decreaseAllowance", async () => {
      await expect(
        token.decreaseAllowance(signers[1].address, 50)
      ).to.be.revertedWith("ERC20: decreased allowance below zero");
    });
    it("Allowance decreased", async () => {
      await token.increaseAllowance(signers[1].address, 100);
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(100);
      await token.decreaseAllowance(signers[1].address, 50);
      expect(
        await token.allowance(signers[0].address, signers[1].address)
      ).to.eq(50);
    });
  });
  describe("mint", () => {
    it("only owner can mint tokens", async () => {
      await expect(
        token.connect(signers[1]).mint(signers[1].address, 100)
      ).to.be.revertedWith("Only owner can use this function");
    });
    it("Minting tokens", async () => {
      const receiverBalanceBefore = await token.balanceOf(signers[1].address);
      await token.mint(signers[1].address, 100);
      const receiverBalanceAfter = await token.balanceOf(signers[1].address);
      expect(receiverBalanceBefore).to.eq(receiverBalanceAfter.sub(100));
    });
    it("require: mint to the zero address", async () => {
      await expect(
        token.mint(ethers.constants.AddressZero, 100)
      ).to.be.revertedWith("ERC20: mint to the zero address");
    });
    it("Total suply changed", async () => {
      const totalSupplyBefore = await token.totalSupply();
      await token.mint(signers[1].address, 100);
      const totalSupplyAfter = await token.totalSupply();
      expect(totalSupplyBefore).to.eq(totalSupplyAfter.sub(100));
    });
    it("Total suply changed", async () => {
      await expect(token.mint(signers[1].address, 100))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, signers[1].address, 100);
    });
  });
  describe("burn", () => {
    it("require, accountBalance >= amount", async () => {
      await expect(token.connect(signers[1]).burn(100)).to.be.revertedWith(
        "ERC20: burn amount exceeds balance"
      );
    });
    it("burn - totalSuply - burned", async () => {
      const totalSupplyBefore = await token.totalSupply();
      await token.burn(100);
      const totalSupplyAfter = await token.totalSupply();
      expect(totalSupplyAfter).to.eq(totalSupplyBefore.sub(100));
    });
    it("burn - balance - burned", async () => {
      const balanceBefore = ethers.BigNumber.from(
        await token.balanceOf(signers[0].address)
      );
      await token.burn(100);
      const balanceAfter = ethers.BigNumber.from(
        await token.balanceOf(signers[0].address)
      );
      expect(balanceBefore).to.eq(balanceAfter.add(100));
    });
    it("burn transfer event", async () => {
      await expect(token.burn(100))
        .to.emit(token, "Transfer")
        .withArgs(signers[0].address, ethers.constants.AddressZero, 100);
    });
  });
});
