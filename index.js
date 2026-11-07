import express from "express";
import { MongoClient, ObjectId } from "mongodb";
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
  if (
    typeof destination.imageUrl === "string" &&
    destination.imageUrl.trim()
  ) {
    destination.imageUrl = destination.imageUrl.trim();
  }
  const result = await destinationsCollection.insertOne(destination);
  console.log(result);
  res.send(result);
});

// Get all destinations

app.get("/all-destinations", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const cursor = destinationsCollection.find({});
  const destinations = await cursor.toArray();
  res.send(destinations);
});

// Get a single destination by ID
app.get("/destination/:id", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid destination ID" });
  }

  const destination = await destinationsCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }

  res.send(destination);
});

// Update an existing destination
app.put("/destination/:id", async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid destination ID" });
  }

  const destination = await destinationsCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }

  const allowedFields = [
    "destinationName",
    "country",
    "category",
    "price",
    "duration",
    "departureDate",
    "imageUrl",
    "description",
    "rating",
    "highlights",
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  if (
    typeof updates.imageUrl !== "string" ||
    updates.imageUrl.trim() === ""
  ) {
    delete updates.imageUrl;
  } else {
    updates.imageUrl = updates.imageUrl.trim();
  }

  const result = await destinationsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates },
  );

  if (!result.matchedCount) {
    return res.status(404).send({ message: "Destination not found" });
  }

  res.send({ acknowledged: result.acknowledged, modifiedCount: result.modifiedCount });
});

// Delete an existing destination
app.delete("/destination/:id", async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid destination ID" });
  }

  const result = await destinationsCollection.deleteOne({
    _id: new ObjectId(id),
  });

  if (!result.deletedCount) {
    return res.status(404).send({ message: "Destination not found" });
  }

  res.send({
    acknowledged: result.acknowledged,
    deletedCount: result.deletedCount,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
