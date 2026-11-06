import express from "express";
import { MongoClient } from "mongodb";
import "dotenv/config";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(
  `mongodb://${process.env.MONGO_USER_NAME}:${process.env.MONGO_USER_PASS}@ac-1igpkzg-shard-00-00.o6diijd.mongodb.net:27017,ac-1igpkzg-shard-00-01.o6diijd.mongodb.net:27017,ac-1igpkzg-shard-00-02.o6diijd.mongodb.net:27017/?ssl=true&replicaSet=atlas-gtuaj4-shard-0&authSource=admin`,
);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB();
const database = connectedClient.db("Wanderlust");
const destinationsCollection = database.collection("destinations");

app.get("/", (req, res) => {
  res.send({ message: "Server is Running on Port 5000" });
});

// Add a new destination
app.post("/add-destination", async (req, res) => {
  const destination = req.body;
  const result = await destinationsCollection.insertOne(destination);
  console.log(result);
  res.send(result);
});

// Get all destinations

app.get("/all-destinations", async (req, res) => {
  const cursor = destinationsCollection.find({});
  const destinations = await cursor.toArray();
  res.send(destinations);
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
