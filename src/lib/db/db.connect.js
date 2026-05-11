import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV !== "test") {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 20, // pool plus large pour les rafales du dashboard
      minPoolSize: 5, // garde des connexions chaudes en permanence
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // force IPv4 (évite des hiccups DNS sur Windows)
    };

    if (process.env.NODE_ENV === "test") {
      cached.promise = Promise.resolve({
        connection: {
          collections: {},
        },
      });
    } else {
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    }
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
