const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bd0fwfk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const spotCollection = client.db("spotDB").collection("touristspot");

    const countryCollection = client.db("spotDB").collection("country");

    // * ---------- Tourist Spots ----------

    // ✅ Get all tourist spots
    app.get("/alltouristspot", async (req, res) => {
      const result = await spotCollection.find().toArray();
      res.send(result);
    });

    // ✅ Get single spot by ID
    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });

    // ✅ Add new tourist spot (must include user email)
    app.post("/addtouristspot", async (req, res) => {
      const newSpot = req.body;
      console.log("Adding spot:", newSpot);

      // Example object structure:
      // { tourists_spot_name, location, average_cost, image, email }
      const result = await spotCollection.insertOne(newSpot);
      res.send(result);
    });

    // Get spots by user email
    app.get("/myspots", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }
      const query = { user_email: email }; // <-- use the correct field
      const result = await spotCollection.find(query).toArray();
      res.send(result);
    });

    // ✅ Delete a spot by ID
    app.delete("/myspots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    });

    // ✅ Update a spot by ID
    app.put("/myspots/:id", async (req, res) => {
      const id = req.params.id;
      const updatedSpot = req.body;

      try {
        const result = await spotCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedSpot }
        );

        // ✅ Return modifiedCount so frontend can detect success
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to update spot" });
      }
    });

    // * ---------- Countries ----------

    // ✅ Get all countries
    app.get("/countries", async (req, res) => {
      const result = await countryCollection.find().toArray();
      res.send(result);
    });



    // Add new COuntry
    app.post("/countries", async (req, res) => {
      const newCountry = req.body;
      const result = await countryCollection.insertOne(newCountry);
      res.send(result);
    });

    // ✅ Get all tourist spots of a specific country
    app.get("/spots/country/:countryName", async (req, res) => {
      const countryName = req.params.countryName;
      const query = { country_Name: countryName };
      const result = await spotCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/spots/country/:countryName", async (req, res) => {
      const { countryName } = req.params;
      const spots = await spotsCollection
        .find({ country_Name: countryName })
        .toArray();
      res.json(spots);
    });

   

    // ✅ Ping test
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } finally {
    // leave connection open while server runs
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("🌍 Adventure server is running ✅");
});

app.listen(port, () => {
  console.log(`🚀 Adventure server running on port: ${port}`);
});
