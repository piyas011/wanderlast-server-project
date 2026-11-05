import express from "express";
import { MongoClient } from "mongodb";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

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

const connectedClient = connectToMongoDB();

app.get("/", (req, res) => {
  res.send({ message: "Server is Running on Port 5000" });
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
