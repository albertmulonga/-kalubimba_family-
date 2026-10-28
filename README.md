# Kalubimba Family — Application Web

Application numérique de la famille Kalubimba : arbre généalogique, membres, photos, vidéos, histoires et messagerie.

## 🚀 Technologies

- **Next.js 15** (App Router, Server Components)
- **React 19**
- **TypeScript**
- **PostgreSQL** (Neon / Vercel Postgres)
- **Vercel Blob** (stockage photos et vidéos)
- **JWT** (sessions sécurisées via `jose`)

## ✅ Fonctionnalités

- 🔐 Authentification sécurisée (email ou matricule)
- 👨‍👩‍👧‍👦 Gestion des membres de la famille
- 🌳 Arbre généalogique interactif (règle patrilinéaire Kalubimba)
- 📸 Album photos & galerie vidéos
- 💬 Chat familial (messages privés + groupe)
- 🕯️ Mémorial (membres décédés)
- 📖 Histoire de la famille
- 📋 Comptes rendus de réunion
- 🏆 Section ancêtres
- 📊 Tableau de bord avec statistiques
- 📱 Responsive (mobile, tablette, desktop)
- 🛡️ Administration des utilisateurs

## 🛠️ Installation locale

### Prérequis
- Node.js 18+
- PostgreSQL 14+ (ou compte Neon gratuit)

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env.local
```
Éditer `.env.local` :
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kalubimba_family
DATABASE_SSL=false
AUTH_SECRET=une-chaine-aleatoire-longue
ADMIN_EMAIL=adminkalubimba@gmail.com
```

### 3. Créer la base de données
```bash
npm run db:setup
```

### 4. Lancer en développement
```bash
npm run dev
```
Ouvrir : **http://localhost:3000**

## 🌐 Hébergement sur Vercel (gratuit)

### Variables d'environnement requises sur Vercel :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL Neon (avec `?sslmode=require`) |
| `DATABASE_SSL` | `true` |
| `AUTH_SECRET` | Chaîne aléatoire forte (32+ caractères) |
| `ADMIN_EMAIL` | Email de l'administrateur |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob (pour photos/vidéos) |

### Schéma de base de données
Exécuter dans l'éditeur SQL de Neon :
1. `database/postgres/01_schema.sql`
2. `database/postgres/02_data.sql`

## 👤 Compte administrateur

- **Email :** adminkalubimba@gmail.com
- **Mot de passe :** kalubimba1234

## 📁 Structure du projet

```
src/
├── app/                  # Pages Next.js (App Router)
│   ├── (app)/            # Pages authentifiées
│   ├── (auth)/           # Login / Register
│   └── api/              # Routes API (appels audio/vidéo)
├── components/           # Composants React
└── lib/                  # Logique métier, DB, auth, actions
database/
└── postgres/             # Schéma SQL et données initiales
public/                   # Assets statiques
```

## 📄 Licence

Projet privé — Famille Kalubimba © 2026
