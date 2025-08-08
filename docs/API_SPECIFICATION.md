# 📡 Mäklarsystem API Specification

> Version: 1.0.0  
> Last Updated: 2025-08-06  
> Base URL: `https://api.maklarsystem.se/v1`  
> Status: Draft

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Patterns](#common-patterns)
4. [Endpoints](#endpoints)
   - [Objekt (Properties)](#objekt-properties)
   - [Kontakter (Contacts)](#kontakter-contacts)
   - [Visningar (Viewings)](#visningar-viewings)
   - [Bud (Bids)](#bud-bids)
   - [Dokument (Documents)](#dokument-documents)
5. [Real-time Subscriptions](#real-time-subscriptions)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Webhooks](#webhooks)

## 🎯 Overview

### API Design Principles
- **RESTful**: Following REST architectural principles
- **JSON**: All requests and responses use JSON
- **UTF-8**: Character encoding for Swedish characters
- **ISO 8601**: Date/time format
- **UUID**: Resource identifiers

### Request Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
X-API-Version: 1.0.0
Accept-Language: sv-SE
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-08-06T10:00:00Z",
    "version": "1.0.0",
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  },
  "errors": []
}
```

## 🔐 Authentication

### OAuth 2.0 Flow
```http
POST /api/auth/login
```

**Request:**
```json
{
  "email": "agent@maklare.se",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "agent@maklare.se",
      "namn": "Anna Andersson",
      "roll": "maklare"
    }
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### BankID Authentication (Future)
```http
POST /api/auth/bankid/init
POST /api/auth/bankid/collect/{orderRef}
```

## 🔄 Common Patterns

### Pagination
```http
GET /api/resource?page=1&per_page=20&sort=created_at&order=desc
```

### Filtering
```http
GET /api/objekt?typ=villa&pris_min=1000000&pris_max=5000000&rum_min=3
```

### Field Selection
```http
GET /api/objekt?fields=id,adress,pris,status,bilder
```

### Search
```http
GET /api/objekt/search?q=stockholm&inom=10km
```

## 📍 Endpoints

### Objekt (Properties)

#### List Properties
```http
GET /api/objekt
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | enum | `tillsalu`, `sald`, `kommande`, `paborjad` |
| typ | enum | `villa`, `lagenhet`, `radhus`, `tomt` |
| pris_min | number | Minimum price |
| pris_max | number | Maximum price |
| rum_min | integer | Minimum rooms |
| rum_max | integer | Maximum rooms |
| boarea_min | number | Minimum living area |
| boarea_max | number | Maximum living area |
| omrade | string | Area/district |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "adress": "Storgatan 1",
      "postnummer": "11122",
      "ort": "Stockholm",
      "typ": "lagenhet",
      "pris": 3500000,
      "rum": 3,
      "boarea": 75,
      "byggar": 1952,
      "status": "tillsalu",
      "visningar": [
        {
          "datum": "2025-08-10",
          "tid": "14:00-15:00"
        }
      ],
      "huvudbild": "https://storage.maklarsystem.se/objekt/123/huvudbild.jpg",
      "created_at": "2025-08-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

#### Get Property
```http
GET /api/objekt/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "grundinformation": {
      "adress": "Storgatan 1",
      "postnummer": "11122",
      "ort": "Stockholm",
      "lan": "Stockholms län",
      "kommun": "Stockholm",
      "typ": "lagenhet",
      "upplatelseform": "bostadsratt"
    },
    "ekonomi": {
      "pris": 3500000,
      "manadskostnad": 4500,
      "driftkostnad": 1200,
      "arsavgift": 54000
    },
    "storlek": {
      "rum": 3,
      "boarea": 75,
      "biarea": 0,
      "tomtarea": null
    },
    "beskrivning": {
      "kort": "Charmig 3:a i centrala Stockholm",
      "lang": "Välkommen till denna fantastiska lägenhet...",
      "interiör": "Öppen planlösning med..."
    },
    "egenskaper": {
      "byggar": 1952,
      "vaning": 3,
      "hiss": true,
      "balkong": true,
      "terrass": false,
      "tradgard": false,
      "garage": false,
      "parkering": "gatuparkering",
      "uppvarmning": "fjärrvärme",
      "energiklass": "D"
    },
    "bilder": [
      {
        "id": "img-001",
        "url": "https://storage.maklarsystem.se/objekt/123/img1.jpg",
        "typ": "huvudbild",
        "beskrivning": "Fasad",
        "ordning": 1
      }
    ],
    "dokument": [
      {
        "id": "doc-001",
        "namn": "Objektsbeskrivning.pdf",
        "typ": "objektsbeskrivning",
        "storlek": 2048576,
        "url": "https://storage.maklarsystem.se/objekt/123/docs/beskrivning.pdf"
      }
    ],
    "visningar": [
      {
        "id": "vis-001",
        "datum": "2025-08-10",
        "starttid": "14:00",
        "sluttid": "15:00",
        "typ": "oppen",
        "anmalda": 12
      }
    ],
    "status": "tillsalu",
    "publicerad": true,
    "hemnet_id": "12345678",
    "maklare": {
      "id": "usr-001",
      "namn": "Anna Andersson",
      "telefon": "070-1234567",
      "email": "anna@maklare.se"
    },
    "statistik": {
      "visningar_web": 450,
      "visningar_hemnet": 1200,
      "intresseanmalningar": 35,
      "antal_bud": 5
    },
    "created_at": "2025-08-01T10:00:00Z",
    "updated_at": "2025-08-06T14:30:00Z"
  }
}
```

#### Create Property
```http
POST /api/objekt
```

**Request:**
```json
{
  "adress": "Storgatan 1",
  "postnummer": "11122",
  "ort": "Stockholm",
  "typ": "lagenhet",
  "pris": 3500000,
  "rum": 3,
  "boarea": 75,
  "byggar": 1952,
  "beskrivning_kort": "Charmig 3:a i centrala Stockholm",
  "beskrivning_lang": "Välkommen till denna fantastiska lägenhet..."
}
```

#### Update Property
```http
PUT /api/objekt/{id}
```

#### Delete Property
```http
DELETE /api/objekt/{id}
```

### Kontakter (Contacts)

#### List Contacts
```http
GET /api/kontakter
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| typ | enum | `kund`, `spekulant`, `saljare`, `kopare` |
| sokord | string | Search in name, email, phone |
| gdpr_samtycke | boolean | GDPR consent status |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "kon-001",
      "fornamn": "Erik",
      "efternamn": "Eriksson",
      "email": "erik@example.com",
      "telefon": "070-9876543",
      "typ": "spekulant",
      "adress": {
        "gatuadress": "Kungsgatan 10",
        "postnummer": "11143",
        "ort": "Stockholm"
      },
      "intressen": {
        "typ": ["lagenhet", "villa"],
        "omrade": ["Vasastan", "Östermalm"],
        "pris_max": 5000000,
        "rum_min": 2
      },
      "gdpr_samtycke": true,
      "marknadsforingsssamtycke": true,
      "created_at": "2025-07-15T09:00:00Z"
    }
  ]
}
```

#### Get Contact
```http
GET /api/kontakter/{id}
```

#### Create Contact
```http
POST /api/kontakter
```

**Request:**
```json
{
  "fornamn": "Erik",
  "efternamn": "Eriksson",
  "email": "erik@example.com",
  "telefon": "070-9876543",
  "typ": "spekulant",
  "gdpr_samtycke": true
}
```

#### Update Contact
```http
PUT /api/kontakter/{id}
```

#### Delete Contact (GDPR)
```http
DELETE /api/kontakter/{id}
```

### Visningar (Viewings)

#### List Viewings
```http
GET /api/visningar
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| objekt_id | uuid | Filter by property |
| datum_from | date | Start date |
| datum_to | date | End date |
| typ | enum | `oppen`, `privat`, `digital` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vis-001",
      "objekt_id": "obj-001",
      "objekt_adress": "Storgatan 1",
      "datum": "2025-08-10",
      "starttid": "14:00",
      "sluttid": "15:00",
      "typ": "oppen",
      "max_antal": 20,
      "anmalda": [
        {
          "kontakt_id": "kon-001",
          "namn": "Erik Eriksson",
          "anmald_at": "2025-08-05T10:00:00Z"
        }
      ],
      "qr_kod": "https://api.maklarsystem.se/visningar/vis-001/qr",
      "status": "kommande"
    }
  ]
}
```

#### Create Viewing
```http
POST /api/visningar
```

**Request:**
```json
{
  "objekt_id": "obj-001",
  "datum": "2025-08-10",
  "starttid": "14:00",
  "sluttid": "15:00",
  "typ": "oppen",
  "max_antal": 20
}
```

#### Register for Viewing
```http
POST /api/visningar/{id}/anmalan
```

**Request:**
```json
{
  "kontakt_id": "kon-001",
  "antal_personer": 2,
  "meddelande": "Vi är mycket intresserade"
}
```

#### Check-in to Viewing
```http
POST /api/visningar/{id}/checkin
```

**Request:**
```json
{
  "qr_kod": "VIS-001-2025-08-10",
  "kontakt_id": "kon-001"
}
```

### Bud (Bids)

#### List Bids
```http
GET /api/bud
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| objekt_id | uuid | Filter by property |
| kontakt_id | uuid | Filter by contact |
| status | enum | `aktivt`, `accepterat`, `avslaget` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bud-001",
      "objekt_id": "obj-001",
      "objekt_adress": "Storgatan 1",
      "kontakt_id": "kon-001",
      "budgivare": "Erik Eriksson",
      "belopp": 3600000,
      "villkor": "Låneklausul 14 dagar",
      "datum": "2025-08-06T14:30:00Z",
      "status": "aktivt",
      "position": 1,
      "bankid_verifierat": true
    }
  ]
}
```

#### Place Bid
```http
POST /api/bud
```

**Request:**
```json
{
  "objekt_id": "obj-001",
  "kontakt_id": "kon-001",
  "belopp": 3600000,
  "villkor": "Låneklausul 14 dagar",
  "bankid_signatur": "..."
}
```

#### Accept Bid
```http
POST /api/bud/{id}/acceptera
```

#### Reject Bid
```http
POST /api/bud/{id}/avslå
```

### Dokument (Documents)

#### List Documents
```http
GET /api/dokument
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| objekt_id | uuid | Filter by property |
| typ | enum | Document type |

