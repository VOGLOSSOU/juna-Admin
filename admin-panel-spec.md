# Spécification — Panel Admin JUNA

## Stack technique

| Rôle | Choix | Raison |
|------|-------|--------|
| Framework | **Next.js 14** (App Router, TypeScript) | Stable, maintenable, SSR optionnel, routing natif |
| Styles | **Tailwind CSS** | Utility-first, cohérence facile à maintenir |
| Composants | **shadcn/ui** | Composants accessibles, non-opinionated, personnalisables |
| Icônes | **Lucide React** | Intégré à shadcn/ui, propre, professionnel, pas d'emojis |
| HTTP | **Axios** | Intercepteurs pour JWT refresh automatique |
| State | **React Context** (auth) + **useState/useEffect** | Pas de Redux — admin panel simple |
| Hébergement | **Vercel** | Déploiement Next.js natif, gratuit pour débuter |

> Aucun emoji dans l'interface — uniquement des icônes Lucide React.

---

## Identité visuelle

### Couleurs

| Rôle | Hex | Usage |
|------|-----|-------|
| Vert principal | `#1A5C2A` | Sidebar, headers, boutons primaires, badges actifs |
| Vert foncé | `#0F3D1A` | Fond sidebar, hover éléments actifs |
| Orange accent | `#F4521E` | Boutons CTA, prix, alertes importantes, badges critiques |
| Fond général | `#F7F7F7` | Background des pages |
| Surface | `#FFFFFF` | Cards, modals, tableaux |
| Texte principal | `#1A1A1A` | Titres, données importantes |
| Texte secondaire | `#6B6B6B` | Labels, sous-titres, métadonnées |
| Bordure | `#E5E5E5` | Séparateurs, contours de cards |
| Vert surface | `#EEF5F0` | Backgrounds badges verts, highlights |

### Typographie
Police principale : **Plus Jakarta Sans** (Google Fonts)

| Usage | Taille | Poids |
|-------|--------|-------|
| Titres de page | 24px | 700 |
| Titres de section | 18px | 600 |
| Labels tableau | 14px | 600 |
| Données tableau | 14px | 400 |
| Badges / chips | 12px | 600 |
| Texte secondaire | 13px | 400 |

### Composants visuels
- **Cards** — fond blanc, `border-radius: 12px`, `box-shadow: 0 1px 4px rgba(0,0,0,0.06)`
- **Bouton primaire** — fond `#1A5C2A`, texte blanc, `border-radius: 8px`
- **Bouton danger** — fond `#F4521E`, texte blanc
- **Sidebar** — fond `#0F3D1A`, texte blanc 60% opacité, item actif fond `#1A5C2A` texte blanc 100%
- **Header** — fond blanc, ombre fine
- **Transitions** — subtiles, 200ms max — pas d'animations lourdes
- **Pas de dark mode**

### Logos
- Sidebar (fond vert foncé) : `logo_white_orange.png`
- Header et page Login (fond blanc) : `logo_green_orange.png`

---

## Structure visuelle

```
┌─────────────────┬──────────────────────────────────────┐
│                 │  Header fixe (blanc, ombre fine)      │
│  Sidebar        ├──────────────────────────────────────┤
│  (#0F3D1A)      │                                      │
│                 │   Contenu (fond #F7F7F7)             │
│  logo +         │   Cards blanches avec ombre légère   │
│  navigation     │                                      │
└─────────────────┴──────────────────────────────────────┘
```

---

## Base URL API
```
https://juna-app.up.railway.app/api/v1
```

---

## Flux général

### 1. Accès et connexion
L'admin ouvre le panel → il arrive directement sur la page **Login**.
- Email : `admin@juna.app`
- Mot de passe : défini en base
- Le compte admin est déjà créé en base — pas de création de compte depuis le panel
- À la connexion réussie, le `accessToken` est stocké et l'admin est redirigé vers le **Dashboard**

### 2. Structure globale de l'interface
Après connexion, l'interface se compose de deux zones :

```
┌─────────────────────────────────────────────────────┐
│  HEADER — Logo JUNA | Nom admin | Bouton Déconnexion │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   SIDEBAR    │         CONTENU PRINCIPAL            │
│   (gauche)   │         (zone principale)            │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

---

## Sidebar — Menu de navigation

Menu vertical sur la gauche, icônes Lucide React + labels. Sections :

```
LayoutDashboard     Dashboard
─────────────────────────────
Globe               Géographie
    ├──             Pays
    ├──             Villes
    └──             Landmarks
─────────────────────────────
Store               Fournisseurs
    ├──             Liste des fournisseurs
    └──             Demandes en attente
