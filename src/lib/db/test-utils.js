import mongoose from "mongoose";

const connectTestDB = async () => {
  // Mock de la connexion à la base de données
  await mongoose.connect("mongodb://localhost:27017/testdb");
};

const closeTestDB = async () => {
  await mongoose.disconnect();
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export { connectTestDB, closeTestDB, clearTestDB };
