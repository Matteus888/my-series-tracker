import { dbConnect } from "../db/db.connect";

export const getSeriesFromDb = async () => {
  await dbConnect();
  // Logique pour récupérer les séries depuis bdd
};