─────────────────────────────
Package             Abonnements
─────────────────────────────
Users               Utilisateurs
─────────────────────────────
ClipboardList       Commandes
```

---

## Pages — Version initiale

### Page 1 — Login (`/login`)
- Formulaire : Email + Mot de passe
- Bouton "Se connecter"
- En cas d'erreur : message rouge sous le formulaire
- En cas de succès : redirection vers `/dashboard`

---

### Page 2 — Dashboard (`/dashboard`)
Vue d'ensemble rapide. Cartes de statistiques :
- Nombre total de pays / villes / landmarks
- Nombre de fournisseurs (total, approuvés, en attente)
- Nombre d'utilisateurs inscrits
- Nombre d'abonnements actifs
- Nombre de commandes (total, pending, confirmées)

> Ces chiffres viennent des routes GET existantes — on compte les items retournés.

---

### Page 3 — Pays (`/geography/countries`)

**Liste des pays**
- Tableau : Code | Nom FR | Nom EN | Statut | Actions
- Bouton **"+ Ajouter un pays"** → ouvre un formulaire (modal ou page dédiée)

**Formulaire — Ajouter un pays**
- Champ : Code pays (ex: `BJ`)
- Champ : Nom en français
- Champ : Nom en anglais
- Bouton Enregistrer → `POST /admin/countries`

---

### Page 4 — Villes (`/geography/cities`)

**Liste des villes**
- Filtre par pays (dropdown)
- Tableau : Nom | Pays | Statut | Actions

**Formulaire — Ajouter une ville**
- Sélecteur : Pays (liste déroulante des pays existants)
- Champ : Nom de la ville
- Bouton Enregistrer → `POST /admin/cities`

---

### Page 5 — Landmarks (`/geography/landmarks`)

**Liste des landmarks**
- Filtre par ville (dropdown)
- Tableau : Nom | Ville | Pays | Actions

**Formulaire — Ajouter un landmark**
- Sélecteur : Ville (liste déroulante)
- Champ : Nom du landmark (ex: Campus IUT Lokossa)
- Bouton Enregistrer → `POST /admin/landmarks`

---

### Page 6 — Fournisseurs (`/providers`)

**Liste de tous les fournisseurs**
- Tableau : Nom | Ville | Statut (PENDING / APPROVED / REJECTED) | Date | Actions
- Filtres : par statut
- Clic sur un fournisseur → page détail

**Page détail fournisseur (`/providers/:id`)**
- Infos complètes : nom, adresse, ville, téléphone, logo, zones de livraison, landmarks
- Bouton **"Approuver"** → `PATCH /admin/providers/:id/approve`
- Bouton **"Rejeter"** → `PATCH /admin/providers/:id/reject`

**Onglet "Demandes en attente" (`/providers/pending`)**
- Même tableau filtré sur `status = PENDING`
- Permet d'agir rapidement sans chercher dans toute la liste

---

### Page 7 — Utilisateurs (`/users`)

**Liste des utilisateurs**
- Tableau : Nom | Email | Rôle | Statut | Date inscription
- Filtres : par rôle (USER / PROVIDER / ADMIN)
- Pas d'actions pour l'instant (lecture seule)

---

### Page 8 — Abonnements (`/subscriptions`)

**Liste de tous les abonnements**
- Tableau : Nom | Provider | Prix | Type | Catégorie | Statut (actif/inactif)
- Lecture seule pour l'admin (les providers gèrent leurs propres abonnements)

---

### Page 9 — Commandes (`/orders`)

**Liste de toutes les commandes**
- Tableau : ID | Client | Provider | Abonnement | Statut | Date | Montant
- Filtres : par statut (PENDING / CONFIRMED / READY / DELIVERED / CANCELLED)
- Lecture seule pour l'admin dans un premier temps

---

## Gestion des tokens

- À la connexion : stocker `accessToken` et `refreshToken`
- Toutes les requêtes admin incluent `Authorization: Bearer {accessToken}`
- Si une requête retourne `401` : tenter un refresh via `POST /auth/refresh`
- Si le refresh échoue : rediriger vers `/login`

---

## Ordre de développement recommandé

1. **Login** + gestion des tokens
2. **Layout** (sidebar + header) avec navigation
3. **Géographie** (pays → villes → landmarks) — priorité absolue pour démarrer
4. **Fournisseurs** (liste + approbation) — indispensable pour la mise en prod
5. **Dashboard** (statistiques)
6. **Utilisateurs** et **Commandes** (lecture seule dans un premier temps)

---

## Notes importantes

- Le panel admin n'est pas public — pas besoin d'inscription, l'admin existe déjà en base
- Toutes les routes admin nécessitent le rôle `ADMIN` ou `SUPER_ADMIN` côté API
- Les images (logo provider) sont gérées par Cloudinary via l'API — pas besoin de gérer l'upload côté panel dans un premier temps
- Le panel peut être hébergé séparément sur Vercel ou Railway (service statique)
