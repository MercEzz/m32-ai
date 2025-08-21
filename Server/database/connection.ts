import mongoose from "mongoose";
import config from "../config";

const connectDB = async (): Promise<void> => {
  try {
    if (!config.mongoUri) {
      console.warn("⚠️ MONGO_URI not provided, skipping database connection");
      return;
    }

    const conn = await mongoose.connect(config.mongoUri, {});

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err: Error) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔄 MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;
