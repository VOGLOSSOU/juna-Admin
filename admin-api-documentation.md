# Documentation API JUNA — Panel Admin

## Base URL

**Production :**
```
https://juna-app.up.railway.app/api/v1
```

**Local (développement) :**
```
http://localhost:5000/api/v1
```

---

## Conventions générales

Toutes les réponses ont la structure suivante :
```json
{
  "success": true | false,
  "message": "Message lisible" | ["Message 1", "Message 2"],
  "data": { ... },
  "error": { "code": "ERROR_CODE" }
}
```

- `data` est présent uniquement en cas de succès
- `error` est présent uniquement en cas d'échec
- `message` peut être un **tableau de strings** pour les erreurs de validation, ou une **string simple** pour les erreurs métier
- Les endpoints protégés nécessitent : `Authorization: Bearer {accessToken}`
- `accessToken` expire après **15 minutes**, `refreshToken` après **7 jours**
- Tous les endpoints `/admin/*` requièrent le rôle `ADMIN` ou `SUPER_ADMIN`

> ⚠️ **Gestion des erreurs** : Toujours lire `response.data.message`. Ne jamais afficher un message générique. Si c'est un tableau, afficher chaque item. Ces messages sont en français, directement destinés à être affichés.

---

## Table des routes

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/auth/login` | public | Connexion admin |
| `POST` | `/auth/refresh` | public | Rafraîchir le token |
| `POST` | `/auth/logout` | auth | Déconnexion |
| `GET` | `/admin/dashboard` | ADMIN | Statistiques globales |
| `GET` | `/countries` | public | Lister les pays |
| `POST` | `/admin/countries` | ADMIN | Créer un pays |
| `GET` | `/countries/:code/cities` | public | Villes d'un pays |
| `POST` | `/admin/cities` | ADMIN | Créer une ville |
| `GET` | `/cities/:cityId/landmarks` | public | Landmarks d'une ville |
| `POST` | `/admin/landmarks` | ADMIN | Créer un landmark |
| `GET` | `/admin/users` | ADMIN | Lister tous les utilisateurs (filtres disponibles) |
| `GET` | `/admin/users/:id` | ADMIN | Détail d'un utilisateur |
| `PUT` | `/admin/users/:id/suspend` | ADMIN | Suspendre un utilisateur |
| `PUT` | `/admin/users/:id/activate` | ADMIN | Réactiver un utilisateur |
| `GET` | `/admin/providers` | ADMIN | Lister tous les prestataires (filtres disponibles) |
| `GET` | `/admin/providers/pending` | ADMIN | Candidatures en attente |
| `GET` | `/admin/providers/:id` | ADMIN | Détail d'un prestataire |
| `PUT` | `/admin/providers/:id/approve` | ADMIN | Approuver un prestataire |
| `PUT` | `/admin/providers/:id/reject` | ADMIN | Rejeter un prestataire |
| `PUT` | `/admin/providers/:id/suspend` | ADMIN | Suspendre un prestataire |
| `GET` | `/orders` | ADMIN | Lister toutes les commandes (filtres disponibles) |
| `GET` | `/orders/pending/count` | ADMIN | Nombre de commandes en attente |
| `GET` | `/admin/subscriptions` | ADMIN | Lister tous les abonnements (tous statuts) |
| `GET` | `/subscriptions` | public | Lister les abonnements publics et actifs |

### Routes NON disponibles (ne pas appeler)

| Route | Statut |
|-------|--------|
| ~~`GET /admin/countries`~~ | 404 — utiliser `GET /countries` |
| ~~`GET /admin/cities`~~ | 404 — utiliser `GET /countries/:code/cities` |
| ~~`GET /admin/landmarks`~~ | 404 — utiliser `GET /cities/:cityId/landmarks` |
| ~~`GET /subscriptions`~~ (pour admin) | Filtre isPublic+isActive — utiliser `GET /admin/subscriptions` à la place |
| ~~`GET /admin/orders`~~ | 404 — utiliser `GET /orders` |

---

## 1. AUTHENTIFICATION ADMIN

### POST /auth/login — Connexion admin

**Body :**
```json
{
  "email": "admin@juna.app",
  "password": "MotDePasse123"
}
```

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "c4a518c6-db94-4c87-bec5-13e38b33cf1d",
      "email": "admin@juna.app",
      "name": "Admin Juna",
      "phone": "+22990000000",
      "role": "SUPER_ADMIN",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2026-04-09T19:00:00.000Z"
    },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>",
      "expiresIn": 900
    },
    "isProfileComplete": true
  }
}
```