#### Upload Document
```http
POST /api/dokument/upload
```

**Request (multipart/form-data):**
```
objekt_id: obj-001
typ: energideklaration
fil: [binary data]
```

#### Get Document
```http
GET /api/dokument/{id}
```

#### Generate Document
```http
POST /api/dokument/generera
```

**Request:**
```json
{
  "mall": "kopeavtal",
  "objekt_id": "obj-001",
  "kontakt_id": "kon-001",
  "data": {
    "kopeskilling": 3600000,
    "tilltrade": "2025-10-01"
  }
}
```

## 🔄 Real-time Subscriptions

### WebSocket Connection
```javascript
const ws = new WebSocket('wss://api.maklarsystem.se/v1/realtime');

ws.send(JSON.stringify({
  event: 'subscribe',
  channel: 'objekt:obj-001:bud',
  token: 'Bearer {token}'
}));
```

### Available Channels
| Channel | Description | Events |
|---------|-------------|--------|
| `objekt:{id}:bud` | Bid updates for property | `bud.nytt`, `bud.uppdaterat` |
| `visningar:{id}` | Viewing registrations | `anmalan.ny`, `checkin` |
| `notifikationer:{user_id}` | User notifications | `notifikation.ny` |

### Event Format
```json
{
  "event": "bud.nytt",
  "channel": "objekt:obj-001:bud",
  "data": {
    "id": "bud-002",
    "belopp": 3700000,
    "budgivare": "Anna Andersson",
    "datum": "2025-08-06T15:00:00Z"
  },
  "timestamp": "2025-08-06T15:00:00Z"
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "success": false,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Felaktigt format på postnummer",
      "field": "postnummer",
      "details": {
        "expected": "NNNNN",
        "received": "111"
      }
    }
  ],
  "meta": {
    "timestamp": "2025-08-06T10:00:00Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## ⏱️ Rate Limiting

### Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Read operations | 100 requests | 1 minute |
| Write operations | 20 requests | 1 minute |
| File uploads | 10 requests | 10 minutes |

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1628856000
```

