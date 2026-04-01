import dbConnect from "@/lib/db/db.connect";
import bcrypt from "bcryptjs";

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

export const deleteUser = async (UserModel, UserListModel, EpisodeProgressModel, userId) => {
  await dbConnect();
  await EpisodeProgressModel.deleteMany({ userId });
  await UserListModel.deleteMany({ userId });
  await UserModel.findByIdAndDelete(userId);
};
