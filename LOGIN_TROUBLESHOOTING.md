# Login 401 Error - Complete Troubleshooting Guide

## Quick Fix Steps

### Step 1: Fix/Verify Admin User
```bash
cd drip_drop_backend
npm run fix:admin
```

This script will:
- Check if admin user exists
- Verify/fix password
- Ensure role is set to 'admin'
- Test password authentication

### Step 2: Verify Backend is Running
```bash
cd drip_drop_backend
npm run dev
```

You should see: `🚀 Server running on port 5000`

### Step 3: Test Backend Connection
Open browser and visit: `http://localhost:5000/api/health`

Should return: `{"status":"OK","message":"..."}`

### Step 4: Test Login Credentials
```bash
cd drip_drop_backend
npm run test:login
```

This verifies if the admin user exists and password matches.

## Common Error Messages & Solutions

### 1. "Invalid email or password" (401 Unauthorized)

**Possible Causes:**
- Admin user doesn't exist
- Password is incorrect or not hashed properly
- Email case mismatch
- User role is not 'admin'

**Solutions:**
```bash
# Fix admin user (recommended)
npm run fix:admin

# Or create new admin
npm run seed:admin

# Test login
npm run test:login
```

### 2. "ERR_BLOCKED_BY_CLIENT"

**Cause:** Browser extension (ad blocker, privacy extension) is blocking the API request.

**Solutions:**
1. Disable browser extensions temporarily
2. Add `http://localhost:5000` to extension whitelist
3. Use incognito/private browsing mode
4. Try a different browser

### 3. "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"

**Same as above** - This is a browser extension blocking the request.

### 4. "Cannot connect to server"

**Possible Causes:**
- Backend server is not running
- Wrong port (should be 5000)
- CORS issues
- Firewall blocking connection

**Solutions:**
1. Start backend: `npm run dev`
2. Check port: Should be 5000
3. Verify CORS settings in `server.js`
4. Check firewall/antivirus settings

### 5. "TikTok Pixel" Warning

**This is NOT related to login** - It's just a warning about TikTok Pixel configuration. You can ignore it or remove TikTok Pixel code if not needed.

## Admin Credentials

**Email:** `admin@dripdrop.com`  
**Password:** `admin123`

⚠️ **Important:** Change password in production!

## Step-by-Step Debugging

### 1. Check Backend Logs
Look at the terminal where backend is running. You should see:
- `Login attempt failed: User not found for email: ...` OR
- `Login attempt failed: Password mismatch for user: ...` OR
- `Login successful for user: ..., role: admin`

### 2. Check Browser Console
Open DevTools (F12) → Console tab:
- Look for error messages
- Check Network tab for failed requests
- Verify request URL: `http://localhost:5000/api/auth/login`

### 3. Test API Directly
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dripdrop.com","password":"admin123"}'
```

Expected response:
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

### 4. Verify MongoDB Connection
Check backend terminal for:
- `MongoDB Connected` message
- No connection errors

### 5. Check Environment Variables
Ensure `.env` file exists with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

## Manual Database Check

If you have MongoDB access:

```javascript
// Find admin user
db.users.findOne({ email: "admin@dripdrop.com" })

// Check if password is hashed (should be a long string)
// Check if role is "admin"
```

## Reset Admin User

If nothing works, delete and recreate:

```bash
# Option 1: Use fix script (recommended)
npm run fix:admin

# Option 2: Delete and recreate
# In MongoDB:
db.users.deleteOne({ email: "admin@dripdrop.com" })
# Then:
npm run seed:admin
```

## Still Having Issues?

1. **Clear browser storage:**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Restart both servers:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Start backend: `npm run dev`
   - Start frontend: `npm run dev`

3. **Check for typos:**
   - Email: `admin@dripdrop.com` (exact, no spaces)
   - Password: `admin123` (exact, no spaces)

4. **Verify API URL:**
   - Frontend should use: `http://localhost:5000/api`
   - Check `drip_drop_frontend/src/config/api.js`

5. **Check CORS:**
   - Backend should allow: `http://localhost:3000`
   - Check `server.js` CORS configuration

## Success Indicators

✅ Backend shows: `Login successful for user: admin@dripdrop.com, role: admin`  
✅ Browser console shows successful login  
✅ Redirects to `/admin` page  
✅ Admin dashboard loads correctly

