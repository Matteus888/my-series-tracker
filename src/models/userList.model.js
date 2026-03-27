import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
    name: {
      type: String,
      required: [true, "List name is required."],
      trim: true,
      maxlength: [50, "List name must not exceed 50characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description must not exceed 200 characters."],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    series: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Series",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const list = mongoose.models.List || mongoose.model("List", listSchema);
