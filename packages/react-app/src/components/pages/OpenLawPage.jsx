import React, { useState, Component } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Button, Alert } from "react-bootstrap"
const { abi: abiOLF } = require("../../abis/ProjectTrackerFactory.json");

export const OpenLawForm = (props) => {
    const { register, handleSubmit } = useForm(); //for project name submission
    const user = props.provider.getSigner();

    let OpenLawFactory = new ethers.Contract(
        "0xDe866932D277DB5B5d8c22c4f429d8045e6d4F82", //insert new project deployed address
        abiOLF,
        props.userProvider
    );

    //needs seperate role selection? 
    const sendForm = async (formData) => {
        if (props.role == "owner") {
           await OpenLawFactory.connect(user).deployNewProject(
            owner.getAddress(),
            props.HolderFactory.address,
            props.TokenFactory.address,
            "Honduras Agriculture Project", // form data
            "HAP", //form data
            "Milestone1; Milestone2; Milestone3", //form data
            [ethers.BigNumber.from("3"),ethers.BigNumber.from("6"),ethers.BigNumber.from("9")], //3 form data
            [ethers.BigNumber.from("300"),ethers.BigNumber.from("600"),ethers.BigNumber.from("900")] //3 form data
        ); 
        }
        if (props.role == "bidder") {
            //should provide new bidder terms
            //await OpenLawFactory.connect(user).newBidderTerms()
        }
        
    }

    const pullUpForm = () => {
        if (props.role == "owner")
        {
          const all_addresses = await OpenLawFactory.connect(user).getAllBidderAddresses()
          //for address selected, go to mapping and pull up with loadBidderTerms()

        }
        if (props.role == "bidder"){
            //should pull loadOwnerTerms()
        }
        //checks role then if address has a form already, and checks if there were any submissions. 
        //default to either bidder or owner form
    }

    //approve/submit? 

    //handle other roles?

    return (
        <div>
            Please fill out the form and submit, {props.role}
            <form onSubmit={handleSubmit(sendForm)} className="">
                <div className="input-group mb-3">
                    <div className="input-group-append col-centered">
                        <label>
                        <input type="text" name="value" ref={register} className="form-control" placeholder="Honduras Agriculture Project" aria-describedby="button-addon2" />
                        </label>
                        <label>
                        <input type="text" name="milestone" ref={register} className="form-control" placeholder="Milestone 1" aria-describedby="button-addon2" />
                        </label>
                        <div><button className="btn col-centeredbtn btn-outline-secondary" type="submit" value="submit" id="button-addon2">Connect to Project</button></div>
                    </div>
                </div>
            </form>
        </div>
    )
}