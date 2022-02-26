const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const Token = await ethers.getContractFactory("OwnERC20");
  const token = await Token.deploy();

  await token.deployed();

  console.log(`
    Deploying 
    =================
    Token contract address: ${token.address}
    ${await token.provider.getSigner().getAddress()} - deployed this contract
    Deployed to block: ${await ethers.provider.getBlockNumber()}
  `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
