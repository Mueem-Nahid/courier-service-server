const express = require('express');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
// app.options('*', cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.seewk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run () {
    try {
        await client.connect();
        const database = client.db("5G-Courier-Service");
        //collections
        const serviceCollection = database.collection("services");
        const orderCollection = database.collection('orders');
        const clientCollection = database.collection('clients');

        //GET API
        app.get('/services', async(req, res) => {
            const cursor = serviceCollection.find({});

            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }
            const services = await cursor.toArray();
            res.send(services);
        });

        //GET ONE 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        // POST API
        app.post('/services', async(req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.json(result);
        });

        //Place Order API
        app.post('/place-order', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        //Get My Orders API
        app.get('/my-orders/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = {userEmail: (email)};
            const orders = await orderCollection.find(query).toArray();
            res.json(orders);
            
        });

        //Cancle my order API
        app.delete('/my-orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            if(result.deletedCount === 1) {
                console.log("Deleted id ", id);
            } else {
                console.log("No doc matched the query. Deleted 0 documents.");
            }
            res.json(result);
        });

        //GET all orders to manage API
        app.get('/manage-orders', async (req, res) => {
            const cursor = orderCollection.find({});

            if((await cursor.count()) === 0) {
                console.log("No orders found");
            }
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //Update status API
        app.patch('/manage-orders/:id', async(req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            console.log('Id:', id);
            console.log('Update Order:', updateOrder);
            const filter = {_id: ObjectId(id)};
            const updateDoc = {
                $set: {
                    status: updateOrder.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        //Cancle Order API
        app.delete('/manage-orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            if(result.deletedCount === 1) {
                console.log("Deleted id ", id);
            } else {
                console.log("No doc matched the query. Deleted 0 documents.");
            }
            res.json(result);
        });

        // Get Client API
        app.get('/clients', async(req, res) => {
            const cursor = clientCollection.find({});

            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }
            const clients = await cursor.toArray();
            res.send(clients);
        });
    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('5G-Courier server is running');
});

app.listen(port, ()=>{
    console.log('Server running at port ', port);
})