> Stocker `accessToken` pour toutes les requêtes suivantes. Le rafraîchir avec `POST /auth/refresh` quand il expire (15 min).

**Réponses d'erreur :**
```json
{ "success": false, "message": "Email ou mot de passe incorrect", "error": { "code": "INVALID_CREDENTIALS" } }
{ "success": false, "message": "Compte suspendu ou banni", "error": { "code": "ACCOUNT_SUSPENDED" } }
```

---

### POST /auth/refresh — Rafraîchir le token

**Body :**
```json
{ "refreshToken": "<jwt>" }
```

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Token rafraîchi",
  "data": { "accessToken": "<jwt>" }
}
```

**Réponse 401 ❌ :**
```json
{ "success": false, "message": "Refresh token invalide ou expiré", "error": { "code": "INVALID_TOKEN" } }
```

---

### POST /auth/logout — Déconnexion

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "refreshToken": "<jwt>" }
```

**Réponse 200 ✅ :**
```json
{ "success": true, "message": "Déconnexion réussie" }
```

---

## 2. TABLEAU DE BORD

### GET /admin/dashboard — Statistiques globales

**Header :** `Authorization: Bearer <accessToken>`

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 42,
      "totalProviders": 7,
      "pendingProviders": 3,
      "totalOrders": 120,
      "completedOrders": 98,
      "pendingOrders": 5,
      "totalRevenue": 2450000
    },
    "charts": {
      "ordersByDay": [
        { "date": "2026-04-28", "count": 12 },
        { "date": "2026-04-29", "count": 18 },
        { "date": "2026-04-30", "count": 9 }
      ],
      "subscriptionsByCategory": [
        { "category": "AFRICAN", "count": 14 },
        { "category": "EUROPEAN", "count": 3 },
        { "category": "ASIAN", "count": 2 },
        { "category": "MIXED", "count": 5 }
      ]
    }
  }
}
```

- `totalRevenue` est en FCFA (somme des paiements SUCCESS)
- `ordersByDay` couvre les **7 derniers jours**
- `completedOrders` = commandes livrées/retirées (statut `COMPLETED`)
- `pendingOrders` = commandes non encore payées (statut `PENDING`)

---

## 3. GÉOGRAPHIE

### GET /countries — Lister les pays

**Accès :** public

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Liste des pays",
  "data": [
    {
      "id": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
      "code": "BJ",
      "translations": { "en": "Benin", "fr": "Bénin" },
      "isActive": true,
      "createdAt": "2026-04-09T10:32:03.536Z"
    }
  ]
}
```

---

### POST /admin/countries — Créer un pays

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{
  "code": "CI",
  "translations": {
    "fr": "Côte d'Ivoire",
    "en": "Ivory Coast"
  }
}
```

| Champ | Type | Obligatoire | Contraintes |
|-------|------|-------------|-------------|
| `code` | string | ✅ | Code ISO 2 lettres (ex: `BJ`, `CI`, `SN`) |
| `translations.fr` | string | ✅ | Nom en français |
| `translations.en` | string | ✅ | Nom en anglais |

**Réponse 201 ✅ :**
```json
{
  "success": true,
  "message": "Pays créé avec succès",
  "data": {
    "id": "uuid",
    "code": "CI",
    "translations": { "fr": "Côte d'Ivoire", "en": "Ivory Coast" },
    "isActive": true,
    "createdAt": "2026-05-01T10:00:00.000Z"
  }
}
```

**Erreurs possibles :**
| Code HTTP | Description |
|-----------|-------------|
| 409 | Ce code pays existe déjà |
| 400 | Champs manquants ou invalides |
| 401 | Token manquant ou expiré |
| 403 | Rôle insuffisant |

---

### GET /countries/:code/cities — Villes d'un pays

**Accès :** public

**Exemple :** `GET /countries/BJ/cities`

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Villes du pays",
  "data": [
    {
      "id": "228cb1e5-25e5-4d93-bdea-fa05f246bbac",
      "name": "Cotonou",
      "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
      "isActive": true,
      "createdAt": "2026-04-09T10:32:41.516Z"
    },
    {
      "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
      "name": "Lokossa",
      "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
      "isActive": true,
      "createdAt": "2026-04-09T10:33:10.000Z"
    }
  ]
}
```

