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

## Conventions générales

- Tous les endpoints retournent un JSON avec la structure suivante :
```json
{
  "success": true | false,
  "message": "Message lisible",
  "data": { ... }
  "error": { "code": "ERROR_CODE" }
}
```
- Les endpoints protégés nécessitent : `Authorization: Bearer {accessToken}`
- Les tokens expirent : `accessToken` → 15 minutes, `refreshToken` → 7 jours
- Tous les endpoints `/admin/*` requièrent le rôle `ADMIN` ou `SUPER_ADMIN`

## Toutes les routes disponibles pour le panel

### Routes disponibles maintenant

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
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
| `GET` | `/admin/users` | ADMIN | Lister tous les utilisateurs |
| `GET` | `/admin/providers` | ADMIN | Lister tous les fournisseurs |
| `GET` | `/admin/providers/pending` | ADMIN | Candidatures en attente |
| `GET` | `/admin/providers/:id` | ADMIN | Détails d'un fournisseur |
| `PUT` | `/admin/providers/:id/approve` | ADMIN | Approuver un fournisseur |
| `PUT` | `/admin/providers/:id/reject` | ADMIN | Rejeter un fournisseur |
| `GET` | `/subscriptions` | public | Lister tous les abonnements |

### Routes NON disponibles (à ne pas appeler)

| Route appelée par erreur | Statut | Route correcte à utiliser |
|--------------------------|--------|--------------------------|
| ~~`GET /admin/countries`~~ | 404 | `GET /countries` |
| ~~`GET /admin/cities`~~ | 404 | `GET /countries/:code/cities` |
| ~~`GET /admin/landmarks`~~ | 404 | `GET /cities/:cityId/landmarks` |
| ~~`GET /admin/subscriptions`~~ | 404 | `GET /subscriptions` |
| ~~`GET /admin/orders`~~ | 404 | non implémentée — ne pas appeler |

---

## 1. AUTHENTIFICATION ADMIN

### POST /auth/login — Connexion admin

**Body :**
```json
{
  "email": "admin@juna.app",
  "password": "ChangeMe123!"
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
      "createdAt": "2026-04-09T19:00:00.000Z",
      "updatedAt": "2026-04-09T19:00:00.000Z"
    },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    },
    "isProfileComplete": true
  }
}
```

> Les tokens sont imbriqués sous `tokens`. Stocker `accessToken` pour les requêtes suivantes.

**Réponse 401 ❌ — Mauvais mot de passe :**
```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect",
  "error": { "code": "INVALID_CREDENTIALS" }
}
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

---

### POST /auth/logout — Déconnexion

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "refreshToken": "<jwt>" }
```

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
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
      "totalUsers": 4,
      "totalProviders": 1,
      "pendingProviders": 0,
      "totalOrders": 0,
      "completedOrders": 0,
      "pendingOrders": 0,
      "totalRevenue": 0
    },
    "charts": {
      "ordersByDay": [],
      "subscriptionsByCategory": []
    }
  }
}
```

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
  "code": "BJ",
  "translations": {
    "fr": "Bénin",
    "en": "Benin"
  }
}
```

**Réponse 201 ✅ :**
```json
{
  "success": true,
  "message": "Pays créé avec succès",
  "data": {
    "id": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
    "code": "BJ",
    "translations": { "fr": "Bénin", "en": "Benin" },
    "isActive": true,
    "createdAt": "2026-04-09T10:32:03.536Z"
  }
}
```

**Erreurs possibles :**
| Code | HTTP | Description |
|------|------|-------------|
| `EMAIL_ALREADY_EXISTS` | 409 | Ce code pays existe déjà |
| `VALIDATION_ERROR` | 400 | Champs manquants ou invalides |
| `UNAUTHORIZED` | 401 | Token manquant ou expiré |
| `FORBIDDEN` | 403 | Rôle insuffisant |

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
  "name": "Lokossa",
  "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d"
}
```

**Réponse 201 ✅ :**
```json
{
  "success": true,
  "message": "Ville créée avec succès",
  "data": {
    "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
    "name": "Lokossa",
    "countryId": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
    "isActive": true,
    "createdAt": "2026-04-09T10:33:10.000Z",
    "country": {
      "id": "6bf5d9ac-08a8-4774-b6e8-b08af709349d",
      "code": "BJ",
      "translations": { "en": "Benin", "fr": "Bénin" },
      "isActive": true,
      "createdAt": "2026-04-09T10:32:03.536Z"
    }
  }
}
```

**Erreurs possibles :**
| Code | HTTP | Description |
|------|------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Pays introuvable |
| `EMAIL_ALREADY_EXISTS` | 409 | Ville déjà existante dans ce pays |

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
  "name": "Campus IUT Lokossa",
  "cityId": "f48380b5-36d3-4dfe-8e11-0512eef18a9b"
}
```

**Réponse 201 ✅ :**
```json
{
  "success": true,
  "message": "Lieu créé avec succès",
  "data": {
    "id": "f10505bb-2f0c-4da0-b529-d30f57f91eed",
    "name": "Campus IUT Lokossa",
    "cityId": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
    "isActive": true,
    "createdAt": "2026-04-09T10:35:00.000Z",
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
    }
  }
}
```

**Erreurs possibles :**
| Code | HTTP | Description |
|------|------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Ville introuvable |
| `EMAIL_ALREADY_EXISTS` | 409 | Landmark déjà existant dans cette ville |

---

## 4. UTILISATEURS

### GET /admin/users — Lister tous les utilisateurs

