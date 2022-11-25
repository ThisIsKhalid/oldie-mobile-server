const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uwm1xgh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categoriesCollection = client
      .db("oldieMobile")
      .collection("categories");
    const phonesCollection = client.db("oldieMobile").collection("phones");
    const usersCollection = client.db("oldieMobile").collection("users");

    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoriesCollection.find(query).toArray();
      res.send(categories);
    });
    // app.post("/categories", async (req, res) => {
    //   const category = req.body;
    //   const result = await categoriesCollection.insertOne(category);
    //   res.send(result);
    // });

    app.get("/categories/:phones", async (req, res) => {
      const category = req.params.phones;
      const query = { category: category };
      const phones = await phonesCollection.find(query).toArray();
      res.send(phones);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const oldUser = await usersCollection.findOne(query);
      // const existedEmail = oldUser?.email;
      if (user.email === oldUser?.email) {
        return res.send(oldUser);
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users/admin/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email}
      const user = await usersCollection.findOne(query)
      res.send({isAdmin: user?.role === "admin"});
    })
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
