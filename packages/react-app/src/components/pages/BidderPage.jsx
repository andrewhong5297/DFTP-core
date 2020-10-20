import React, { useState } from 'react';
import { ethers } from "ethers";
import { Button, Alert } from "react-bootstrap"

export const BidderPage = (props) => {
    const welcome = "Bidder role has been selected"
    const [error, setError] = useState()
    const redeemTokens = async (formData) => {
        const owner = props.provider.getSigner();
        
        
        try {
            const conditionOne = await props.CT.connect(owner).getConditionId(
            props.firstEscrow.address,
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            2
            );
            console.log("redeemed for: ", conditionOne)
            await props.CT.connect(owner).redeemPositions(
                props.Dai.address,
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                conditionOne,
                [ethers.BigNumber.from("1")]
            );

            setError(
                <Alert variant="success" onClose={() => setError(null)} dismissible>
                    <Alert.Heading>New Funds Redeemed!</Alert.Heading>
                    <p>
                    Congrats on hitting the milestone, your new dai is being sent to your wallet.
                    </p>
                </Alert>
            ) 
        }
        catch(e) {
           console.error(e)
           setError(
                   <Alert variant="danger" onClose={() => setError(null)} dismissible>
                       <Alert.Heading>Transaction Error</Alert.Heading>
                       <p>
                       Looks like the milestone hasn't been met yet, check with your auditor
                       </p>
                   </Alert>
               ) 
        }     
    }
        return ( 
            <React.Fragment>
                <h6>{welcome}</h6>
                <Button onClick = {redeemTokens} variant="primary" className="btn-sm m-2">
                    Redeem Payout
                </Button>
                {error}
            </React.Fragment>
         );
    }
