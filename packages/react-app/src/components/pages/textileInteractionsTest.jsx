import React, { Component } from 'react';
import { setup, createDB, schema, collectionFromSchema, create, findEntity, createQuery} from "./textile"
import { Button, Container, Row, Col, Card, Dropdown, Alert } from "react-bootstrap"

export const TextileTest = () => {

    return (
        <div>
            <Button onClick = {setup} size="sm">try functions</Button>
        </div>
    )
}