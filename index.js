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
        // await client.connect();
        const database = client.db("bongo-explorer");
        const usersCollection = database.collection("users");
        const packagesCollection = database.collection("packages");
        const bookingCollection = database.collection("bookedPackage");
        const wishlistCollection = database.collection("wishlist");
        const requestCollection = database.collection("request");
        const storyCollection = database.collection("stories");


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

        app.post('/update-role', async (req, res) => {
            const data = req.body;
            const result = await requestCollection.insertOne(data);
            res.send(result);
        });

        app.get('/users/request', async (req, res) => {
            const cursor = requestCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.put('/users', async (req, res) => {
            const email = req?.query?.email;
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    role: 'GUIDE'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.delete('/users/request/:requestId', async (req, res) => {
            const id = req?.params?.requestId;
            const query = { _id: new ObjectId(id) };
            const result = await requestCollection.deleteOne(query);
            res.send(result);
        })

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
            const query = { id: parseInt(id) };
            const cursor = packagesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/packages/add', async (req, res) => {
            const count = await packagesCollection.estimatedDocumentCount();
            const data = req?.body;
            data.id = count + 1;
            const result = await packagesCollection.insertOne(data);
            res.send(result);
        });

        // BOOK PACKAGE RELATED API
        app.get('/booked-packages/all', async (req, res) => {
            const email = req?.query?.email;
            const query = { touristEmail: email }
            const cursor = bookingCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/book-package', async (req, res) => {
            const data = req?.body;
            const result = await bookingCollection.insertOne(data);
            res.send(result);
        });

        app.delete('/booked-package/delete/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result)
        });

         // WISHLIST RELATED API
        app.get('/wishlist/all', async (req, res) => {
            const email = req?.query?.email;
            const query = { touristEmail: email }
            const cursor = wishlistCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/wishlist/add', async (req, res) => {
            const data = req?.body;
            const result = await wishlistCollection.insertOne(data);
            res.send(result);
        });

        app.delete('/wishlist/delete/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: new ObjectId(id) };
            const result = await wishlistCollection.deleteOne(query);
            res.send(result)
        });

        // STORY RELATED API
        app.get('/stories', async (req, res) => {
            const cursor = storyCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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