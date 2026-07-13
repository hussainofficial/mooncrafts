# 🚀 QUICK START GUIDE

Get the backend running in 5 minutes!

## ⚡ Step-by-Step

### Step 1: Setup Database (2 min)
```powershell
# Open MySQL Workbench
# 1. Connect to MySQL
# 2. File → Open SQL Script
# 3. Select: DATABASE_SETUP.sql
# 4. Click Execute (Ctrl+Shift+Enter)
```

✅ Database created with 4 tables: users, refresh_tokens, user_addresses, categories

---

### Step 2: Setup Environment (1 min)

**Copy the example file:**
```powershell
Copy-Item .env.example .env
```

**Edit `.env` with your MySQL details:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password  # ← Change this!
DB_NAME=luxora_jewelry
PORT=5000
```

---

### Step 3: Install Dependencies (1 min)

```powershell
npm install
```

This installs all required packages:
- express (web framework)
- mysql2 (database)
- bcrypt (password hashing)
- jsonwebtoken (JWT)
- And more...

---

### Step 4: Start Server (1 min)

**Development mode (recommended):**
```powershell
npm run dev
```

**You should see:**
```
✅ Server running on http://localhost:5000
📚 API Documentation:
   - Register: POST http://localhost:5000/api/v1/auth/register
   - Login: POST http://localhost:5000/api/v1/auth/login
   - Refresh: POST http://localhost:5000/api/v1/auth/refresh
   - Get Profile: GET http://localhost:5000/api/v1/auth/me
```

---

### Step 5: Test It! (5 min)

**Open Postman and test Register:**

1. **Create new request**
   - Method: **POST**
   - URL: `http://localhost:5000/api/v1/auth/register`
   - Body → JSON:
   ```json
   {
     "email": "test@example.com",
     "password": "Test@123456",
     "name": "Test User",
     "phone": "+1234567890"
   }
   ```
   - Click **Send**

2. **You should get:**
   ```json
   {
     "success": true,
     "message": "User created successfully",
     "data": {
       "accessToken": "eyJ...",
       "refreshToken": "eyJ...",
       "user": { "id": 1, "email": "test@example.com", ... }
     }
   }
   ```

3. **Copy the accessToken and test Login:**
   - Method: **POST**
   - URL: `http://localhost:5000/api/v1/auth/login`
   - Body:
   ```json
   {
     "email": "test@example.com",
     "password": "Test@123456"
   }
   ```
   - Click **Send** → You get new tokens!

4. **Test Get Profile:**
   - Method: **GET**
   - URL: `http://localhost:5000/api/v1/auth/me`
   - Headers → Add:
     - Key: `Authorization`
     - Value: `Bearer <your_accessToken>`
   - Click **Send** → You see your profile!

---

## ✅ Success Checklist

- [x] Database created in MySQL
- [x] `.env` file configured
- [x] `npm install` completed
- [x] Server running on port 5000
- [x] Register endpoint working
- [x] Login endpoint working
- [x] Get Profile endpoint working

---

## 🎯 What You Have Now

**Complete Authentication System:**
- ✅ User Registration
- ✅ User Login
- ✅ Token Refresh
- ✅ Get User Profile
- ✅ Password Hashing
- ✅ JWT Security
- ✅ Database Setup
- ✅ Error Handling

**Database Tables:**
- ✅ `users` - User accounts
- ✅ `refresh_tokens` - Token management
- ✅ `user_addresses` - Address storage
- ✅ `categories` - Product categories

---

## 📁 Project Structure Created

```
luxora-backend/
├── config/
│   ├── database.js
│   └── constants.js
├── src/
│   ├── utils/
│   │   ├── jwt.js
│   │   └── hash.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── repositories/
│   │   └── user.repository.js
│   ├── services/
│   │   └── auth.service.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── app.js
├── server.js
├── package.json
├── .env
├── .env.example
├── DATABASE_SETUP.sql
├── README.md
└── QUICK_START.md (this file)
```

---

## 🔧 Common Commands

**Start server (dev mode with auto-reload):**
```powershell
npm run dev
```

**Start server (production mode):**
```powershell
npm start
```

**Stop server:**
```
Press Ctrl+C
```

**View logs:**
```
Check terminal output while server is running
```

---

## 🚨 Troubleshooting

**"Port 5000 already in use"**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**"Cannot connect to database"**
1. Ensure MySQL is running
2. Check credentials in `.env`
3. Verify database exists: `luxora_jewelry`

**"Email already exists error"**
- That email is already registered
- Use a different email to register

**"Invalid token error"**
- Token might be expired
- Use refresh token to get new access token

---

## 📞 Next Steps

### Ready to integrate with frontend?

1. **Update Angular Auth Service** to call these APIs instead of mock data
2. **Add HTTP Interceptor** to include JWT token in requests
3. **Update app.config.ts** to import HttpClientModule

### Ready to build Phase 2 (Products)?

- I can create Product APIs
- Shopping cart endpoints
- Product categories

---

## ✨ Phase 1 Status

| Feature | Status |
|---------|--------|
| Database Setup | ✅ Complete |
| User Registration | ✅ Complete |
| User Login | ✅ Complete |
| Token Refresh | ✅ Complete |
| Get Profile | ✅ Complete |
| Password Hashing | ✅ Complete |
| JWT Security | ✅ Complete |
| Error Handling | ✅ Complete |

---

**You're ready to go! 🎉**

Questions? Check README.md for detailed documentation.