**Header :** `Authorization: Bearer <accessToken>`

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
      "isVerified": false,
      "isActive": true,
      "createdAt": "2026-04-09T10:45:00.000Z"
    },
    {
      "id": "16abf42e-95f5-404e-bc00-d201af404c84",
      "email": "mariam.diallo@gmail.com",
      "name": "Mariam Diallo",
      "phone": "+22962222222",
      "role": "PROVIDER",
      "isVerified": false,
      "isActive": true,
      "createdAt": "2026-04-09T10:44:00.000Z"
    },
    {
      "id": "c4a518c6-db94-4c87-bec5-13e38b33cf1d",
      "email": "admin@juna.app",
      "name": "Admin Juna",
      "phone": "+22990000000",
      "role": "SUPER_ADMIN",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2026-04-09T19:00:00.000Z"
    }
  ]
}
```

---

## 5. FOURNISSEURS

### GET /admin/providers — Lister tous les fournisseurs

**Header :** `Authorization: Bearer <accessToken>`

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": [
    {
      "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
      "businessName": "Chez Mariam",
      "status": "APPROVED",
      "city": { "name": "Lokossa", "country": { "code": "BJ" } },
      "rating": 0,
      "totalReviews": 0,
      "createdAt": "2026-04-09T11:09:57.557Z"
    }
  ]
}
```

---

### GET /admin/providers/pending — Candidatures en attente

**Header :** `Authorization: Bearer <accessToken>`

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
      "logo": "https://res.cloudinary.com/dm9561wpm/image/upload/v1775732528/juna/providers/vcmcewqrpownranlzody.jp",
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
        { "city": "Abomey-Calavi", "cost": 800, "country": "BJ" },
        { "city": "Ouidah", "cost": 1500, "country": "BJ" }
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

### GET /admin/providers/:id — Détails d'un fournisseur

**Header :** `Authorization: Bearer <accessToken>`

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "data": {
    "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
    "businessName": "Chez Mariam",
    "description": "Cuisine africaine authentique, faite maison avec des produits frais du marché.",
    "businessAddress": "Rue du Port, Quartier Gbeto, face à la pharmacie centrale",
    "logo": "https://res.cloudinary.com/dm9561wpm/image/upload/v1775732528/juna/providers/vcmcewqrpownranlzody.jp",
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
      { "city": "Abomey-Calavi", "cost": 800, "country": "BJ" },
      { "city": "Ouidah", "cost": 1500, "country": "BJ" }
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
    "createdAt": "2026-04-09T11:09:57.557Z",
    "user": {
      "id": "16abf42e-95f5-404e-bc00-d201af404c84",
      "email": "mariam.diallo@gmail.com",
      "name": "Mariam Diallo"
    }
  }
}
```

**Erreurs possibles :**
| Code | HTTP | Description |
|------|------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Provider introuvable |

---

### PUT /admin/providers/:id/approve — Approuver un fournisseur

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "message": "Dossier complet, bienvenue sur Juna !" }
```

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

---

### PUT /admin/providers/:id/reject — Rejeter un fournisseur

**Header :** `Authorization: Bearer <accessToken>`

**Body :**
```json
{ "message": "Dossier incomplet, veuillez soumettre vos documents." }
```

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Fournisseur rejeté avec succès",
  "data": {
    "provider": {
      "id": "<uuid>",
      "businessName": "Chez Mariam",
      "status": "REJECTED"
    }
  }
}
```

---

## 6. ABONNEMENTS (lecture admin)

### GET /subscriptions — Lister tous les abonnements publics

**Accès :** public (admin peut aussi consommer cette route)

**Query params disponibles :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `city` | string | Filtrer par nom de ville |
| `landmarkId` | uuid | Filtrer par landmark |
| `type` | enum | `BREAKFAST`, `LUNCH`, `DINNER`, `FULL_DAY` |
| `category` | enum | `AFRICAN`, `EUROPEAN`, `ASIAN`, `MIXED` |
| `duration` | enum | `DAILY`, `WORK_WEEK`, `WEEK`, `MONTH` |
| `search` | string | Recherche textuelle |

**Réponse 200 ✅ :**
```json
{
  "success": true,
  "message": "Abonnements récupérés avec succès",
  "data": [
    {
      "id": "ce1ddb4f-bc45-4ac1-95c3-d8e012f6ca89",
      "name": "Formule Semaine Africaine",
      "price": 25000,
      "type": "FULL_DAY",
      "category": "AFRICAN",
      "duration": "WORK_WEEK",
      "isActive": true,
      "isPublic": true,
      "provider": {
        "id": "dc6b75af-3b82-4600-8816-6a3781a1c4cf",
        "businessName": "Chez Mariam",
        "city": {
          "id": "f48380b5-36d3-4dfe-8e11-0512eef18a9b",
          "name": "Lokossa",
          "country": { "code": "BJ", "translations": { "en": "Benin", "fr": "Bénin" } }
        },
        "landmarks": [
          {
            "landmark": {
              "id": "f10505bb-2f0c-4da0-b529-d30f57f91eed",
              "name": "Campus IUT Lokossa"
            }
          }
        ]
      }
    }
  ]
}
```

---

## 7. COMMANDES (lecture admin)

### GET /admin/orders — Lister toutes les commandes

> Route à implémenter si besoin — non encore exposée dans la version actuelle.

---

## Codes d'erreur globaux

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Token manquant ou expiré |
| `FORBIDDEN` | 403 | Rôle insuffisant (non ADMIN) |
| `RESOURCE_NOT_FOUND` | 404 | Ressource introuvable |
| `VALIDATION_ERROR` | 400 | Corps de requête invalide |
| `EMAIL_ALREADY_EXISTS` | 409 | Ressource déjà existante |
| `INVALID_CREDENTIALS` | 401 | Email ou mot de passe incorrect |
