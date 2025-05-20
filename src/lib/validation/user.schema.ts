import { z } from "zod";

// Schéma pour création d'un utilisateur avec mot de passe
export const userRegistrationSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
  passwordHash: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  watchlist: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  favorites: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

// Schéma complet pour un utilisateur (avec hash)
export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
  passwordHash: z.string().optional(),
  watchlist: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  favorites: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

// Schéma pour la mise à jour partielle
export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  image: z.string().url().optional(),
  passwordHash: z.string().min(6).optional(),
  watchlist: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  favorites: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});
