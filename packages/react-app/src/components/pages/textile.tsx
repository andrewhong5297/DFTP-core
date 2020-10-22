import {Client, PrivateKey, ThreadID, UserAuth, QueryJSON} from '@textile/hub'

//create user and return client
export async function setup (auth: UserAuth) {
  const user = await PrivateKey.fromRandom()

  const client = await Client.withUserAuth(auth)

  return client
}

//create database and return thread
export async function createDB (client: Client) {
    const thread: ThreadID = await client.newDB()
    return thread
  }

//User Mailbox API allows sharing of DB to other users
//DB contains collections that follow a json-schema.org schema. Each collection has instances (JSON documents with schemas that match those defined in your collection. Looks like theGraph)

// Define a simple person schema
export const schema = {
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
    },
  }
  
// Requires the started database we created above and creates a collection
export async function collectionFromSchema (client: Client, threadID: ThreadID) {
    await client.newCollection(threadID, {name: 'Finished Projects', schema: schema})
  }

// gets all in a query
export async function findEntity (client: Client, threadId: ThreadID, collection: string) {
    const found = await client.find(threadId, collection, {})
    console.debug('found:', found.length)
  }

// matches YourModel and schema, adding an instance
export async function create (client: Client, threadId: ThreadID, collection: string) {
    const created = await client.create(threadId, collection, [{
      _id: "hello",
      owner: "address",
      bidder: "address",
      auditor: "address",
      milestones: "m1; m2; m3",
      budgets: [100, 200, 300],
      timeline: [5, 10, 10]
    }])
  }

// Requires the started database we generated above containing the Player collection
export async function createQuery (client: Client, threadID: ThreadID, query: QueryJSON) {
    // Get results
    const all = await client.find(threadID, 'Project Contract', query)
    return all
  }