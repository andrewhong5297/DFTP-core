import {Client, PrivateKey, ThreadID, UserAuth, QueryJSON} from '@textile/hub'

async function setup (auth: UserAuth) {
  const user = await PrivateKey.fromRandom()

  const client = await Client.withUserAuth(auth)

  return client
}

//create database
async function createDB (client: Client) {
    const thread: ThreadID = await client.newDB()
    return thread
  }

//User Mailbox API allows sharing of DB to other users
//DB contains collections that follow a json-schema.org schema. Each collection has instances (JSON documents with schemas that match those defined in your collection. Looks like theGraph)

// Define a simple person schema
const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Person',
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string' },
      missions: {
        type: 'number',
        minimum: 0,
        exclusiveMaximum: 100,
      },
    },
  }
  
// Requires the started database we created above and creates a collection
async function collectionFromSchema (client: Client, threadID: ThreadID) {
    await client.newCollection(threadID, {name: 'Astronauts', schema: schema})
  }

// gets all in a query
async function findEntity (client: Client, threadId: ThreadID, collection: string) {
    const found = await client.find(threadId, collection, {})
    console.debug('found:', found.length)
  }

// matches YourModel and schema, adding an instance
async function create (client: Client, threadId: ThreadID, collection: string) {
    const created = await client.create(threadId, collection, [{
      some: 'data',
      numbers: [1, 2, 3]
    }])
  }

// Requires the started database we generated above containing the Player collection
async function createQuery (client: Client, threadID: ThreadID, query: QueryJSON) {
    // Get results
    const all = await client.find(threadID, 'astronauts', query)
    return all
  }