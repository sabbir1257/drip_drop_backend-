# DeshWear Backend API

A full-featured e-commerce backend API built with Node.js, Express.js, and MongoDB Atlas.

## Features

- 🔐 User Authentication (JWT-based)
- 📦 Product Management (CRUD operations)
- 🛒 Shopping Cart
- 📝 Order Management
- ⭐ Product Reviews & Ratings
- ❤️ Favorites/Wishlist
- 👤 User Profile Management
- 📧 Contact Form Support
- 🔒 Role-based Access Control (Admin/User)
- 🚀 RESTful API Design

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **nodemailer** - Email functionality

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory**

   ```bash
   cd drip_drop_backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**

   Edit `.env` file and add your configuration:

   ```env
   PORT=5000
   NODE_ENV=development

   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drip_drop?retryWrites=true&w=majority

   # JWT Secret (use a strong random string in production)
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d

   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the server**

   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or the port specified in `.env`)

6. **Seed initial data (Optional)**

   ```bash
   # Seed products
   npm run seed:products

   # Seed admin user
   npm run seed:admin
   ```

   **Note:** Admin credentials:

   - Email: `admin@dripdrop.com`
   - Password: `admin123`
   - ⚠️ Change the password after first login!

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Products

- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get product categories
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart

- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart` - Add item to cart (Protected)
- `PUT /api/cart/:itemId` - Update cart item (Protected)
- `DELETE /api/cart/:itemId` - Remove item from cart (Protected)
- `DELETE /api/cart` - Clear cart (Protected)

### Orders

- `POST /api/orders` - Create new order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get single order (Protected)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Users

- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `POST /api/users/addresses` - Add address (Protected)
- `PUT /api/users/addresses/:addressId` - Update address (Protected)
- `DELETE /api/users/addresses/:addressId` - Delete address (Protected)

### Reviews

- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review (Protected)
- `PUT /api/reviews/:id` - Update review (Protected)
- `DELETE /api/reviews/:id` - Delete review (Protected)

### Favorites

- `GET /api/favorites` - Get user favorites (Protected)
- `POST /api/favorites` - Add to favorites (Protected)
- `GET /api/favorites/check/:productId` - Check if favorited (Protected)
- `DELETE /api/favorites/:productId` - Remove from favorites (Protected)

### Contact

- `POST /api/contact` - Send contact message

## Request Examples

### Register User

```bash
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

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Products with Filters

```bash
GET /api/products?category=T-shirts&minPrice=100&maxPrice=200&page=1&limit=12&sort=price-low
```

### Add to Cart

```bash
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2,
  "size": "L",
  "color": "blue"
}
```

### Create Order

```bash
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

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Database Models

### User

- Authentication and profile information
- Addresses array
- Role-based access (user/admin)

### Product

- Product details (name, price, images, etc.)
- Category, colors, sizes
- Stock management
- Ratings and reviews

### Cart

- User-specific cart
- Items with quantity, size, color
- Automatic total calculation

### Order

- Order items
- Shipping address
- Payment and order status
- Timestamps

### Review

- Product reviews and ratings
- User verification
- Automatic product rating updates

### Favorite

- User favorites/wishlist
- One favorite per user per product

## Error Handling

The API uses a centralized error handler that returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- CORS configuration
- Role-based access control

## Development

### Project Structure

```
drip_drop_backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── contactController.js
│   ├── favoriteController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── reviewController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validator.js
├── models/
│   ├── Cart.js
│   ├── Favorite.js
│   ├── Order.js
│   ├── Product.js
│   ├── Review.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── contactRoutes.js
│   ├── favoriteRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string
6. Replace `<password>` and `<dbname>` in the connection string
7. Add the connection string to your `.env` file as `MONGODB_URI`

## Production Considerations

- Change `JWT_SECRET` to a strong random string
- Set `NODE_ENV=production`
- Use environment-specific MongoDB connection strings
- Configure proper CORS origins
- Set up proper logging
- Use HTTPS
- Configure rate limiting appropriately
- Set up monitoring and error tracking

## License

ISC

## Support

For issues and questions, please contact the development team.
