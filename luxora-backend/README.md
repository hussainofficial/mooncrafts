# LUXORA Backend API - Phase 1

Complete backend implementation for LUXORA Jewelry E-Commerce platform.

## 📋 What's Included

### ✅ Phase 1 Features
- User registration and login
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- User profile management
- 4 API endpoints
- MySQL database with 4 tables
- Security best practices

### 📁 Project Structure
```
luxora-backend/
├── config/              # Configuration files
│   ├── database.js      # MySQL connection pool
│   └── constants.js     # App constants and messages
├── src/
│   ├── utils/           # Utility functions
│   │   ├── jwt.js       # JWT token generation & verification
│   │   └── hash.js      # Password hashing
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── error.middleware.js   # Error handling
│   ├── repositories/    # Database access layer
│   │   └── user.repository.js    # User CRUD operations
│   ├── services/        # Business logic layer
│   │   └── auth.service.js       # Authentication logic
│   ├── controllers/     # Request handlers
│   │   └── auth.controller.js    # Auth endpoints
│   ├── routes/          # API routes
│   │   └── auth.routes.js        # Auth route definitions
│   └── app.js           # Express app setup
├── server.js            # Entry point
├── package.json         # Dependencies
├── .env.example         # Environment variables template
├── DATABASE_SETUP.sql   # Database initialization script
└── README.md            # This file
```

## 🚀 Quick Start

### Step 1: Setup Database

**Open MySQL Workbench and run the SQL script:**

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to **File → Open SQL Script**
4. Select `DATABASE_SETUP.sql`
5. Click **Execute** or press `Ctrl+Shift+Enter`

**Or run via command line:**
```powershell
mysql -u root -p < DATABASE_SETUP.sql
```

### Step 2: Setup Environment Variables

1. Copy `.env.example` to `.env`
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` with your configuration:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=luxora_jewelry
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:4200
```

### Step 3: Install Dependencies

```powershell
npm install
```

### Step 4: Start the Server

**Development mode (with auto-reload):**
```powershell
npm run dev
```

**Production mode:**
```powershell
npm start
```

**Expected output:**
```
✅ Server running on http://localhost:5000
📚 API Documentation:
   - Health Check: GET http://localhost:5000/api/health
   - Register: POST http://localhost:5000/api/v1/auth/register
   - Login: POST http://localhost:5000/api/v1/auth/login
   - Refresh Token: POST http://localhost:5000/api/v1/auth/refresh
   - Get Profile: GET http://localhost:5000/api/v1/auth/me
```

---

## 📡 API Endpoints

### 1. Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+91 98765 43210"
}

Response 201:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+91 98765 43210"
    }
  }
}
```

### 2. Login User
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+91 98765 43210",
      "role": "user"
    }
  }
}
```

### 3. Refresh Access Token
```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response 200:
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

### 4. Get User Profile (Protected)
```
GET /api/v1/auth/me
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+91 98765 43210",
    "role": "user",
    "status": "active",
    "created_at": "2026-07-06 10:30:45"
  }
}
```

### 5. Health Check
```
GET /api/health

Response 200:
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## 🧪 Testing with Postman

### Setup Postman Collection

1. **Create Register Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/register`
   - Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "Test@123456",
     "name": "Test User",
     "phone": "+1234567890"
   }
   ```
   - Send and copy the `accessToken` and `refreshToken` from response

2. **Create Login Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "Test@123456"
   }
   ```

3. **Create Get Profile Request:**
   - Method: GET
   - URL: `http://localhost:5000/api/v1/auth/me`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer <accessToken>`
   - Send

