const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { abi: abiToken } = require("../artifacts/SecurityToken.json");
const { abi: abiEscrow } = require("../artifacts/HolderContract.json");
const { abi: abiCT } = require("../artifacts/ConditionalTokens.json");
const fs = require("fs");
use(solidity);

function mnemonic() {
  return fs.readFileSync("./mnemonic.txt").toString().trim();
}

//make sure you have 'npx buidler node' running
describe("Lucidity Frontend Contract and Faucet Setup", function () {
  let Dai, HolderFactory, TokenFactory, CT, owner;
  //https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
  const overrides = {
    gasLimit: ethers.BigNumber.from("9500000"),
  };

  it("deploy contracts", async function () {
    // //setup make sure to fund in faucet before running this
    const provider = new ethers.providers.JsonRpcProvider()
    let facuet = new ethers.Wallet("0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908c") //place private key from buidler EVM here
    facuet = await facuet.connect(provider);
    
    owner = ethers.Wallet.fromMnemonic(mnemonic());
    owner = await owner.connect(provider);

    const tx = {
      to: owner.address,
      value: ethers.utils.parseEther("10"),
    };
    await facuet.signTransaction(tx)
    await facuet.sendTransaction(tx);

    const bal2 = await owner.getBalance()
    console.log("meta holds: ", bal2.toString())
    //end setup

    const TokenFactoryContract = await ethers.getContractFactory(
      "TokenFactory"
    ); //contract name here
    TokenFactory = await TokenFactoryContract.connect(owner).deploy(overrides);
    
    const HolderFactoryContract = await ethers.getContractFactory(
      "HolderFactory"
    ); //contract name here
    HolderFactory = await HolderFactoryContract.connect(owner).deploy(overrides);

    const CTContract = await ethers.getContractFactory("ConditionalTokens"); //contract name here
    CT = await CTContract.connect(owner).deploy(overrides);

    //use USDC on testnet/mainnet
    const DaiContract = await ethers.getContractFactory("Dai"); //contract name here
    Dai = await DaiContract.connect(owner).deploy(ethers.BigNumber.from("0"),overrides);
    await Dai.connect(owner).mint(owner.getAddress(),ethers.BigNumber.from("10000"))
    
    //deploy neg contract
    const OpenLawFactoryContract = await ethers.getContractFactory(
      "ProjectTrackerFactory"
    ); //contract name here
    OpenLawFactory = await OpenLawFactoryContract.connect(owner).deploy(overrides);

    console.log("all deployed")
    const daibalance = await Dai.balanceOf(owner.getAddress());
    console.log("meta address: ", await owner.getAddress());
    console.log("meta balance of Dai: ", daibalance.toString());

    console.log("tokenfactory address: ", TokenFactory.address);
    console.log("holderfactory address: ", HolderFactory.address);
    console.log("openlawneg address: ", OpenLawFactory.address);
  });
});