## 🪝 Webhooks

### Webhook Configuration
```http
POST /api/webhooks
```

**Request:**
```json
{
  "url": "https://yourapp.com/webhook",
  "events": ["objekt.skapad", "bud.nytt", "visning.anmalan"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload
```json
{
  "event": "objekt.skapad",
  "data": {
    "id": "obj-002",
    "adress": "Kungsgatan 5"
  },
  "timestamp": "2025-08-06T16:00:00Z",
  "signature": "sha256=..."
}
```

### Event Types
| Event | Description |
|-------|-------------|
| `objekt.skapad` | Property created |
| `objekt.uppdaterad` | Property updated |
| `objekt.sald` | Property sold |
| `bud.nytt` | New bid placed |
| `bud.accepterat` | Bid accepted |
| `visning.anmalan` | Viewing registration |
| `dokument.signerat` | Document signed |

## 🔧 Testing

### Test Environment
- **Base URL**: `https://api-test.maklarsystem.se/v1`
- **Test Credentials**: Available upon request
- **Rate Limits**: 10x production limits

### Postman Collection
Download: [Mäklarsystem API.postman_collection.json](/docs/postman/collection.json)

### cURL Examples
```bash
# Get properties
curl -X GET "https://api.maklarsystem.se/v1/objekt" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Create property
curl -X POST "https://api.maklarsystem.se/v1/objekt" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "adress": "Storgatan 1",
    "pris": 3500000
  }'
```

---

*This API specification is subject to change. Version 1.0.0 - Draft*