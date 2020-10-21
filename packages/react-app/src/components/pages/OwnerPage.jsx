import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap'

export const OwnerPage = (props) => {
    const welcome = "Owner role has been selected "
    let projectName,budgets,timeline;
    const [textArea, setText] = useState("loading...")

    const getProjectDetails= async () => {
        projectName = await props.escrow.projectName()
        const budget1 = await props.escrow.budgetsOne()
        const timeline1 = await props.escrow.timelineOne()
        const budget2 = await props.escrow.budgetsTwo()
        const timeline2 = await props.escrow.timelineTwo()
        const budget3 = await props.escrow.budgetsThree()
        const timeline3 = await props.escrow.timelineThree()

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
                    <td>{budget1.toString()}</td>
                    <td>{timeline1.toString()}</td>
                    </tr>
                    <tr>
                    <td>2</td>
                    <td>{budget2.toString()}</td>
                    <td>{timeline2.toString()}</td>
                    </tr>
                    <tr>
                    <td>3</td>
                    <td>{budget3.toString()}</td>
                    <td>{timeline3.toString()}</td>
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
