const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoUser, mongoPass } = require('./config');
const uri =
    `mongodb+srv://${mongoUser}:${mongoPass}@destiny2-discord-bot-cl.jzodvan.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 });
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

module.exports = {
    connectMongoDB: async () => run().catch(console.dir)
};