---

### POST /admin/cities — Créer une ville

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{
  "name": "Abomey-Calavi",
  "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d"
}
```

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `name` | string | ✅ |
| `countryId` | UUID | ✅ — UUID du pays (obtenu via `GET /countries`) |

**Réponse 201 ✅ :**
```json
{
  "success": true,
  "message": "Ville créée avec succès",
  "data": {
    "id": "uuid",
    "name": "Abomey-Calavi",
    "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
    "isActive": true,
    "createdAt": "2026-05-01T10:00:00.000Z",
    "country": {
      "id": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
      "code": "BJ",
      "translations": { "en": "Benin", "fr": "Bénin" },
      "isActive": true
    }
  }
}
```

**Erreurs possibles :**
| Code HTTP | Description |
|-----------|-------------|
| 404 | Pays introuvable |
| 409 | Ville déjà existante dans ce pays |

---

### GET /cities/:cityId/landmarks — Landmarks d'une ville

**Accès :** public

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Landmarks de la ville",
  "data": [
    {
      "id": "f10505bb-2f0c-4da0-b529-d30f57f91eed",
      "name": "Campus IUT Lokossa",
      "cityId": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
      "isActive": true,
      "createdAt": "2026-04-09T10:35:00.000Z"
    }
  ]
}
```

---

### POST /admin/landmarks — Créer un landmark

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{
  "name": "Université d'Abomey-Calavi",
  "cityId": "228cb1e5-25e5-4d93-bdea-fa05f246bbac"
}
```

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `name` | string | ✅ |
| `cityId` | UUID | ✅ — UUID de la ville (obtenu via `GET /countries/:code/cities`) |

**Réponse 201 ✅ :**
```json
{
  "success": true,
  "message": "Lieu créé avec succès",
  "data": {
    "id": "uuid",
    "name": "Université d'Abomey-Calavi",
    "cityId": "228cb1e5-25e5-4d93-bdea-fa05f246bbac",
    "isActive": true,
    "createdAt": "2026-05-01T10:00:00.000Z",
    "city": {
      "id": "228cb1e5-25e5-4d93-bdea-fa05f246bbac",
      "name": "Cotonou",
      "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
      "isActive": true,
      "country": {
        "id": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
        "code": "BJ",
        "translations": { "en": "Benin", "fr": "Bénin" },
        "isActive": true
      }
    }
  }
}
```

**Erreurs possibles :**
| Code HTTP | Description |
|-----------|-------------|
| 404 | Ville introuvable |
| 409 | Landmark déjà existant dans cette ville |

---

## 4. UTILISATEURS

### GET /admin/users — Lister tous les utilisateurs

**Header :** `Authorization: Bearer <accessToken>`

**Query params disponibles :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `role` | enum | Filtrer par rôle : `USER`, `PROVIDER`, `ADMIN`, `SUPER_ADMIN` |
| `isActive` | boolean | `true` = actifs, `false` = suspendus |
| `search` | string | Recherche sur nom, email ou téléphone |

**Exemples :**
- `GET /admin/users` — tous les utilisateurs
- `GET /admin/users?role=PROVIDER` — uniquement les prestataires
- `GET /admin/users?isActive=false` — comptes suspendus
- `GET /admin/users?search=mariam` — recherche par nom/email/téléphone

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": [
    {
      "id": "4cc99927-3bfd-49b3-8664-3058f7ac3388",
      "email": "sena.akpovi@gmail.com",
      "name": "Sena Akpovi",
      "phone": "+22963333333",
      "role": "USER",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2026-04-09T10:45:00.000Z"
    },
    {
      "id": "16abf42e-95f5-404e-bc00-d201af404c84",
      "email": "mariam.diallo@gmail.com",
      "name": "Mariam Diallo",
      "phone": "+22962222222",
      "role": "PROVIDER",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2026-04-09T10:44:00.000Z"
    }
  ]
}
```

> Les résultats sont triés du plus récent au plus ancien.

---

