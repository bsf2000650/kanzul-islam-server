import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, env.dbName ? { dbName: env.dbName } : {});
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
