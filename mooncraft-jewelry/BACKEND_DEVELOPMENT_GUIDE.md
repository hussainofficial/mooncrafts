# MOONCRAFT Backend Development Guide
## Phase 1: Foundation (Database + Authentication)

---

## 📌 BEFORE YOU START

1. **Review the Analysis Document** - Read the complete architecture analysis
   - Link: `/analysis` route in your Angular app
   - Or: Check the comprehensive documentation artifact

2. **Ensure You Have All Requirements**
   ```
   ✅ Node.js 22.18.0
   ✅ MySQL 8.0
   ✅ npm 11.2.0
   ✅ Git
   ✅ Postman or Insomnia (for API testing)
   ✅ MySQL Workbench 8.0 (optional but recommended)
   ```

3. **Check Frontend is Working**
   ```bash
   npm start
   # Navigate to http://localhost:4200
   ```

---

## 🚀 STEP 1: SET UP PROJECT STRUCTURE

### Create Backend Folder
```bash
cd c:\Users\hussa\mooncraft-jewelry
mkdir mooncraft-backend
cd mooncraft-backend
npm init -y
```

### Install Core Dependencies
```bash
npm install express mysql2 dotenv cors helmet morgan bcrypt jsonwebtoken express-validator
npm install --save-dev nodemon
```

### Create Folder Structure
```
mooncraft-backend/
├── config/
│   ├── database.js
│   └── constants.js
├── src/
│   ├── middleware/
│   │   ├── authentication.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── users.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── services/
│   │   ├── authService.js
│   │   └── userService.js
│   ├── repositories/
│   │   ├── userRepository.js
│   │   └── index.js
│   ├── utils/
│   │   ├── jwtHelper.js
│   │   ├── passwordHelper.js
│   │   ├── validators.js
│   │   └── response.js
│   └── app.js
├── .env
├── .env.example
├── server.js
└── package.json
```

---

## 🗄️ STEP 2: SET UP DATABASE

### 2.1 Create MySQL Database
```sql
CREATE DATABASE mooncraft_jewelry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mooncraft_jewelry;
```

### 2.2 Create Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  UNIQUE KEY uk_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 2.3 Create Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY fk_user (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

### 2.4 Create User Addresses Table
```sql
CREATE TABLE user_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('home', 'work', 'other') DEFAULT 'home',
  street_address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY fk_user (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

### 2.5 Create Categories Table (for Phase 2)
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type ENUM('material', 'type', 'collection') NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  UNIQUE KEY uk_slug (slug),
  INDEX idx_type (type),
  INDEX idx_display_order (display_order)
);
```

---

## ⚙️ STEP 3: CONFIGURATION FILES

### 3.1 .env File
```env
# Server
NODE_ENV=development
PORT=5000
APP_NAME=MOONCRAFT Jewelry
APP_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mooncraft_jewelry
DB_CONNECTION_LIMIT=10

# JWT
JWT_SECRET=your_super_secret_key_change_in_production_12345
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your_refresh_secret_key_change_in_production_12345
REFRESH_TOKEN_EXPIRY=7d

# Password
PASSWORD_SALT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:4200

# API
API_VERSION=v1
```

### 3.2 config/database.js
```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

module.exports = pool;
```

### 3.3 config/constants.js
```javascript
module.exports = {
  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // User Status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned',
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Error Messages
  ERRORS: {
    INVALID_EMAIL_PASSWORD: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already registered',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    INTERNAL_SERVER_ERROR: 'Internal server error',
  },
};
```

---

## 🔐 STEP 4: AUTHENTICATION UTILITIES

### 4.1 utils/jwtHelper.js
```javascript
const jwt = require('jsonwebtoken');

const jwtHelper = {
  generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
  },

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return null;
    }
  },

  decodeToken(token) {
    return jwt.decode(token);
  },
};

module.exports = jwtHelper;
```

### 4.2 utils/passwordHelper.js
```javascript
const bcrypt = require('bcrypt');

const passwordHelper = {
  async hash(password) {
    return bcrypt.hash(password, parseInt(process.env.PASSWORD_SALT_ROUNDS));
  },

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  },

  validatePassword(password) {
    // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  },
};

module.exports = passwordHelper;
```

