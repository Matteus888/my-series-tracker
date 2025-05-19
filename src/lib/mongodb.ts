import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI n'est pas défini dans .env.local");
}

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalMongoose = global.mongoose as MongooseCache | undefined;

// Variable globale pour stocker la connexion en cache
// On évite de créer une nouvelle connection à chaque requête
let cached: MongooseCache;

if (!globalMongoose) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
} else {
  cached = globalMongoose;
}

// Fonction de connection
export async function connectToDB() {
  // Réutilisation de la connection active
  if (cached.conn) return cached.conn;

  // Sinon on en crée une
  if (!cached.promise) {
    const options = {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connecté");
  } catch (error) {
    cached.promise = null; // Réinitialisation de la promesse
    console.error("❌ Erreur de connexion MongoDB :", error);
    throw error; // On relance l'erreur pour que l'API réponde en erreur aussi
  }

  return cached.conn;
}
