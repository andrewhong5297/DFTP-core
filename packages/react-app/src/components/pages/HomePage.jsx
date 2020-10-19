import React, { Component } from 'react';

export const HomePage = (props) => {
    const welcome = "No role has been selected yet. Please select above."
        return ( 
            <React.Fragment>
                <h5>{welcome}</h5>
            </React.Fragment>
         );
    }
