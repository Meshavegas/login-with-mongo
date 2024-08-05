import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;

export default async function dbConnect() {
  if (!mongoUri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env"
    );
  }

  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(mongoUri);
      console.log("🧺 MongoDB connected successfully");
    } catch (error) {
      console.error(error, "couldn't connect to MongoDB");
      process.exit(1);
    }
  } else {
    console.log("🧺 MongoDB already connected");
  }
}
