import React, { Component } from 'react';
import { setup, createDB, schema, collectionFromSchema, create, findEntity, createQuery} from "./textile"
import { Button, Container, Row, Col, Card, Dropdown, Alert } from "react-bootstrap"
import { createUserAuth, Client, PrivateKey, ThreadID, UserAuth, QueryJSON} from '@textile/hub'

export const TextileTest = () => {
    let userAuth, client, thread, threads, collection, created;
    const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Project Contract',
        type: 'object',
        properties: {
          _id: { type: 'string' },
          owner: { type: 'string'},
          bidder: { type: 'string'},
          auditor: { type: 'string'},
          milestones: { type: 'string' },
          budgets: { "type": "array",
                    "items": { "type": "integer" },
                    "uniqueItems": true,
                    "default": []},
          timeline: { "type": "array",
                    "items": { "type": "integer" },
                    "uniqueItems": true,
                    "default": []},
        },}

    const getClient = async () => {
        userAuth = await createUserAuth({key: "b4ubw5kjw4bnetzbld4zfqmbhaq", secret: "bnlre4or4klaezixde3izvgotxbgluxlprywsrvi"})
        console.log(userAuth)
        client = await Client.withUserAuth(userAuth)
        console.log(client)
    }

    const createThread = async () => {
        thread = await client.newDB()
        console.log(thread)
    }

    const getThreads = async () => {
        threads = await client.listThreads()
    }
    
    const createCollectionInThread = async () => {
        await client.newCollection(ThreadID, {name: 'Finished Projects', schema: schema})
    }

    const addToCollection = async () => {
        created = await client.create(ThreadID, collection, [{
            _id: "hello",
            owner: "address",
            bidder: "address",
            auditor: "address",
            milestones: "m1; m2; m3",
            budgets: [100, 200, 300],
            timeline: [5, 10, 10]
          }])

          console.log(created)
    }

    return (
        <div>
            <Button onClick = {getClient} size="sm">client</Button>
            <Button onClick = {createThread} size="sm">thread</Button>
            <Button onClick = {createCollectionInThread} size="sm">collection</Button>
            <Button onClick = {addToCollection} size="sm">collection</Button>
        </div>
    )
}