### 4.3 utils/response.js
```javascript
const response = {
  success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  },

  error(message, errors = [], statusCode = 400) {
    return {
      success: false,
      message,
      errors,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  },
};

module.exports = response;
```

---

## 🛡️ STEP 5: MIDDLEWARE

### 5.1 src/middleware/authentication.js
```javascript
const jwtHelper = require('../utils/jwtHelper');
const { HTTP_STATUS, ERRORS } = require('../../config/constants');
const response = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        response.error(ERRORS.UNAUTHORIZED, [], HTTP_STATUS.UNAUTHORIZED)
      );
    }

    const decoded = jwtHelper.verifyAccessToken(token);

    if (!decoded) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        response.error('Token expired or invalid', [], HTTP_STATUS.UNAUTHORIZED)
      );
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      response.error(ERRORS.UNAUTHORIZED, [], HTTP_STATUS.UNAUTHORIZED)
    );
  }
};

module.exports = authMiddleware;
```

### 5.2 src/middleware/errorHandler.js
```javascript
const { HTTP_STATUS, ERRORS } = require('../../config/constants');
const response = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json(
      response.error(err.message, err.errors, err.statusCode)
    );
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    response.error(ERRORS.INTERNAL_SERVER_ERROR, [], HTTP_STATUS.INTERNAL_SERVER_ERROR)
  );
};

module.exports = errorHandler;
```

---

## 🔌 STEP 6: REPOSITORIES (Data Access Layer)

### 6.1 src/repositories/userRepository.js
```javascript
const pool = require('../../config/database');

const userRepository = {
  async create(email, passwordHash, name, phone) {
    const query = `
      INSERT INTO users (email, password_hash, name, phone)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [email, passwordHash, name, phone]);
    return result.insertId;
  },

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  },

  async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    const query = `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`;
    values.push(id);
    
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  },

  async getAll() {
    const query = 'SELECT id, email, name, phone, role, status, created_at FROM users WHERE deleted_at IS NULL';
    const [rows] = await pool.execute(query);
    return rows;
  },
};

module.exports = userRepository;
```

---

## 🎯 STEP 7: SERVICES (Business Logic)

### 7.1 src/services/authService.js
```javascript
const userRepository = require('../repositories/userRepository');
const passwordHelper = require('../utils/passwordHelper');
const jwtHelper = require('../utils/jwtHelper');
const pool = require('../../config/database');

const authService = {
  async register(email, password, name, phone) {
    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const passwordHash = await passwordHelper.hash(password);

    // Create user
    const userId = await userRepository.create(email, passwordHash, name, phone);

    // Generate tokens
    const user = await userRepository.findById(userId);
    const accessToken = jwtHelper.generateAccessToken(user.id, user.role);
    const refreshToken = jwtHelper.generateRefreshToken(user.id);

    // Save refresh token
    const refreshTokenHash = await passwordHelper.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, refreshTokenHash, expiresAt]
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours in seconds
    };
  },

  async login(email, password) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isValid = await passwordHelper.compare(password, user.password_hash);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is active
    if (user.status !== 'active') {
      const error = new Error('Account is inactive or banned');
      error.statusCode = 403;
      throw error;
    }

    // Generate tokens
    const accessToken = jwtHelper.generateAccessToken(user.id, user.role);
    const refreshToken = jwtHelper.generateRefreshToken(user.id);

    // Save refresh token
    const refreshTokenHash = await passwordHelper.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshTokenHash, expiresAt]
    );

    // Update last login
    await userRepository.update(user.id, { last_login_at: new Date() });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessToken,
      refreshToken,
      expiresIn: 86400,
    };
  },

  async refreshAccessToken(refreshToken) {
    const decoded = jwtHelper.verifyRefreshToken(refreshToken);
    if (!decoded) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const accessToken = jwtHelper.generateAccessToken(user.id, user.role);
    return { accessToken };
  },
};