4. **Create Refresh Token Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/refresh`
   - Body (JSON):
   ```json
   {
     "refreshToken": "<refreshToken>"
   }
   ```

---

## 🔐 Security Features

✅ **Password Hashing**: Bcrypt with 12 salt rounds  
✅ **JWT Tokens**: Access token (24h) + Refresh token (7d)  
✅ **SQL Injection Prevention**: Parameterized queries  
✅ **CORS Configuration**: Limited to frontend origin  
✅ **Security Headers**: Helmet.js middleware  
✅ **Error Handling**: No sensitive info leakage  
✅ **Input Validation**: Express-validator  
✅ **Token Refresh**: Secure token rotation  

---

## 🛠️ Development

### Environment Variables

Create `.env` file (copy from `.env.example`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=luxora_jewelry
PORT=5000
JWT_SECRET=your_secret_key
```

### Database Connection

The app uses MySQL connection pooling for better performance:
- Pool size: 10 connections
- Auto-reconnect enabled
- Connection timeout handled

### Error Handling

All errors are caught and handled gracefully:
- Validation errors return 400
- Authentication errors return 401
- Conflict errors return 409
- Server errors return 500

---

## 📊 Database Schema

### users table
| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | INT | PK | Auto increment |
| email | VARCHAR(255) | UNIQUE | User email |
| password_hash | VARCHAR(255) | - | Bcrypt hash |
| name | VARCHAR(255) | - | User name |
| phone | VARCHAR(20) | - | Phone number |
| role | ENUM | - | user/admin |
| status | ENUM | - | active/inactive/banned |
| created_at | TIMESTAMP | - | Creation time |
| updated_at | TIMESTAMP | - | Last update |

### refresh_tokens table
| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | INT | PK | Auto increment |
| user_id | INT | FK | References users |
| token_hash | VARCHAR(255) | UNIQUE | SHA256 hash |
| expires_at | DATETIME | - | Expiration time |
| revoked | BOOLEAN | - | Revocation flag |
| created_at | TIMESTAMP | - | Creation time |

### Categories table (Phase 2)
Pre-populated with material, type, and collection categories.

---

## 🔄 Architecture

```
Frontend (Angular) at http://localhost:4200
        ↓ HTTP Requests with JWT
Backend (Express) at http://localhost:5000
        ↓
Controllers (Handle HTTP)
        ↓
Services (Business Logic)
        ↓
Repositories (Database Access)
        ↓
MySQL Database (Data Storage)
```

---

## 📝 Next Steps

### Phase 1 Complete ✅
- Authentication system
- User management
- JWT tokens

### Phase 2 (Products)
- Product management
- Categories
- Search & filters

### Phase 3 (Shopping)
- Shopping cart
- Wishlist

### Phase 4 (Orders)
- Order creation
- Order tracking

---

## 🐛 Troubleshooting

### "Port 5000 already in use"
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Cannot connect to database"
1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists: `luxora_jewelry`
4. Check DB_HOST is correct

### "JWT token is invalid"
1. Check token expiry
2. Verify JWT_SECRET in `.env`
3. Ensure token format: `Bearer <token>`

### "Email already exists"
- User already registered with that email
- Use different email or login instead

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation above
3. Check console logs for error messages
4. Verify database is running and accessible

---

## ✨ Created Files Summary

**Core Files:**
- ✅ server.js - Entry point
- ✅ src/app.js - Express setup
- ✅ config/database.js - DB connection
- ✅ config/constants.js - Constants

**Utilities:**
- ✅ src/utils/jwt.js - Token handling
- ✅ src/utils/hash.js - Password hashing

**Middleware:**
- ✅ src/middleware/auth.middleware.js - JWT verification
- ✅ src/middleware/error.middleware.js - Error handling

**Data Layer:**
- ✅ src/repositories/user.repository.js - Database queries
- ✅ src/services/auth.service.js - Business logic
- ✅ src/controllers/auth.controller.js - Request handlers
- ✅ src/routes/auth.routes.js - API routes

**Database:**
- ✅ DATABASE_SETUP.sql - Table creation
- ✅ .env.example - Configuration template

---

**Status**: ✅ **PHASE 1 COMPLETE**  
**Ready to Use**: YES  
**Next Phase**: Products (Phase 2)

---

Happy coding! 🚀
