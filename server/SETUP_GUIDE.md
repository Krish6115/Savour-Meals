# Setup Guide - Step by Step

## Step 1: Install Dependencies ✅
Dependencies are already installed! If you need to reinstall:
```bash
cd server
npm install
```

## Step 2: Set Up MongoDB Database

### Option A: MongoDB Atlas (Cloud - Recommended for Development)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (if you don't have one)
3. Create a new cluster (choose FREE tier)
4. Wait for cluster to be created (2-3 minutes)
5. Click "Connect" → "Connect your application"
6. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)
7. Replace `<username>` and `<password>` with your database user credentials
8. Add database name at the end: `...mongodb.net/savour-meals?retryWrites=true&w=majority`

### Option B: Local MongoDB
If you have MongoDB installed locally:
```env
MONGODB_URI=mongodb://localhost:27017/savour-meals
```

## Step 3: Configure Environment Variables

1. Open the `.env` file in the `server` directory
2. Update the following REQUIRED fields:

### Required Fields (Must Change):

**MONGODB_URI:**
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/savour-meals?retryWrites=true&w=majority
```

**JWT_SECRET:**
Generate a random secret key. You can:
- Option 1: Run this command in the server directory:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Option 2: Use any random string (at least 32 characters)
- Copy the output and paste it as `JWT_SECRET` value

Example:
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Optional Fields (Can Leave Empty for Now):

**Firebase Cloud Messaging** - Only if you want push notifications
**Email Configuration** - Only if you want email notifications

You can skip these for now and add them later if needed.

## Step 4: Test the Server

1. Make sure you're in the server directory:
   ```bash
   cd server
   ```

2. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart (requires nodemon):
   ```bash
   npm install -g nodemon  # Install nodemon globally (one time)
   npm run dev
   ```

3. You should see:
   ```
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running in development mode on port 5000
   ```

4. Test the health endpoint:
   - Open browser: http://localhost:5000/api/health
   - Or use curl: `curl http://localhost:5000/api/health`
   - Should return: `{"success":true,"message":"Savour Meals API is running",...}`

## Step 5: Test Authentication (Optional but Recommended)

Use Postman or curl to test:

### Register a Test User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Donor",
    "email": "donor@test.com",
    "password": "password123",
    "role": "donor",
    "phone": "1234567890",
    "location": {
      "address": "123 Test St",
      "coordinates": {"lat": 40.7128, "lng": -74.0060}
    }
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@test.com",
    "password": "password123"
  }'
```

## Common Issues & Solutions

### Issue: "MongoDB connection error"
- **Solution**: Check your `MONGODB_URI` in `.env` file
- Make sure you've replaced `<username>` and `<password>`
- For Atlas: Make sure your IP is whitelisted (Atlas → Network Access → Add IP Address → Add Current IP Address)

### Issue: "JWT_SECRET is not defined"
- **Solution**: Make sure `JWT_SECRET` is set in `.env` file
- Generate a new one using the command in Step 3

### Issue: "Port 5000 already in use"
- **Solution**: Change `PORT` in `.env` to a different port (e.g., 5001)

### Issue: Module not found errors
- **Solution**: Run `npm install` again in the server directory

## Next Steps After Setup

1. ✅ Backend is ready!
2. ⏭️ Set up the frontend (React app)
3. ⏭️ Connect frontend to backend API
4. ⏭️ Test the complete flow (Register → Login → Create Donation → etc.)

## Quick Reference

- **Server URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Base**: http://localhost:5000/api

