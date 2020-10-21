import React, { useState, Component } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Button, Alert } from "react-bootstrap"
const { abi: abiOL } = require("../../abis/ProjectNegotiationTracker.json");

export const OpenLawForm = (props) => {
    const { register, handleSubmit } = useForm(); //for project name submission
    
    let OpenLawProject = new ethers.Contract(
        "0x5D49B56C954D11249F59f03287619bE5c6174879", //insert new project deployed address
        abiOL,
        props.userProvider
    );

    const sendForm = (formData) => {
        //checks role then either call deploy on holder/project or submits to owner
    }

    const pullUpForm = () => {
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