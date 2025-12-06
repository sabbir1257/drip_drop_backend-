# Quick Fix for 401 Login Error

## ✅ Admin User Has Been Created!

The admin user has been successfully created. You can now log in with:

**Email:** `admin@dripdrop.com`  
**Password:** `admin123`

## Steps to Test Login

### 1. Make Sure Backend is Running
```bash
cd drip_drop_backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server running on port 5000
```

### 2. Test Login via API (Optional)
```bash
cd drip_drop_backend
npm run test:login-api
```

This will test the login endpoint directly.

### 3. Try Logging In from Frontend
1. Make sure frontend is running: `cd drip_drop_frontend && npm run dev`
2. Go to: `http://localhost:3000/login`
3. Enter:
   - Email: `admin@dripdrop.com`
   - Password: `admin123`

## If You Still Get 401 Error

### Check Backend Terminal
Look for these messages:
- `Login attempt failed: User not found for email: ...` → Admin doesn't exist
- `Login attempt failed: Password mismatch for user: ...` → Password issue
- `Login successful for user: ..., role: admin` → Success!

### Run Fix Script Again
```bash
cd drip_drop_backend
npm run fix:admin
```

This will:
- Check if admin exists
- Verify/fix password
- Ensure role is 'admin'
- Test authentication

### Verify Database
If you have MongoDB access:
```javascript
db.users.findOne({ email: "admin@dripdrop.com" })
```

Should show:
- `email: "admin@dripdrop.com"`
- `role: "admin"`
- `password: "$2a$10$..."` (hashed)

## Common Issues

1. **Backend not running** → Start with `npm run dev`
2. **MongoDB not connected** → Check `.env` file for `MONGODB_URI`
3. **Wrong credentials** → Use exactly `admin@dripdrop.com` and `admin123`
4. **Browser cache** → Clear localStorage and try again

## Success Indicators

✅ Backend shows: `Login successful for user: admin@dripdrop.com, role: admin`  
✅ Frontend redirects to `/admin`  
✅ Admin dashboard loads

