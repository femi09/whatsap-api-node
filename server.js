import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import messages from "./routes/messages.js";
import connectDB from "./db.js";
import Pusher from "pusher";
import cors from "cors";
dotenv.config();
const app = express();

connectDB();

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected");

  const messageCollection = db.collection("messages");
  const changeStream = messageCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

// Pusher
const pusher = new Pusher({
  appId: "1119983",
  key: "36b75420a6daec5ddaa9",
  secret: "5735627f5d78406a7c04",
  cluster: "eu",
  useTLS: true,
});

app.use(express.json());
app.use(cors());
app.use("/api/v1/messages", messages);

const port = process.env.PORT || 9000;

app.listen(port, () => console.log(`listening on port ${port}`));
