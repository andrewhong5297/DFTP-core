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
describe("Lucidity Full Feature Test", function () {
  let Dai, HolderFactory, TokenFactory, CT, owner;
  //https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
  const overrides = {
    gasLimit: ethers.BigNumber.from("9500000"),
  };

  it("deploy contracts", async function () {
    // //setup make sure to fund in faucet before running this
    const provider = new ethers.providers.JsonRpcProvider()
    let facuet = new ethers.Wallet("0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908c")
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
    
    console.log("all deployed")
    const daibalance = await Dai.balanceOf(owner.getAddress());
    console.log("meta address: ", await owner.getAddress());
    console.log("meta balance of Dai: ", daibalance.toString());

    console.log("tokenfactory address: ", TokenFactory.address);
    console.log("holderfactory address: ", HolderFactory.address);
  });

  it("deploy first escrow and project (Called from openlaw)", async function () {
    //deploy escrow
    await HolderFactory.connect(owner).deployNewHolder(
      "Honduras Agriculture Project",
      CT.address,
      Dai.address,
      owner.getAddress(),
      owner.getAddress(),
      owner.getAddress(),
      ethers.BigNumber.from("500"),
      ethers.BigNumber.from("36"),
      ethers.BigNumber.from("300"),
      ethers.BigNumber.from("32"),
      ethers.BigNumber.from("800"),
      ethers.BigNumber.from("24"),
      overrides
    );

    const escrow = await HolderFactory.getHolder("Honduras Agriculture Project");

    const firstEscrow = new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      owner
    );

    //deploy project
    await TokenFactory.connect(owner).deployNewProject(
      "Honduras Agriculture Project",
      "AT",
      "linkhere",
      Dai.address,
      owner.getAddress(),
      owner.getAddress(),
      owner.getAddress(),
      overrides
    );

    const project = await TokenFactory.getProject("Honduras Agriculture Project");

    const firstProjectContract = new ethers.Contract(
      project.projectAddress,
      abiToken,
      owner
    );
    
    console.log("Make sure to update addresses in app.js after deploying");
    console.log("Dai address: ", Dai.address);
    console.log("CT address: ", CT.address);
    console.log("firsEscrow address: ", firstEscrow.address);
    console.log("firstProjectContract address: ", firstProjectContract.address);

    await firstProjectContract.connect(owner).setHolder(
      escrow.projectAddress);

    expect(
      (await firstProjectContract.projectName()) == "AgriTest",
      "project did not get init correctly"
    );
  });

  
  it("deploy second escrow and project (Called from openlaw)", async function () {
    //deploy escrow
    await HolderFactory.connect(owner).deployNewHolder(
      "Indonesia Water Project",
      CT.address,
      Dai.address,
      owner.getAddress(),
      owner.getAddress(),
      owner.getAddress(),
      ethers.BigNumber.from("500"),
      ethers.BigNumber.from("36"),
      ethers.BigNumber.from("300"),
      ethers.BigNumber.from("32"),
      ethers.BigNumber.from("800"),
      ethers.BigNumber.from("24"),
      overrides
    );

    const escrow = await HolderFactory.getHolder("Indonesia Water Project");

    const firstEscrow = new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      owner
    );

    //deploy project
    await TokenFactory.connect(owner).deployNewProject(
      "Indonesia Water Project",
      "IW",
      "linkhere2",
      Dai.address,
      owner.getAddress(),
      owner.getAddress(),
      owner.getAddress(),
      overrides
    );

    const project = await TokenFactory.getProject("Indonesia Water Project");

    const firstProjectContract = new ethers.Contract(
      project.projectAddress,
      abiToken,
      owner
    );
    
    console.log("Make sure to update addresses in app.js after deploying");
    console.log("Dai address: ", Dai.address);
    console.log("CT address: ", CT.address);
    console.log("second Escrow address: ", firstEscrow.address);
    console.log("second ProjectContract address: ", firstProjectContract.address);

    await firstProjectContract.connect(owner).setHolder(
      escrow.projectAddress);

    expect(
      (await firstProjectContract.projectName()) == "Indonesia Water Project",
      "project did not get init correctly"
    );
  });
});
