const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    // --------------------------categories--------------------
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

    app.get("/categories/:brand", async (req, res) => {
      const category = req.params.brand;
      const query = { category: category};
      const result = await phonesCollection.find(query).toArray();
      res.send(result);
    });

    //-----------------------------phones------------------------
    app.post("/phones", async (req, res) => {
      const phone = req.body;
      const result = await phonesCollection.insertOne(phone);
      res.send(result);
    });

    app.get("/phones", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const phones = await phonesCollection.find(query).toArray();
      res.send(phones);
    });

    app.delete("/phones/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await phonesCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/phones/announce/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          advertise: true,
        },
      };
      const result = await phonesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/phones/announce", async (req, res) => {
      const query = {};
      const allPhones = await phonesCollection.find(query).toArray();
      const advertisedPhones = allPhones.filter(
        (phone) => phone.advertise && !phone.sold
      );
      res.send(advertisedPhones);
    });

    //  ---------------------------users-----------------------
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

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // app.get("/users/seller/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   res.send({ isSeller: user?.role === "seller" });
    // });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role === "seller") {
        res.send({ isSeller: user?.role === "seller" });
      } else {
        res.send({ isBuyer: user?.role === "buyer" });
      }
    });

    app.get("/admin/users/buyers", async (req, res) => {
      const query = {};
      const allUsers = await usersCollection.find(query).toArray();
      const buyers = allUsers.filter(user => user.role === "buyer")
      res.send(buyers);
    });

    app.get("/admin/users/sellers", async (req, res) => {
      const query = {};
      const allUsers = await usersCollection.find(query).toArray();
      const buyers = allUsers.filter(user => user.role === "seller")
      res.send(buyers);
    });


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
