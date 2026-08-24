# 📺 My Series Tracker

> Un tracker de séries TV personnel, pensé comme un dashboard complet : suivi en cours, calendrier de sortie, historique, favoris et listes personnalisées — avec une identité visuelle sombre et dense, clin d'œil à l'ancienne version de **Trakt**.

Projet perso à but éducatif, déployé sur Vercel.

🔗 **Démo en ligne :** [my-series-tracker-snowy.vercel.app](https://my-series-tracker-snowy.vercel.app/)

---

## ✨ Fonctionnalités

- **Dashboard** — vue d'ensemble : suite en cours, prochaines diffusions, suggestions, reprise de visionnage
- **Continue Watching** — carrousel des séries en cours avec le prochain épisode à cocher, badges _Premiere_ / _Finale_, barre de progression
- **Calendrier** — épisodes à venir groupés par jour, avec labels relatifs (_Today_, _Tomorrow_, _In X days_), regroupement par saison complète le cas échéant
- **Historique** — épisodes visionnés, groupés par jour, avec notation par épisode
- **Favoris & Listes** — marquer une série en favori, l'ajouter à des listes personnalisées (watchlist par défaut incluse)
- **Fiches série & personne** — détails TMDB enrichis (cast, créateurs, réseaux de diffusion, vidéos), filmographie complète pour les personnes, épisodes liés à un acteur/réalisateur
- **Notes agrégées** — TMDB, IMDB, Rotten Tomatoes, Metacritic et Trakt fusionnées en un score unique
- **Recherche live** — recherche instantanée avec scoring de pertinence (préfixe, sous-chaîne, mots dans l'ordre…)
- **Authentification** — comptes utilisateurs avec sessions, avatar (upload ou URL) via Cloudinary
- **Thème sombre** — variables CSS globales, cartes denses, popovers contextuels, inspiré de l'ancien Trakt

---

## 🛠️ Stack technique

| Domaine               | Techno                                                                         |
| --------------------- | ------------------------------------------------------------------------------ |
| Framework             | [Next.js](https://nextjs.org) (App Router)                                     |
| UI                    | React 19, CSS Modules, thème dark custom                                       |
| Base de données       | MongoDB + [Mongoose](https://mongoosejs.com)                                   |
| Authentification      | [NextAuth](https://next-auth.js.org) (CredentialsProvider)                     |
| Médias                | [Cloudinary](https://cloudinary.com) (avatars)                                 |
| Données séries        | [TMDB API](https://www.themoviedb.org/documentation/api)                       |
| Notes complémentaires | [OMDB API](https://www.omdbapi.com), [Trakt API](https://trakt.docs.apiary.io) |
| Tests                 | Jest, Testing Library, mongodb-memory-server                                   |
| Déploiement           | [Vercel](https://vercel.com)                                                   |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/                 # Routes HTTP légères (session + parsing + appel à lib/api)
│   ├── (pages)/              # dashboard, watching, history, calendar, lists,
│   │                          # series/[id], search, series, favorites, settings...
│   └── ...
├── components/
│   ├── ui/                   # Composants génériques (SectionHeader, EpisodeCard, ProgressCard...)
│   ├── series/                # SerieCard, SeriePresentation, EpisodeList...
│   ├── person/                 # PersonPresentation, PersonCreditCarousel...
│   ├── dashboard/               # ContinueWatchingSection, WatchedEpisodeCard...
│   └── layout/                   # Header, Footer, Providers
├── context/
│   ├── TrackedSeriesContext.jsx  # séries suivies, favoris, progression
│   ├── ListContext.jsx            # listes personnalisées / watchlist
│   ├── SearchContext.jsx           # état de la recherche live
│   └── ToastContext.jsx             # notifications
├── hooks/                             # useContinueWatching, useCalendar, useEpisodeList...
├── lib/
│   ├── api/                            # logique métier (series.api.js, episode.api.js,
│   │                                     tmdb.api.js, omdb.api.js, trakt.api.js, user.api.js)
│   ├── db/                              # db.connect.js, upsertEpisodes.js
│   ├── utils/                            # date, duration, pagination, ratings, search score...
│   └── constants/                         # app.constants.js, routes.constants.js
├── models/                                 # User, Series, Episode, EpisodeProgress, UserList
└── proxy.js                                 # middleware d'authentification/routes protégées
```

### Conventions clés

- **`app/api/`** ne fait jamais de logique métier ni de connexion DB : session → parsing → délégation à `lib/api/`.
- **`lib/api/`** appelle systématiquement `dbConnect()` en premier, puis contient toute la logique.
- Les modèles Mongoose (`Episode`, `EpisodeProgress`, `UserList`, `Series`) sont importés directement dans `lib/api/` ; `User` est passé en paramètre depuis la route.
- Les upserts d'épisodes se font par **clé naturelle** (`{ seriesId, seasonNumber, episodeNumber }`) plutôt que par ID externe TMDB, plus robuste face aux épisodes placeholders remplacés côté TMDB.

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- Une base MongoDB (Atlas ou locale)
- Des clés API : [TMDB](https://www.themoviedb.org/settings/api), [OMDB](https://www.omdbapi.com/apikey.aspx), [Trakt](https://trakt.tv/oauth/applications) (optionnel), un compte [Cloudinary](https://cloudinary.com)

### Étapes

```bash
git clone https://github.com/<votre-user>/my-series-tracker.git
cd my-series-tracker
npm install
```

Créer un fichier `.env.local` à la racine :

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_SECRET=une_chaine_aleatoire_secrete
NEXTAUTH_URL=http://localhost:3000

# TMDB
NEXT_PUBLIC_TMDB_API_KEY=...

# OMDB
OMDB_API_KEY=...

# Trakt (optionnel — utilisé pour compléter les notes)
TRAKT_CLIENT_ID=...

# Cloudinary (avatars)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Lancer le serveur de développement :

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts disponibles

| Commande             | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Lance le serveur de développement |
| `npm run build`      | Build de production               |
| `npm run start`      | Lance le build de production      |
| `npm run lint`       | Analyse ESLint                    |
| `npm run test`       | Lance la suite de tests Jest      |
| `npm run test:watch` | Tests en mode watch               |

---

## 🧪 Tests

Le projet utilise **Jest** + **Testing Library**, avec `mongodb-memory-server` pour simuler MongoDB en environnement de test et des mocks pour NextAuth, Mongoose et bcrypt (voir `jest.setup.js`).

```bash
npm run test
```

---

## 🗺️ Pages principales

| Route               | Description                                |
| ------------------- | ------------------------------------------ |
| `/`                 | Dashboard                                  |
| `/watching`         | Séries en cours                            |
| `/history`          | Historique de visionnage                   |
| `/calendar`         | Calendrier des épisodes à venir            |
| `/lists`            | Listes personnalisées                      |
| `/series/[id]`      | Détail d'une série                         |
| `/episode/[id]`     | Détail d'un épisode                        |
| `/person/[id]`      | Fiche d'une personne (acteur, créateur...) |
| `/search`           | Recherche                                  |
| `/series`           | Toutes les séries                          |
| `/favorites`        | Favoris                                    |
| `/settings`         | Paramètres du compte                       |
| `/login`            | Connexion au compte                        |
| `/signup`           | Inscription                                |
| `/users/[username]` | Profils utilisateur                        |

---

## 🎨 Design

- Thème sombre géré via variables CSS globales (`--background-primary`, `--foreground`, `--blue`, `--red`, `--green`, `--yellow`...)
- CSS Modules pour l'ensemble des composants
- Classes utilitaires globales réutilisables : `card`, `card-footer`, `btn`, `check`, `bookmark`, `watchlist`, `tooltip-wrapper`
- Cartes denses avec barres de progression, badges (_Premiere_, _Finale_, année), popovers de confirmation — dans l'esprit de l'ancienne interface Trakt

---

## 📌 Notes & limitations connues

- Un fallback silencieux existe si l'API Trakt répond en erreur (ex : clé expirée) — l'application reste fonctionnelle sans note Trakt dans ce cas.
- Le calendrier compare les dates à partir de minuit UTC pour inclure correctement les épisodes du jour.
- `progressMap` est indexé par `String(tmdbId)` : toujours convertir en string lors des lookups.

---

## ☁️ Déploiement

L'application est déployée sur [Vercel](https://vercel.com) : **[my-series-tracker-snowy.vercel.app](https://my-series-tracker-snowy.vercel.app/)**

Les variables d'environnement listées ci-dessus doivent être configurées dans les paramètres du projet Vercel (Settings → Environment Variables).

---

## 📄 Licence

Projet personnel à but éducatif — non destiné à un usage commercial.
