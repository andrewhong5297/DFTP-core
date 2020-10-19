import React, { useState, useEffect } from 'react';

export const OwnerPage = (props) => {
    const welcome = "Owner role has been selected "
    let projectName,budgets,timeline;
    const [textArea, setText] = useState("loading...")

    const getProjectDetails= async () => {
        projectName = await props.firstEscrow.projectName()
        budgets = await props.firstEscrow.budgetsOne()
        timeline = await props.firstEscrow.timelineOne()

        setText(
            <div>
                <div>Project Name: {projectName}</div>
                <div>Milestone One Budget: {budgets.toString()}</div>
                <div>Timeline for Milestone One (months): {timeline.toString()}</div>
            </div>
        )
            
    }

    useEffect(() => {
        getProjectDetails();
      }, []);
    
        return ( 
            <React.Fragment>
                <h5>{welcome}</h5>
                {textArea}
            </React.Fragment>
         );
    }
