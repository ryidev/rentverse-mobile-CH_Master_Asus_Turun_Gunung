# API Integration Guide

## Base Configuration

✅ **UPDATED:** API base URL sudah dikonfigurasi di `.env`:

```env
API_BASE_URL=http://localhost:3000/api/v1/m
```

File ini dibaca oleh `src/config/env.ts` menggunakan `react-native-config`.

## Authentication Flow

### 1. Register

```typescript
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+62812345678" // optional
}

Response:
{
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+62812345678",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### 2. Login

```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: Same as Register
```

### 3. Get Current User

```typescript
GET /auth/me
Authorization: Bearer {token}

Response:
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62812345678",
  "avatar": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Property Management

### 1. Get Properties

```typescript
GET /properties?page=1&limit=10&featured=false
Authorization: Bearer {token}

Response:
{
  "properties": [
    {
      "id": "property-id",
      "title": "Beautiful 2BR Apartment",
      "description": "...",
      "price": 500000,
      "location": "Jakarta, Indonesia",
      "address": "Jl. Example No. 123",
      "bedrooms": 2,
      "bathrooms": 1,
      "area": 80,
      "images": ["url1", "url2"],
      "amenities": [
        { "id": "1", "name": "WiFi", "icon": "wifi" }
      ],
      "ownerId": "owner-id",
      "rating": 4.5,
      "reviewCount": 10,
      "isFeatured": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50
}
```

### 2. Get Property Detail

```typescript
GET /properties/:id
Authorization: Bearer {token}

Response: Single property object (same structure as above)
```

### 3. Create Property

```typescript
POST /properties
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Beautiful 2BR Apartment",
  "description": "A beautiful apartment...",
  "price": 500000,
  "location": "Jakarta, Indonesia",
  "address": "Jl. Example No. 123",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 80,
  "amenities": ["1", "2", "3"],
  "images": ["base64-or-url1", "base64-or-url2"]
}

Response: Created property object
```

### 4. Update Property

```typescript
PUT /properties/:id
Authorization: Bearer {token}
Content-Type: application/json

Body: Same as Create Property (partial updates allowed)
Response: Updated property object
```

### 5. Upload Property Images

```typescript
POST /properties/:id/images
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- images: File[]

Response:
{
  "imageUrls": ["url1", "url2", "url3"]
}
```

## Reviews & Ratings

### 1. Get Property Reviews

```typescript
GET /properties/:propertyId/reviews
Authorization: Bearer {token}

Response:
[
  {
    "id": "review-id",
    "propertyId": "property-id",
    "userId": "user-id",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "avatar": "url"
    },
    "rating": 5,
    "comment": "Great property!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. Create Review

```typescript
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "propertyId": "property-id",
  "rating": 5,
  "comment": "Great property!"
}

Response: Created review object
```

## Favorites

### 1. Get Favorites

```typescript
GET /favorites
Authorization: Bearer {token}

Response:
[
  {
    "id": "favorite-id",
    "userId": "user-id",
    "propertyId": "property-id",
    "property": { /* property object */ },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. Add to Favorites

```typescript
POST /favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "propertyId": "property-id"
}

Response: Created favorite object
```

### 3. Remove from Favorites

```typescript
DELETE /favorites/:id
Authorization: Bearer {token}

Response: 204 No Content
```

### 4. Check if Favorited

```typescript
GET /favorites/check/:propertyId
Authorization: Bearer {token}

Response:
{
  "isFavorite": true
}
```

## Bookings

### 1. Get Bookings

```typescript
GET /bookings
Authorization: Bearer {token}

Response:
[
  {
    "id": "booking-id",
    "propertyId": "property-id",
    "property": { /* property object */ },
    "userId": "user-id",
    "checkIn": "2024-02-01",
    "checkOut": "2024-02-05",
    "guests": 2,
    "totalPrice": 2000000,
    "status": "confirmed", // pending, confirmed, cancelled, completed
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. Create Booking

```typescript
POST /bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "propertyId": "property-id",
  "checkIn": "2024-02-01",
  "checkOut": "2024-02-05",
  "guests": 2
}

Response: Created booking object
```

### 3. Cancel Booking

```typescript
PATCH /bookings/:id/cancel
Authorization: Bearer {token}

Response: Updated booking object with status "cancelled"
```

## AI Features (Optional)

### Predict Property Price

```typescript
POST /properties/predict-price
Authorization: Bearer {token}
Content-Type: application/json

{
  "location": "Jakarta, Indonesia",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 80,
  "amenities": ["1", "2", "3"]
}

Response:
{
  "predictedPrice": 550000,
  "confidence": 0.85
}
```

## Error Responses

All endpoints may return these error responses:

```typescript
// 400 Bad Request
{
  "message": "Validation error",
  "errors": {
    "email": "Email is required"
  }
}

// 401 Unauthorized
{
  "message": "Invalid credentials"
}

// 403 Forbidden
{
  "message": "Access denied"
}

// 404 Not Found
{
  "message": "Resource not found"
}

// 500 Internal Server Error
{
  "message": "Internal server error"
}
```

## Upload Avatar

```typescript
POST /auth/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- avatar: File

Response:
{
  "avatarUrl": "https://..."
}
```

## ✨ NEW: Refresh Token

```typescript
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh-token-here"
}

Response:
{
  "token": "new-jwt-token",
  "refreshToken": "new-refresh-token",
  "user": { ... }
}
```

**Implementation:**

- Automatically called when access token expires (401 error)
- Handled by axios interceptor in `api.ts`
- Queues failed requests and retries after refresh
- If refresh fails, user is logged out automatically

## ✨ NEW: Google OAuth

```typescript
POST /auth/google
Content-Type: application/json

{
  "idToken": "google-id-token-from-sign-in"
}

Response:
{
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here",
  "refreshToken": "refresh-token-here"
}
```

**Implementation:**

- User clicks "Sign in with Google" button
- Google Sign-In popup appears
- App receives Google ID token
- Send ID token to backend for verification
- Backend verifies with Google and returns JWT
- User is automatically logged in

**Setup Required:**
See [ENV_OAUTH_SETUP.md](./ENV_OAUTH_SETUP.md) for complete setup instructions.

## Notes

- All authenticated requests require `Authorization: Bearer {token}` header
- Token is stored in AsyncStorage after login/register
- Token is automatically added to requests by the API service
- On 401 errors, the app automatically attempts token refresh
- If refresh fails, user is logged out automatically
- Refresh tokens are stored securely in AsyncStorage
- OAuth requires Google Client ID configuration in `.env`
