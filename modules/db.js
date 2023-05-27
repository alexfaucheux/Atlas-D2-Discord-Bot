import { MongoClient, ServerApiVersion } from 'mongodb';
const { MONGODB_USER, MONGODB_PASS } = process.env;

const dbName = 'atlas-D2';
const mongoURL = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@destiny2-discord-bot-cl.jzodvan.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoURL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

const mongoClient = {
    db: null,
    collections: {}
};

async function startMongoDB() {
    await client.connect();
    const db = (mongoClient.db = client.db(dbName));
    const cols = mongoClient.collections;

    cols.auth = db.collection('auth');
    cols.users = db.collection('users');
    cols.clans = db.collection('clans');
    cols.tweets = db.collection('tweets');
    cols.rewards = db.collection('rewards');
    cols.bungieNews = db.collection('news');
}

const closeMongoDB = async () => await client.close();

export { mongoClient, startMongoDB, closeMongoDB };
