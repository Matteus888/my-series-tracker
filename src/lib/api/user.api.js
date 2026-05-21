import dbConnect from "@/lib/db/db.connect";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { EpisodeProgress } from "@/models/episodeProgress.model";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getUser = async (UserModel, userId, select = "") => {
  await dbConnect();
  const user = await UserModel.findById(userId).select(select);
  if (!user) throw new Error("User not found.");
  return user;
};

export const getUserProfile = async (UserModel, userId) => {
  return await getUser(UserModel, userId, "-password -trackedSeries");
};

export const updateUserAccount = async (UserModel, userId, { username, email }) => {
  await dbConnect();

  const existing = await UserModel.findOne({
    $or: [{ username }, { email }],
    _id: { $ne: userId },
  });
  if (existing) throw new Error("Username or email already taken.");

  await UserModel.findByIdAndUpdate(userId, { $set: { username, email } }, { runValidators: true });
};

export const updateUserPassword = async (UserModel, userId, { currentPassword, newPassword }) => {
  await dbConnect();
  const user = await UserModel.findById(userId).select("+password");
  if (!user) throw new Error("User not found.");

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new Error("Current password is incorrect.");

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await UserModel.findByIdAndUpdate(userId, { $set: { password: hashedPassword } });
};

export const updateUserProfile = async (UserModel, userId, { firstname, lastname, birthDate, gender, bio }) => {
  await dbConnect();
  await UserModel.findByIdAndUpdate(
    userId,
    { $set: { firstname, lastname, birthDate, gender, bio } },
    { runValidators: true },
  );
};

export const updateUserPrivacy = async (UserModel, userId, { isPublic, publicLists, publicActivity }) => {
  await dbConnect();
  await UserModel.findByIdAndUpdate(
    userId,
    { $set: { isPublic, publicLists, publicActivity } },
    { runValidators: true },
  );
};

export const uploadAvatar = async (UserModel, userId, buffer) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "my-serie-tracker-users-avatars",
          public_id: `user_${userId}`,
          overwrite: true,
          transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(buffer);
  });
  await UserModel.findByIdAndUpdate(userId, {
    $set: { profilePicture: result.secure_url },
  });
  return result.secure_url;
};

export const updateAvatarUrl = async (UserModel, userId, url) => {
  await dbConnect();

  const result = await cloudinary.uploader.upload(url, {
    folder: "my-serie-tracker-users-avatars",
    public_id: `user_${userId}`,
    overwrite: true,
    transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
  });

  await UserModel.findByIdAndUpdate(userId, {
    $set: { profilePicture: url },
  });

  return result.secure_url;
};

export const deleteUser = async (UserModel, UserListModel, EpisodeProgressModel, userId) => {
  await dbConnect();
  await EpisodeProgressModel.deleteMany({ userId });
  await UserListModel.deleteMany({ userId });
  await UserModel.findByIdAndDelete(userId);
};

export const getUserStats = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId).select("trackedSeries").lean();
  if (!user) throw new Error("User not found.");

  const seriesTracked = user.trackedSeries.length;
  const favorites = user.trackedSeries.filter((s) => s.isFavorite).length;
  const completed = user.trackedSeries.filter((s) => s.status === "completed").length;
  const planToWatch = user.trackedSeries.filter((s) => s.status === "plan_to_watch").length;

  const agg = await EpisodeProgress.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), watched: true } },
    {
      $lookup: {
        from: "episodes",
        localField: "episodeId",
        foreignField: "_id",
        as: "episode",
      },
    },
    { $unwind: "$episode" },
    {
      $group: {
        _id: null,
        episodesWatched: { $sum: 1 },
        totalMinutes: { $sum: { $ifNull: ["$episode.duration", 0] } },
      },
    },
  ]);

  const { episodesWatched = 0, totalMinutes = 0 } = agg[0] ?? {};

  return {
    seriesTracked,
    favorites,
    completed,
    planToWatch,
    episodesWatched,
    totalMinutes,
  };
};

/**
 * Récupère le profil public d'un user par son username.
 * Retourne les champs publics + les flags de privacy.
 * Throw "User not found" si pas trouvé.
 * Throw "Private profile" si isPublic=false et viewer != owner.
 */
export const getUserPublicProfile = async (UserModel, username, viewerUserId = null) => {
  await dbConnect();

  const user = await UserModel.findOne({ username })
    .select(
      "username firstname lastname profilePicture bio birthDate gender isPublic publicLists publicActivity createdAt",
    )
    .lean();

  if (!user) throw new Error("User not found.");

  const isOwner = viewerUserId && user._id.toString() === viewerUserId.toString();

  if (!user.isPublic && !isOwner) {
    throw new Error("Private profile.");
  }

  return {
    _id: user._id.toString(),
    username: user.username,
    firstname: user.firstname ?? null,
    lastname: user.lastname ?? null,
    profilePicture: user.profilePicture ?? null,
    bio: user.bio ?? null,
    birthDate: user.birthDate ? user.birthDate.toISOString() : null,
    gender: user.gender ?? null,
    isPublic: user.isPublic ?? false,
    publicLists: user.publicLists ?? false,
    publicActivity: user.publicActivity ?? false,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    isOwner,
  };
};

/**
 * Calcule les agrégations stats visuelles d'un user :
 * - top genres (avec count)
 * - top networks (avec count + logoPath)
 * - décennies (avec count)
 * - heatmap : map { "YYYY-MM-DD": episodeCount } sur les 365 derniers jours
 */
export const getUserProfileAggregations = async (UserModel, userId) => {
  await dbConnect();

  const user = await UserModel.findById(userId)
    .select("trackedSeries")
    .populate({
      path: "trackedSeries.seriesId",
      model: "Series",
      select: "genres networks firstAirDate",
    })
    .lean();

  if (!user) throw new Error("User not found.");

  // ─── Genres ───
  const genreCount = new Map();
  for (const t of user.trackedSeries) {
    const genres = t.seriesId?.genres ?? [];
    for (const g of genres) {
      genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
    }
  }
  const topGenres = [...genreCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ─── Networks ───
  const networkMap = new Map(); // id → { id, name, logoPath, count }
  for (const t of user.trackedSeries) {
    const networks = t.seriesId?.networks ?? [];
    for (const n of networks) {
      if (!n.id) continue;
      const existing = networkMap.get(n.id);
      if (existing) {
        existing.count += 1;
      } else {
        networkMap.set(n.id, {
          id: n.id,
          name: n.name,
          logoPath: n.logoPath ?? null,
          count: 1,
        });
      }
    }
  }
  const topNetworks = [...networkMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  // ─── Décennies ───
  const decadeCount = new Map();
  for (const t of user.trackedSeries) {
    const firstAir = t.seriesId?.firstAirDate;
    if (!firstAir) continue;
    const year = new Date(firstAir).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    decadeCount.set(decade, (decadeCount.get(decade) ?? 0) + 1);
  }
  const decades = [...decadeCount.entries()]
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => a.decade - b.decade);

  // ─── Heatmap (365 derniers jours) ───
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const progressList = await EpisodeProgress.find({
    userId,
    watched: true,
    watchedAt: { $gte: oneYearAgo },
  })
    .select("watchedAt")
    .lean();

  const heatmap = {};
  for (const p of progressList) {
    if (!p.watchedAt) continue;
    const key = p.watchedAt.toISOString().slice(0, 10);
    heatmap[key] = (heatmap[key] ?? 0) + 1;
  }

  return { topGenres, topNetworks, decades, heatmap };
};
