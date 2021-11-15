const { MongoClient } = require('mongodb');
const express = require("express");
require('dotenv').config()
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port =process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.btdeq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
try{
await client.connect();

const database = client.db("watchShop");
const productCollection = database.collection("products");
const orderCollection = database.collection("orders");
const userCollection = database.collection("users");
const reviewCollection = database.collection("review");

//post api
app.post('/addProduct',async(req,res)=>{
    const product = req.body;
    const result = await productCollection.insertOne(product);
    res.send(result);
})

//post api
app.post('/review',async(req,res)=>{
  const review = req.body;
  const result = await reviewCollection.insertOne(review);
  res.send(result);
})
//get review
app.get('/review',async(req,res)=>{
  const cursor =  reviewCollection.find({});
  const result = await cursor.toArray();
  res.send(result);
})
//get data from db to ui
app.get('/products',async(req,res)=>{
    const cursor =  productCollection.find({});
    const products = await cursor.toArray();
    res.send(products);
})

//post order
app.post('/placeOrder',async(req,res)=>{
    const orders = req.body;
  
    const result = await orderCollection.insertOne(orders);
    res.send(result);
})


  //save user

  app.post('/users', async(req,res)=>{
    const user =req.body;
    const result = await userCollection.insertOne(user)
    res.json(result);
  })
/*
  //using put for upsart user for google sign in ---------
  app.put('/users', async(req,res)=>{
    const user =req.body;
    const filter ={ email : user.email}
    const option ={ upsert:true }
    const updateDoc={ $set : user}
    const result = await userCollection.updateOne(filter, updateDoc,option)
    res.json(result)

  })
*/
//Make Admin ---------------
app.put('/users/admin', async(req,res)=>{
const user = req.body;
const filter ={ email : user.email}
const updateDoc = { $set : {role : 'admin'}}
const result = await userCollection.updateOne(filter,updateDoc)
res.json(result)
})

//get email to check admin
app.get('/users/:email',async(req,res)=>{
  const email = req.params.email;
  const query ={email : email}
  const user = await userCollection.findOne(query)
  let isAdmin = false;
  if(user?.role==='admin'){
    isAdmin = true;
  }
  res.json({admin : isAdmin})
})

//get order data from db to ui
app.get('/allOrders',async(req,res)=>{
    const cursor =  orderCollection.find({});
    const orders = await cursor.toArray();
    res.send(orders);
})


 // my orders

 app.get("/orders/:email", async (req, res) => {
    const order = await orderCollection.find({
      email: req.params.email,
    }).toArray();
    res.send(order);
  });

  //delete Order from ui
  app.delete("/deleteOrder/:id", async (req, res) => {
    const id = req.params.id;
    
    const result = await orderCollection.deleteOne({
      _id: ObjectId(id),
    });
   
    res.send(result);
    
  });

  //update shipped
  app.put("/update/:id", async (req, res) => {
    const id = req.params.id;
    
    const updateDoc={$set:{stetus:'Shipped'}}
    const result = await orderCollection.updateOne({
      _id: ObjectId(id)
    } ,updateDoc );
  
    res.send(result);
    
  });






}
finally{
    //await client.close()
}
}

run().catch(console.dir)


app.get("/",(req,res)=>{
    res.send("hello world");
});

app.listen(port,()=>{
    console.log("running server on port", port);
});
