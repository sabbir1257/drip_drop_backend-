# Fix 401 Login Error - Step by Step Guide

## Quick Fix Steps

### Step 1: Verify Backend is Running
```bash
cd drip_drop_backend
npm run dev
```
You should see: `🚀 Server running on port 5000`

### Step 2: Test Backend Connection
Open browser and visit: `http://localhost:5000/api/health`
Should return: `{"status":"OK","message":"..."}`

### Step 3: Create/Verify Admin User
```bash
cd drip_drop_backend
npm run seed:admin
```

### Step 4: Test Login Credentials
```bash
cd drip_drop_backend
npm run test:login
```
This will verify if the admin user exists and password matches.

### Step 5: Check Environment Variables
Make sure `.env` file has:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

## Common Causes of 401 Error

1. **User doesn't exist** - Run `npm run seed:admin`
2. **Wrong password** - Default is `admin123`
3. **Email case mismatch** - Now normalized to lowercase
4. **MongoDB not connected** - Check MONGODB_URI
5. **Backend not running** - Start with `npm run dev`

## Debug Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look at Network tab
   - Check the login request
   - See the exact error response

2. **Check Backend Logs:**
   - Look at terminal where backend is running
   - Check for any error messages

3. **Test API Directly:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@dripdrop.com","password":"admin123"}'
   ```

## Expected Response
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@dripdrop.com",
    "role": "admin"
  }
}
```

## If Still Getting 401

1. Delete existing admin and recreate:
   ```javascript
   // In MongoDB or use script
   db.users.deleteOne({ email: "admin@dripdrop.com" })
   ```
   Then run: `npm run seed:admin`

2. Check password hashing:
   - Password should be hashed with bcrypt
   - Run test script: `npm run test:login`

3. Verify email format:
   - Use exactly: `admin@dripdrop.com`
   - No spaces, correct case

