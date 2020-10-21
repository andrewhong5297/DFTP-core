import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap'
const { abi: abiOL } = require("../../abis/ProjectNegotiationTracker.json");

export const OwnerPage = (props) => {
    const welcome = "Owner role has been selected "
    let projectName,budgets,timeline;
    const [textArea, setText] = useState("loading...")
    
    // const projectNeg = await OpenLawFactory.connect(user).getProject(projectName)
    // const projectNegContract = new ethers.Contract(
    //     project.projectAddress, //insert new project deployed address
    //     abiOL,
    //     props.userProvider
    // );
    const getProjectDetails= async () => {
        projectName = await props.escrow.projectName()
        const budgets = await props.escrow.getBudgets()
        const timelines = await props.escrow.getTimelines()
        console.log(budgets[0].toString())
        setText(
            <div>
               <h3>Project Name: {projectName}</h3>
                <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Milestone #</th>
                    <th>Budget (Dai)</th>
                    <th>Timeline (Months)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>1</td>
                    <td>{budgets[0].toString()}</td>
                    <td>{timelines[0].toString()}</td>
                    </tr>
                    <tr>
                    <td>2</td>
                    <td>{budgets[1].toString()}</td>
                    <td>{timelines[1].toString()}</td>
                    </tr>
                    <tr>
                    <td>3</td>
                    <td>{budgets[2].toString()}</td>
                    <td>{timelines[2].toString()}</td>
                    </tr>
                </tbody>
                </Table>
            </div>
        )
    }

    useEffect(() => {
        getProjectDetails();
      }, []);
    
        return ( 
            <React.Fragment>
                <h6>{welcome}</h6>
                {textArea}
            </React.Fragment>
         );
    }