module.exports = authService;
```

---

## 👥 STEP 8: CONTROLLERS (Request Handlers)

### 8.1 src/controllers/authController.js
```javascript
const authService = require('../services/authService');
const { HTTP_STATUS } = require('../../config/constants');
const response = require('../utils/response');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name, phone } = req.body;

      const result = await authService.register(email, password, name, phone);

      return res.status(HTTP_STATUS.CREATED).json(
        response.success(result, 'User registered successfully', HTTP_STATUS.CREATED)
      );
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return res.status(HTTP_STATUS.OK).json(
        response.success(result, 'Login successful', HTTP_STATUS.OK)
      );
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshAccessToken(refreshToken);

      return res.status(HTTP_STATUS.OK).json(
        response.success(result, 'Token refreshed', HTTP_STATUS.OK)
      );
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      const userRepository = require('../repositories/userRepository');
      const user = await userRepository.findById(req.user.userId);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
      };

      return res.status(HTTP_STATUS.OK).json(
        response.success(userData, 'User retrieved', HTTP_STATUS.OK)
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
```

---

## 🛣️ STEP 9: ROUTES

### 9.1 src/routes/auth.routes.js
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authentication');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
```

---

## 🎬 STEP 10: MAIN APP FILE

### 10.1 src/app.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(`/api/${process.env.API_VERSION}/auth`, authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    statusCode: 404,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
```

### 10.2 server.js
```javascript
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Version: v1`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
  console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN}`);
});
```

---

## 📝 STEP 11: PACKAGE.JSON SCRIPTS

Update your package.json scripts:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
}
```

---

## ✅ STEP 12: TESTING THE BACKEND

### 12.1 Start the Server
```bash
npm run dev
# Output: 🚀 Server running on http://localhost:5000
```

### 12.2 Test Registration Endpoint
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "phone": "+91 98765 43210"
  }'

# Expected Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 86400
  }
}
```

### 12.3 Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 12.4 Test Current User Endpoint
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔗 STEP 13: INTEGRATE WITH FRONTEND

Update your frontend authentication service to call the real API:

### Update frontend auth.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/v1/auth';
  
  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);
  isAdmin = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(email: string, password: string, name: string, phone: string) {
    return this.http.post(`${this.apiUrl}/register`, {
      email,
      password,
      name,
      phone,
    });
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  private loadUser() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.http.get(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).subscribe(
        (response: any) => {
          this.currentUser.set(response.data);
          this.isLoggedIn.set(true);
          this.isAdmin.set(response.data.role === 'admin');
        },
        () => {
          this.logout();
        }
      );
    }
  }
}
```

---

## 🎯 NEXT STEPS

### Phase 1 Complete (Weeks 1-2)
- ✅ Database schema
- ✅ User registration & login
- ✅ JWT authentication
- ✅ Password hashing
- ✅ User management APIs

### Phase 2 (Weeks 3-4)
- Products table & APIs
- Categories table & APIs
- Product filtering
- Search endpoint

### Phase 3-4 (Week 5)
- Cart management
- Wishlist management

**Continue with remaining phases based on the development roadmap.**

---

## 📚 USEFUL RESOURCES

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Express.js Guide**: https://expressjs.com/
- **JWT Authentication**: https://jwt.io/
- **bcrypt NPM**: https://www.npmjs.com/package/bcrypt
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **Never commit .env file to git** - Add to .gitignore
2. **Change JWT_SECRET in production** - Use a strong, random key
3. **Use HTTPS in production** - Not HTTP
4. **Validate all inputs** - Server-side validation required
5. **Hash passwords with bcrypt** - Never store plain passwords
6. **Use environment variables** - For sensitive data
7. **Rate limit authentication endpoints** - Prevent brute force

---

## 🆘 TROUBLESHOOTING

### Issue: "ECONNREFUSED" on database connection
**Solution**: Ensure MySQL server is running
```bash
# Check if MySQL is running
mysql -u root -p
```

### Issue: "Port 5000 already in use"
**Solution**: Kill the process or use a different port
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: JWT token verification fails
**Solution**: Ensure JWT_SECRET is the same in .env file

---

**Document Status**: COMPLETE - READY TO IMPLEMENT
**Last Updated**: 2024-07-05
**Version**: 1.0
