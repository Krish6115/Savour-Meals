# Quick Start Guide

## 🚀 Step-by-Step Setup

### Step 1: Create .env File

1. In the `server` folder, create a new file named `.env`
2. Copy the contents from `env.template` file
3. Update the required fields (see below)

**OR** use this command in PowerShell (in the server directory):
```powershell
Copy-Item env.template .env
```

### Step 2: Required Configuration (MUST DO)

#### A. MongoDB Connection String

**Option 1: MongoDB Atlas (Free Cloud Database - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a FREE cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<username>` with your database username
8. Add `/savour-meals` before `?retryWrites=true`

Example result:
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/savour-meals?retryWrites=true&w=majority
```

**Option 2: Local MongoDB** (if installed locally)
```env
MONGODB_URI=mongodb://localhost:27017/savour-meals
```

#### B. JWT Secret (Already Generated!)

A random JWT secret has been generated for you. It's already in the template file. 
If you want to generate a new one:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Optional Configuration (Skip for Now)

- **Firebase**: Only if you want push notifications (can add later)
- **Email**: Only if you want email notifications (can add later)

Leave these commented out for now.

### Step 4: Install nodemon (Optional but Recommended)

For auto-restart during development:
```powershell
npm install -g nodemon
```

Or install locally:
```powershell
npm install --save-dev nodemon
```

### Step 5: Start the Server

```powershell
npm start
```

Or with auto-restart:
```powershell
npm run dev
```

### Step 6: Verify It's Working

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Savour Meals API is running",
  "timestamp": "2024-..."
}
```

## ✅ Checklist

- [ ] Created `.env` file from `env.template`
- [ ] Updated `MONGODB_URI` with your MongoDB connection string
- [ ] Verified `JWT_SECRET` is set (already generated)
- [ ] Started the server (`npm start`)
- [ ] Tested health endpoint (http://localhost:5000/api/health)

## 🎯 What's Next?

Once the server is running:
1. ✅ Backend is ready!
2. ⏭️ Set up frontend (React app)
3. ⏭️ Connect frontend to backend
4. ⏭️ Test the complete application

## 📝 Summary of Required .env Values

```env
# Minimum required to start:
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=3e6ae6ddead1281fa4045a9c6a86e202ddf5ca22712c352a77cb54f8d7d55556
FRONTEND_URL=http://localhost:3000
```

That's it! You're ready to go! 🎉