### GET /admin/users/:id — Détail d'un utilisateur

**Header :** `Authorization: Bearer <accessToken>`

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": {
    "id": "4cc99927-3bfd-49b3-8664-3058f7ac3388",
    "email": "sena.akpovi@gmail.com",
    "name": "Sena Akpovi",
    "phone": "+22963333333",
    "role": "USER",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2026-04-09T10:45:00.000Z",
    "updatedAt": "2026-04-09T10:45:00.000Z"
  }
}
```

**Réponse 404 ❌ :**
```json
{ "success": false, "message": "Utilisateur introuvable", "error": { "code": "USER_NOT_FOUND" } }
```

---

### PUT /admin/users/:id/suspend — Suspendre un utilisateur

Passe `isActive` à `false`. L'utilisateur ne peut plus se connecter.

> Impossible de suspendre un admin ou super admin.

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "reason": "Comportement abusif signalé par plusieurs prestataires." }
```

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `reason` | string | ❌ — raison de la suspension (usage interne) |

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Utilisateur suspendu avec succès",
    "userId": "4cc99927-3bfd-49b3-8664-3058f7ac3388",
    "reason": "Comportement abusif signalé par plusieurs prestataires."
  }
}
```

**Erreurs possibles :**
```json
{ "success": false, "message": "Utilisateur introuvable", "error": { "code": "USER_NOT_FOUND" } }
{ "success": false, "message": "Impossible de suspendre un administrateur", "error": { "code": "FORBIDDEN" } }
```

---

### PUT /admin/users/:id/activate — Réactiver un utilisateur

Passe `isActive` à `true`. Permet à l'utilisateur de se reconnecter.

**Header :** `Authorization: Bearer <accessToken>`

**Body :** aucun

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Utilisateur réactivé avec succès",
    "userId": "4cc99927-3bfd-49b3-8664-3058f7ac3388"
  }
}
```

**Réponse 404 ❌ :**
```json
{ "success": false, "message": "Utilisateur introuvable", "error": { "code": "USER_NOT_FOUND" } }
```

---

## 5. PRESTATAIRES

### GET /admin/providers — Lister tous les prestataires

**Header :** `Authorization: Bearer <accessToken>`

**Query params disponibles :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `status` | enum | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `search` | string | Recherche sur le nom du business |

**Exemples :**
- `GET /admin/providers` — tous les prestataires
- `GET /admin/providers?status=APPROVED` — prestataires approuvés
- `GET /admin/providers?status=PENDING` — candidatures en attente (équivalent à `GET /admin/providers/pending`)
- `GET /admin/providers?search=chez` — recherche par nom

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Liste des fournisseurs",
  "data": [
    {
      "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
      "businessName": "Chez Mariam",
      "description": "Cuisine africaine authentique.",
      "businessAddress": "Rue du Port, Lokossa",
      "logo": "https://res.cloudinary.com/.../logo.jpg",
      "city": {
        "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
        "name": "Lokossa",
        "country": { "code": "BJ", "translations": { "fr": "Bénin", "en": "Benin" } }
      },
      "acceptsDelivery": true,
      "acceptsPickup": true,
      "deliveryZones": [
        { "city": "Cotonou", "cost": 500, "country": "BJ" }
      ],
      "landmarks": [],
      "documentUrl": null,
      "status": "APPROVED",
      "rating": 4.5,
      "totalReviews": 12,
      "createdAt": "2026-04-09T11:09:57.557Z"
    }
  ]
}
```

---

### GET /admin/providers/pending — Candidatures en attente

**Header :** `Authorization: Bearer <accessToken>`

> Raccourci pour `GET /admin/providers?status=PENDING`. Retourne le même format mais uniquement les `PENDING`.

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Fournisseurs en attente",
  "data": [
    {
      "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
      "businessName": "Chez Mariam",
      "description": "Cuisine africaine authentique, faite maison avec des produits frais du marché.",
      "businessAddress": "Rue du Port, Quartier Gbeto, face à la pharmacie centrale",
      "logo": "https://res.cloudinary.com/.../logo.jpg",
      "city": {
        "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
        "name": "Lokossa",
        "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
        "isActive": true,
        "country": {
          "id": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
          "code": "BJ",
          "translations": { "en": "Benin", "fr": "Bénin" },
          "isActive": true
        }
      },
      "acceptsDelivery": true,
      "acceptsPickup": true,
      "deliveryZones": [
        { "city": "Cotonou", "cost": 500, "country": "BJ" },
        { "city": "Abomey-Calavi", "cost": 800, "country": "BJ" }
      ],
      "landmarks": [
        {
          "providerId": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
          "landmarkId": "f10505bb-2f0c-4da0-b529-d30f57f91eed",
          "landmark": {
            "id": "f10505bb-2f0c-4da0-b529-d30f57f91eed",
            "name": "Campus IUT Lokossa",
            "cityId": "f48380b5-36d3-4dfe-8e11-0512eef18a9b"
          }
        }
      ],
      "documentUrl": null,
      "status": "PENDING",
      "rating": 0,
      "totalReviews": 0,
      "createdAt": "2026-04-09T11:09:57.557Z"
    }
  ]
}
```

