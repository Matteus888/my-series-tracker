import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long."],
      maxlength: [30, "Username must not exceed 30 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please enter a valid email address.",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false, // Ne jamais retourner le mdp dans les requêtes
    },
    firstname: {
      type: String,
      trim: true,
      maxlength: [50, "Firstname must not exceed 50 characters."],
    },
    lastname: {
      type: String,
      trim: true,
      maxlength: [50, "Lastname must not exceed 50 characters."],
    },
    birthDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value <= new Date();
        },
        message: "Birth date cannot be in the future.",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", "prefer-not-to-say"],
        message: "Specified gender is invalid.",
      },
      default: "prefer-not-to-say",
    },
    profilePicture: {
      type: String, // URL de l'image
      default: "/account.svg", // Chemin vers une image par défaut
      validate: {
        validator: function (value) {
          return (
            validator.isURL(value, {
              protocols: ["http", "https"],
              require_protocol: true,
            }) || value === "/account.svg"
          );
        },
        message: "Profile picture URL is invalid.",
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [200, "Bio must not exceed 200 characters."],
    },
    trackedSeries: [
      {
        seriesId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Series",
          required: [true, "Serie ID is required."],
        },
        tmdbId: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: {
            values: ["watching", "completed", "on_hold", "dropped", "plan_to_watch"],
            message: "TSerie status is invalid.",
          },
          default: "plan_to_watch",
        },
        isFavorite: {
          type: Boolean,
          default: false,
        },
        rating: {
          type: Number,
          min: [1, "Minimum grade is 1."],
          max: [10, "Maximum grade is 10."],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastLogin: {
      type: Date,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Specified role is invalid.",
      },
      default: "user",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    publicLists: {
      type: Boolean,
      default: true,
    },
    publicActivity: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Comparaison des mdp
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
