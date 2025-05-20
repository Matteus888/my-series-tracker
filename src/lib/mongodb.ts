import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI n'est pas défini dans .env.local");
}

// Type du cache qu'on va stocker dans la variable globale
// Il contient soit une connexion Mongoose, soit une promesse de connexion
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

// Récupération du cache s'il a été défini globalement
// Typescript ne sait pas à ce stade ce qu'est global.mongoose, donc on le "cast"
const globalMongoose = global.mongoose as MongooseCache | undefined;

// Variable globale pour stocker la connexion en cache
let cached: MongooseCache;

// Si aucun cache global n'existe, on l'initialise avec des valeurs nulles
if (!globalMongoose) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
} else {
  cached = globalMongoose;
}

// Fonction de connection principale
export async function connectToDB() {
  // Si une connexion déjà établie existe, on la renvoie directement
  if (cached.conn) return cached.conn;

  // Sinon, si une promesse de connexion est déjà en cours, on ne la relance pas
  if (!cached.promise) {
    const options = {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000,
    };

    // On initie la promesse de connexion et on la stocke dans le cache
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