---

### GET /admin/providers/:id — Détail d'un prestataire

**Header :** `Authorization: Bearer <accessToken>`

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": {
    "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
    "businessName": "Chez Mariam",
    "description": "Cuisine africaine authentique.",
    "businessAddress": "Rue du Port, Quartier Gbeto",
    "logo": "https://res.cloudinary.com/.../logo.jpg",
    "city": {
      "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
      "name": "Lokossa",
      "country": { "code": "BJ", "translations": { "fr": "Bénin", "en": "Benin" } }
    },
    "acceptsDelivery": true,
    "acceptsPickup": true,
    "deliveryZones": [
      { "city": "Cotonou", "cost": 500, "country": "BJ" }
    ],
    "landmarks": [
      {
        "landmark": {
          "id": "f10505bb-2f0c-4da0-b529-d30f57f91eed",
          "name": "Campus IUT Lokossa"
        }
      }
    ],
    "documentUrl": null,
    "status": "PENDING",
    "rating": 0,
    "totalReviews": 0,
    "createdAt": "2026-04-09T11:09:57.557Z",
    "user": {
      "id": "16abf42e-95f5-404e-bc00-d201af404c84",
      "email": "mariam.diallo@gmail.com",
      "name": "Mariam Diallo"
    }
  }
}
```

**Réponse 404 ❌ :**
```json
{ "success": false, "message": "Fournisseur introuvable", "error": { "code": "PROVIDER_NOT_FOUND" } }
```

---

### PUT /admin/providers/:id/approve — Approuver un prestataire

Le statut passe à `APPROVED`, le `role` de l'utilisateur passe à `PROVIDER`. Un email de confirmation est envoyé automatiquement au prestataire.

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "message": "Dossier complet, bienvenue sur Juna !" }
```

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `message` | string | ❌ — message interne optionnel |

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Fournisseur approuve avec succes",
  "data": {
    "success": true,
    "message": "Dossier complet, bienvenue sur Juna !",
    "provider": {
      "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
      "businessName": "Chez Mariam",
      "status": "APPROVED"
    }
  }
}
```

**Erreurs possibles :**
```json
{ "success": false, "message": "Fournisseur introuvable", "error": { "code": "PROVIDER_NOT_FOUND" } }
{ "success": false, "message": "Ce fournisseur a deja ete traite", "error": { "code": "PROVIDER_ALREADY_PROCESSED" } }
```

> `PROVIDER_ALREADY_PROCESSED` — le prestataire n'est plus en statut `PENDING` (déjà approuvé, rejeté ou suspendu).

---

### PUT /admin/providers/:id/reject — Rejeter un prestataire

Le statut passe à `REJECTED`. Un email est envoyé au prestataire avec la raison du rejet.

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "reason": "Documents d'identité manquants. Veuillez soumettre une pièce officielle valide." }
```

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `reason` | string | ✅ — affiché dans l'email envoyé au prestataire |

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Fournisseur rejete",
  "data": {
    "provider": {
      "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
      "businessName": "Chez Mariam",
      "status": "REJECTED",
      "rejectionReason": "Documents d'identité manquants."
    }
  }
}
```

**Erreurs possibles :**
```json
{ "success": false, "message": "Fournisseur introuvable", "error": { "code": "PROVIDER_NOT_FOUND" } }
{ "success": false, "message": "Ce fournisseur a deja ete traite", "error": { "code": "PROVIDER_ALREADY_PROCESSED" } }
{ "success": false, "message": ["La raison du rejet est requise"], "error": { "code": "INVALID_INPUT" } }
```

---

### PUT /admin/providers/:id/suspend — Suspendre un prestataire

Le statut passe à `SUSPENDED`. Le prestataire ne peut plus recevoir de commandes.

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "reason": "Signalements répétés sur la qualité des repas." }
```

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `reason` | string | ❌ — usage interne |

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Fournisseur suspendu avec succes",
  "data": {
    "success": true,
    "message": "Fournisseur suspendu"
  }
}
```

**Réponse 404 ❌ :**
```json
{ "success": false, "message": "Fournisseur introuvable", "error": { "code": "PROVIDER_NOT_FOUND" } }
```

---

## 6. COMMANDES

### GET /orders — Lister toutes les commandes (admin)

**Header :** `Authorization: Bearer <accessToken>`

**Query params disponibles :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `status` | enum | `PENDING`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `userId` | UUID | Filtrer par utilisateur |
| `providerId` | UUID | Filtrer par prestataire |
| `subscriptionId` | UUID | Filtrer par abonnement |
| `deliveryMethod` | enum | `DELIVERY` ou `PICKUP` |

**Exemples :**
- `GET /orders` — toutes les commandes
- `GET /orders?status=PENDING` — commandes non payées
- `GET /orders?status=CONFIRMED` — commandes payées en attente d'activation
- `GET /orders?providerId=uuid` — commandes d'un prestataire précis

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Commandes récupérées avec succès",
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": "JO-20260430-0001",
      "status": "CONFIRMED",
      "amount": 25000,
      "deliveryMethod": "PICKUP",
      "scheduledFor": "2026-05-01T07:00:00.000Z",
      "createdAt": "2026-04-30T14:22:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "Sena Akpovi",
        "email": "sena.akpovi@gmail.com"
      },
      "subscription": {
        "id": "sub-uuid",
        "name": "Formule Semaine Africaine",
        "provider": {
          "businessName": "Chez Mariam"
        }
      },
      "payment": {
        "status": "SUCCESS",
        "amount": 25000
      }
    }
  ]
}
```

