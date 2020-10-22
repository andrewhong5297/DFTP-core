import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { INFURA_ID, ETHERSCAN_KEY } from "./constants";
// blockchain libs
import WalletConnectProvider from "@walletconnect/web3-provider";
import { getDefaultProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { useUserAddress } from "eth-hooks";
// ui libs
import Web3Modal from "web3modal";
import { Table, Button, Container, Row, Col, Card, Dropdown, Alert } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

// common libs
import { Header, Account, Body } from "./components";
import { useExchangePrice,  useUserProvider} from "./hooks";
// assets
import "antd/dist/antd.css";
import "./App.css";

//added stuff
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
// import CPK from "contract-proxy-kit"
import { useQuery } from '@apollo/react-hooks';

import { HomePage } from "./components/pages/HomePage";
import { FunderPage } from "./components/pages/FunderPage";
import { OwnerPage } from "./components/pages/OwnerPage";
import { AuditorPage } from "./components/pages/AuditorPage";
import { BidderPage } from "./components/pages/BidderPage";
import { OpenLawForm } from "./components/pages/OpenLawPage";
import { TextileTest } from "./components/pages/textileInteractionsTest";
import { GET_FUNDERS } from "./graphql/subgraph";

const { abi: abiToken } = require("./abis/SecurityToken.json");
const { abi: abiEscrow } = require("./abis/HolderContract.json");
const { abi: abiTokenF } = require("./abis/TokenFactory.json");
const { abi: abiEscrowF } = require("./abis/HolderFactory.json");
const { abi: abiDai } = require("./abis/Dai.json");
const { abi: abiCT } = require("./abis/ConditionalTokens.json");

/* IMPORTANT STEPS FOR TESTING 
1) Start buidler node with yarn chain (or ganache-cli -h 0.0.0.0). Take one of the private keys and place it in the faucet address in test contract (line 25)
2) Start a graph node with "docker-compose up" in graph-node/docker
2) Start react app with yarn start 
3) run buidler test on frontend test script with "yarn test" or "npx buidler test". Make sure you have your metamask mnemonic.txt file in buidler folder
4) the console of the test will print "tokenfactory address" which should go into subgraph.yaml address on line 11. Then deploy subgraph (run "yarn create-local" and "yarn deploy-local" in lucidity-funders-tracking folder)
5) You may have to change contract addresses lines 97-119 since we all have different metamask accounts. You will have to restart the app to relink them. 
6) Reset metamask account to sync nonce after running test
7) click give self 100 dai, if this works then everything should work now. 
*/

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
// const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // const [route, setRoute] = useState();
  // useEffect(() => {
  //   console.log("SETTING ROUTE", window.location.pathname)
  //   setRoute(window.location.pathname)
  // }, [window.location.pathname]);
    
  //initial contract links
  let OLfactoryAddress = "0xDe866932D277DB5B5d8c22c4f429d8045e6d4F82"

  let Dai = new ethers.Contract(
    "0x5D49B56C954D11249F59f03287619bE5c6174879",
    abiDai,
    userProvider
  );

  let CT = new ethers.Contract(
    "0xaB2d7Ca5361B1f8E944543063d63098589bdcD1B",
    abiCT,
    userProvider
  );

  let HolderFactory = new ethers.Contract(
    "0x057F0ea335ADBeF55e66F9ddeE98Bc53D45dFFD1",
    abiEscrowF,
    userProvider
  );

  let TokenFactory = new ethers.Contract(
    "0x83Fbd04ccce2AeDd94E8e9783De26FE5D5D8a26B",
    abiTokenF,
    userProvider
  );

  //update after project name search
  const [error, setError] = useState()
  const [projectNotConnected, setConnection] = useState(true);
  const { register, handleSubmit } = useForm(); //for project name submission

  const [ProjectName, setProjectName] = useState(null);
  const [Escrow, setEscrow] = useState(null);
  const [Project, setProject] = useState(null);
  const updateContracts = async (formData) => {
    console.log("searching project name: ", formData.value)
    
    try {
      const escrow = await HolderFactory.getHolder(formData.value);
      const project = await TokenFactory.getProject(formData.value);

      setEscrow(await new ethers.Contract(
        escrow.projectAddress,
        abiEscrow,
        userProvider
      ))
  
      setProject(await new ethers.Contract(
        project.projectAddress,
        abiToken,
        userProvider
      ))

      setConnection(false) //enables buttons
      setProjectName(formData.value)
      setError(
      <Alert variant="success" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Link Worked</Alert.Heading>
          <p>
          Project and escrow have been linked, feel free to continue
          </p>
      </Alert>)
    }
    catch(e) {
      console.error(e)
      setError(
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  <Alert.Heading>Link Error</Alert.Heading>
                  <p>
                  Looks like that didn't go through - make sure you spelled the name of the project correctly.
                  </p>
              </Alert>
          ) 
      }
    }

  //theGraph API requests
  const { loading, gqlerror, data } = useQuery(GET_FUNDERS, { variables: {projectName: ProjectName}});
  const [ funderList, setList ] = useState("No funders yet, be the first one!")
  const queryResult = () => {
    if (loading) console.log("loading")
    if (gqlerror) console.log("error")
    else {
      console.log(ProjectName)
        //https://www.apollographql.com/docs/react/get-started/
        setList(
          <div>
               <br></br>
               <h5>Project Address: {data.projects[0].projectAddress}</h5>
               <br></br>
                <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Token Id</th>
                    <th>Owner Address:</th>
                    <th>Funded Amount</th>
                    <th>Funded Tenor</th>
                    </tr>
                </thead>
                <tbody>
                {data.projects[0].fundingTokens.map(function({ id, owner, fundingvalue, tenor}) {
                  console.log("was called")
                    return(
                    <tr>
                    <td>{id}</td>
                    <td>{owner}</td>
                    <td>{fundingvalue.toString()}</td>
                    <td>{tenor.toString()}</td>
                    </tr>
                    )
                })}
                </tbody>
                </Table>
            </div>
        )
    }
  }
  
  //setting dai balance at bottom left
  const [daibalance, setDaiBalance] = useState(["  loading balance..."]);
  const updateDaiBalance = async () => {
    const daibalance = await Dai.balanceOf(address);
    console.log(daibalance.toString())
    setDaiBalance(`  Dai balance: ${daibalance.toString()}`)
  }

  //openlaw link
  const link = <a href="https://lib.openlaw.io/web/default/template/LucidityRFP"> fill out RFP first</a>;   

  //roles dropdown
  const [PageState, setPage] = useState([<HomePage />])
  const handleSelect=(e)=>{
    console.log(`${e} has been selected`);
    if (e=="FunderPage") {
      setPage(<FunderPage 
        address={address} 
        provider ={userProvider} 
        escrow = {Escrow}
        Project = {Project}
        Dai = {Dai}/>)
    }
    if (e=="BidderPage") {
      setPage(<BidderPage 
        provider ={userProvider} 
        escrow = {Escrow}
        CT={CT}/>)
    }
    if (e=="AuditorPage") {
      setPage(<AuditorPage 
        provider ={userProvider} 
        escrow = {Escrow}
        Project = {Project}
        CT={CT}/>)
    }
    if (e=="OwnerPage") {
      setPage(<OwnerPage projectName = {ProjectName}/>)
    }
  }

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header>
        {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </Header>
      <Body>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Container fluid="md">
                <Row className="mt-1">
                    <Col>
                    <Card>
                    {/* <TextileTest /> */}
                      <div className="cardDiv">
                        <OpenLawForm 
                          provider ={userProvider} 
                          address={address} 
                          provider ={userProvider} 
                          TokenFactory = {TokenFactory}
                          HolderFactory = {HolderFactory}
                          CT = {CT}
                          OLfactoryAddress={OLfactoryAddress}/>
                      </div>
                    </Card>
                    <Card>
                      <div className="cardDiv">
                        <h6 className="mt-1">Please {link} or fill out form above for new projects; otherwise search for project name below:</h6>
                          <form onSubmit={handleSubmit(updateContracts)} className="">
                            <div className="input-group mb-3">
                                <div className="input-group-append col-centered">
                                  <label>
                                  <input type="text" name="value" ref={register} className="form-control" placeholder="Honduras Agriculture Project" aria-describedby="button-addon2" />
                                  </label>
                                  <div><button className="btn col-centeredbtn btn-outline-secondary" type="submit" value="submit" id="button-addon2">Connect to Project</button></div>
                                </div>
                              </div>
                        </form>
                        {error}
                        </div>
                      </Card>
                      <Card className="mt-1">
                        <div className="cardDiv">
                            <Dropdown onSelect={handleSelect}>
                              <Dropdown.Toggle variant="primary" id="dropdown-basic" size="md" disabled={projectNotConnected}>
                                Roles
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item eventKey="OwnerPage">Owner</Dropdown.Item>
                                <Dropdown.Item eventKey="FunderPage">Funder</Dropdown.Item>
                                <Dropdown.Item eventKey="AuditorPage">Auditor</Dropdown.Item>
                                <Dropdown.Item eventKey="BidderPage">Bidder</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <br></br>
                            {PageState}
                        </div>
                      </Card>
                      <Card className="mt-1">
                    <div className="cardDiv"><h6>List of all funders for selected project:</h6>
                        <Button onClick = {queryResult} disabled = {projectNotConnected} size="sm">Update Funders List</Button>
                        <div>
                          {funderList}
                        </div>
                     </div>
                    </Card>
                  </Col>
                </Row>
              </Container>
                
                <div className="fixed-bottom">
                  <div>{Dai.address}</div>
                  <Button onClick = {updateDaiBalance} size="sm">Update Dai Balance:</Button>
                  {daibalance}
                </div>
            </Route>
          </Switch>
        </BrowserRouter>
      </Body>
    </div >
  );
}

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

export default App;
