const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { abi: abiNeg } = require("../artifacts/ProjectNegotiationTracker.json");
const { abi: abiToken } = require("../artifacts/SecurityToken.json");
const { abi: abiEscrow } = require("../artifacts/HolderContract.json");

use(solidity);

describe("Openlaw negotiation test", function () {
  let OpenLawFactory, Dai, HolderFactory, TokenFactory, CT;

  it("deploy contracts", async function () {
    const [owner, bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    //factory contracts
    const TokenFactoryContract = await ethers.getContractFactory(
      "TokenFactory"
    );
    TokenFactory = await TokenFactoryContract.connect(bidder).deploy();

    const HolderFactoryContract = await ethers.getContractFactory(
      "HolderFactory"
    ); 
    HolderFactory = await HolderFactoryContract.deploy();

    //conditional tokens
    const CTContract = await ethers.getContractFactory("ConditionalTokens"); //contract name here
    CT = await CTContract.deploy();

    //use USDC on testnet/mainnet
    const DaiContract = await ethers.getContractFactory("Dai"); //contract name here
    Dai = await DaiContract.connect(funder).deploy(ethers.BigNumber.from("0"));
    await Dai.connect(funder).mint(funder.getAddress(),ethers.BigNumber.from("100"))
    
    const daibalance = await Dai.balanceOf(funder.getAddress());
    console.log("funder address: ", await funder.getAddress());
    console.log("funder balance of Dai: ", daibalance.toString());
  
    //deploy neg contract
    const OpenLawFactoryContract = await ethers.getContractFactory(
      "ProjectTrackerFactory"
    ); //contract name here
    OpenLawFactory = await OpenLawFactoryContract.deploy();

    console.log("terms proposed")
    //deploy project
    await OpenLawFactory.connect(owner).deployNewProject(
        owner.getAddress(),
        HolderFactory.address,
        TokenFactory.address,
        "Honduras Agriculture Project",
        "HAP",
        "Milestone1; Milestone2; Milestone3",
        [ethers.BigNumber.from("3"),ethers.BigNumber.from("6"),ethers.BigNumber.from("9")],
        [ethers.BigNumber.from("300"),ethers.BigNumber.from("600"),ethers.BigNumber.from("900")]
      );

      const project = await OpenLawFactory.getProject("Honduras Agriculture Project");
      console.log(project)
  });

  it("initiate bid, approval, and deploy project/holder", async function () {
    const [owner, auditor, bidder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each
    const lawproject = await OpenLawFactory.getProject("Honduras Agriculture Project");

    console.log("bidder address: ", await bidder.getAddress());

    const lawProjectContract = new ethers.Contract(
      lawproject.projectAddress,
        abiNeg,
        owner
      );

    await lawProjectContract.connect(bidder).newBidderTerms(
        [ethers.BigNumber.from("4"),ethers.BigNumber.from("6"),ethers.BigNumber.from("9")],
        [ethers.BigNumber.from("400"),ethers.BigNumber.from("600"),ethers.BigNumber.from("900")])

    //frontend should just list different addresses of bidders?
    const milestone = await lawProjectContract.connect(owner).milestones();
    console.log("milestone terms: ", milestone);

    const bidderTerms = await lawProjectContract.connect(owner).loadBidderTerms(bidder.getAddress());
    console.log("bidder terms: ", bidderTerms);

    await lawProjectContract.connect(owner).approveBidderTerms(
      bidder.getAddress(),
      CT.address,
      Dai.address,
      auditor.getAddress())
    console.log("bid approved");

    const winningBid = await lawProjectContract.winningBidder()
    console.log("winning bidder address: ", winningBid);

    //link holder as escrow
    const escrow = await HolderFactory.getHolder("Honduras Agriculture Project");
    console.log(escrow)

    const firstEscrow = new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      owner
    );

    const project = await TokenFactory.getProject("Honduras Agriculture Project");

    const firstProjectContract = new ethers.Contract(
      project.projectAddress,
      abiToken,
      owner
    );

    await firstProjectContract.connect(owner).setHolder(
      escrow.projectAddress);
  
    console.log("Dai address: ", Dai.address);
    console.log("CT address: ", CT.address);
    console.log("firsEscrow address: ", firstEscrow.address);
    console.log("firstProjectContract address: ", firstProjectContract.address);
});
});