**Statuts de commande :**
| Statut | Signification |
|--------|---------------|
| `PENDING` | Commande créée, paiement non encore effectué |
| `CONFIRMED` | Paiement reçu, en attente d'activation par le client |
| `ACTIVE` | Client a activé la commande, abonnement en cours |
| `COMPLETED` | Livraison/retrait effectué (QR scanné) |
| `CANCELLED` | Commande annulée |

---

### GET /orders/pending/count — Nombre de commandes en attente

**Header :** `Authorization: Bearer <accessToken>`

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": { "pendingCount": 8 }
}
```

> Utile pour afficher un badge sur le menu du panel (ex: "Commandes (8)").

---

## 7. ABONNEMENTS

### GET /admin/subscriptions — Tous les abonnements (admin)

**Header :** `Authorization: Bearer <accessToken>`

Retourne **tous** les abonnements sans filtre de visibilité — actifs, inactifs, publics, brouillons.

**Query params disponibles :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `cityId` | UUID | Filtrer par ville (UUID obtenu via `GET /countries/:code/cities`) |
| `providerId` | UUID | Filtrer par prestataire |
| `isActive` | boolean | `true` = actifs uniquement, `false` = désactivés uniquement |
| `isPublic` | boolean | `true` = publiés uniquement, `false` = brouillons uniquement |
| `type` | enum | `BREAKFAST`, `LUNCH`, `DINNER`, `FULL_DAY` |
| `category` | enum | `AFRICAN`, `EUROPEAN`, `ASIAN`, `MIXED` |
| `duration` | enum | `DAILY`, `WORK_WEEK`, `WEEK`, `MONTH` |
| `search` | string | Recherche sur le nom ou la description |

**Exemples :**
- `GET /admin/subscriptions` — tous les abonnements
- `GET /admin/subscriptions?cityId=f48380b5-36d3-4dfe-8e11-0512eef18a9b` — abonnements de Lokossa
- `GET /admin/subscriptions?isActive=false` — abonnements désactivés
- `GET /admin/subscriptions?isPublic=false` — brouillons non publiés
- `GET /admin/subscriptions?cityId=uuid&isActive=true` — abonnements actifs d'une ville

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Abonnements récupérés avec succès",
  "data": [
    {
      "id": "ce1ddb4f-bc45-4ac1-95c3-d8e012f6ca89",
      "name": "Formule Semaine Africaine",
      "description": "5 repas complets du lundi au vendredi.",
      "price": 25000,
      "type": "FULL_DAY",
      "category": "AFRICAN",
      "duration": "WORK_WEEK",
      "isActive": true,
      "isPublic": true,
      "subscriberCount": 8,
      "createdAt": "2026-04-09T11:30:00.000Z",
      "provider": {
        "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
        "businessName": "Chez Mariam",
        "city": {
          "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
          "name": "Lokossa",
          "country": { "code": "BJ", "translations": { "fr": "Bénin", "en": "Benin" } }
        }
      }
    },
    {
      "id": "ab2cde3f-0000-4ac1-95c3-d8e012f6ca89",
      "name": "Brunch du weekend",
      "description": "Formule petit-déjeuner copieux.",
      "price": 8000,
      "type": "BREAKFAST",
      "category": "MIXED",
      "duration": "DAILY",
      "isActive": false,
      "isPublic": false,
      "subscriberCount": 0,
      "createdAt": "2026-04-20T09:00:00.000Z",
      "provider": {
        "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
        "businessName": "Chez Mariam",
        "city": {
          "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
          "name": "Lokossa",
          "country": { "code": "BJ", "translations": { "fr": "Bénin", "en": "Benin" } }
        }
      }
    }
  ]
}
```

