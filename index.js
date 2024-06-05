const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5000;


// middlewares
app.use(express.json());
app.use(cors());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jcb8og7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("bongo-explorer");
        const usersCollection = database.collection("users");
        const packagesCollection = database.collection("packages");


        // USER RELATED API

        app.get('/users', async (req, res) => {
            const email = req.query?.email;
            const query = email ? { email } : {};
            const cursor = usersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const data = req?.body;
            const query = { email: data?.email };
            const userInDatabase = await usersCollection.find(query).toArray();

            if (userInDatabase.length > 0) {
                res.send({ message: 'user already exists' })
            } else {
                const result = await usersCollection.insertOne(data);
                res.send(result);
            }
        });

        // GUIDE RELATED API

        app.get('/guides/all', async (req, res) => {
            const query = { role: 'GUIDE' };
            const cursor = usersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/guide', async (req, res) => {
            const email = req?.query?.email;
            const query = { email: email };
            const cursor = usersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // PACKAGE RELATED API
        app.get('/packages/all', async (req, res) => {
            const cursor = packagesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/package/:packageId', async (req, res) => {
            const id = req?.params?.packageId;
            const query = { _id: new ObjectId(id) };
            const cursor = packagesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/packages/all', async (req, res) => {
            const data = req?.body;
            const result = await packagesCollection.insertOne(data);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})