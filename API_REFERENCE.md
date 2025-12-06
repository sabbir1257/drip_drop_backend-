# API Reference - Quick Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 📦 Product Endpoints

### Get All Products
```http
GET /api/products?category=T-shirts&minPrice=100&maxPrice=200&page=1&limit=12&sort=price-low
```

**Query Parameters:**
- `category` - Filter by category
- `color` - Filter by color
- `size` - Filter by size
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search term
- `sort` - Sort option (price-low, price-high, rating, newest)
- `page` - Page number
- `limit` - Items per page
- `featured` - Filter featured products (true/false)

### Get Single Product
```http
GET /api/products/:id
```

### Get Categories
```http
GET /api/products/categories
```

### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product Name",
  "price": 100,
  "category": "T-shirts",
  "colors": ["blue", "red"],
  "sizes": ["S", "M", "L"],
  "stock": 50
}
```

---

## 🛒 Cart Endpoints

### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

### Add to Cart
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2,
  "size": "L",
  "color": "blue"
}
```

### Update Cart Item
```http
PUT /api/cart/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /api/cart/:itemId
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <token>
```

---

## 📝 Order Endpoints

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "streetAddress": "123 Main St",
    "townCity": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "paymentMethod": "cash",
  "discountPercent": 20,
  "deliveryFee": 15
}
```

### Get User Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderStatus": "shipped"
}
```

**Order Statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

## 👤 User Endpoints

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatar": "avatar_url"
}
```

### Add Address
```http
POST /api/users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "streetAddress": "123 Main St",
  "townCity": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "United States",
  "isDefault": true
}
```

### Update Address
```http
PUT /api/users/addresses/:addressId
Authorization: Bearer <token>
Content-Type: application/json

{
  "streetAddress": "456 Oak Ave",
  "isDefault": true
}
```

### Delete Address
```http
DELETE /api/users/addresses/:addressId
Authorization: Bearer <token>
```

---

## ⭐ Review Endpoints

### Get Product Reviews
```http
GET /api/reviews/product/:productId
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "rating": 5,
  "comment": "Great product!"
}
```

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated comment"
}
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

---

## ❤️ Favorite Endpoints

### Get Favorites
```http
GET /api/favorites
Authorization: Bearer <token>
```

### Add to Favorites
```http
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id"
}
```

### Check if Favorited
```http
GET /api/favorites/check/:productId
Authorization: Bearer <token>
```

### Remove from Favorites
```http
DELETE /api/favorites/:productId
Authorization: Bearer <token>
```

---

## 📧 Contact Endpoint

### Send Contact Message
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Your message here"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