> **Flux recommandé pour la page Abonnements du panel :**
> 1. `GET /countries/BJ/cities` → alimenter le sélecteur de villes
> 2. L'admin sélectionne une ville → `GET /admin/subscriptions?cityId=<uuid>` → afficher tous les abonnements de cette ville avec leur statut (`isActive`, `isPublic`)

---

### GET /subscriptions — Abonnements publics (usage non-admin)

**Accès :** public — **ne pas utiliser pour le panel admin**, cette route filtre uniquement `isPublic: true` et `isActive: true`.

**Query params disponibles :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `city` | string | Filtrer par nom de ville |
| `landmarkId` | UUID | Filtrer par landmark |
| `type` | enum | `BREAKFAST`, `LUNCH`, `DINNER`, `FULL_DAY` |
| `category` | enum | `AFRICAN`, `EUROPEAN`, `ASIAN`, `MIXED` |
| `duration` | enum | `DAILY`, `WORK_WEEK`, `WEEK`, `MONTH` |
| `search` | string | Recherche textuelle sur le nom |

---

## Codes d'erreur globaux

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Token manquant ou expiré |
| `FORBIDDEN` | 403 | Rôle insuffisant (non ADMIN/SUPER_ADMIN) |
| `RESOURCE_NOT_FOUND` | 404 | Ressource introuvable (générique) |
| `USER_NOT_FOUND` | 404 | Utilisateur introuvable |
| `PROVIDER_NOT_FOUND` | 404 | Prestataire introuvable |
| `PROVIDER_ALREADY_PROCESSED` | 409 | Prestataire déjà approuvé/rejeté (plus en PENDING) |
| `INVALID_INPUT` | 400 | Corps de requête invalide ou champ manquant |
| `INVALID_CREDENTIALS` | 401 | Email ou mot de passe incorrect |
| `ACCOUNT_SUSPENDED` | 403 | Compte suspendu |

---

## Flux recommandés pour le panel

### Gestion des candidatures prestataires

1. `GET /admin/providers/pending` → afficher la liste avec badge de count
2. Clic sur un prestataire → `GET /admin/providers/:id` → fiche détaillée
3. Bouton "Approuver" → `PUT /admin/providers/:id/approve`
4. Bouton "Rejeter" → afficher un champ texte obligatoire → `PUT /admin/providers/:id/reject` avec `reason`
5. Après approbation/rejet : email automatiquement envoyé au prestataire

### Tableau de bord principal

1. `GET /admin/dashboard` → KPIs + graphiques
2. `GET /orders/pending/count` → badge sur le menu commandes
3. `GET /admin/providers/pending` → badge sur le menu candidatures (utiliser `data.length`)
