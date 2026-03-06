# MongoDB Atlas Setup - Step by Step

## After Creating Your Cluster

### Step 1: Create Database User (Required)
1. In MongoDB Atlas dashboard, click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `savourmeals`)
5. Enter a strong password (SAVE THIS - you'll need it!)
   - Click "Autogenerate Secure Password" if you want
   - Copy and save the password immediately
6. Under "Database User Privileges", select **"Atlas admin"** (or "Read and write to any database")
7. Click **"Add User"**

### Step 2: Configure Network Access (Required)
1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Add Current IP Address"** button (easiest option)
   - OR click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Click **"Confirm"**

### Step 3: Get Connection String
1. Click **"Database"** (left sidebar) - or "Browse Collections"
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose **"Node.js"** as driver
5. Copy the connection string (looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 4: Update Your .env File
1. Open your `.env` file in the `server` folder
2. Take the connection string you copied
3. Replace `<username>` with your database username (from Step 1)
4. Replace `<password>` with your database password (from Step 1)
5. Add `/savour-meals` before `?retryWrites` (this is your database name)

**Example:**

If your connection string is:
```
mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

And your username is `savourmeals` and password is `MyPass123!`

Your final MONGODB_URI should be:
```
mongodb+srv://savourmeals:MyPass123!@cluster0.abc123.mongodb.net/savour-meals?retryWrites=true&w=majority
```

**Important:** 
- Remove the `<` and `>` brackets
- Keep the `@` symbol
- Add `/savour-meals` before the `?` 
- Make sure there are NO spaces

### Step 5: Test the Connection
1. Save the `.env` file
2. Start your server:
   ```powershell
   cd "C:\Users\Shreshta\OneDrive\Desktop\labmentix\savour meal\server"
   npm start
   ```
3. You should see:
   ```
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running in development mode on port 5000
   ```
4. Test in browser: http://localhost:5000/api/health

## Troubleshooting

### Error: "Authentication failed"
- Check your username and password are correct
- Make sure you removed `<` and `>` brackets
- Verify the user was created in "Database Access"

### Error: "IP not whitelisted"
- Go to "Network Access" in Atlas
- Make sure your IP address is added
- Try "Allow Access from Anywhere" (0.0.0.0/0) for testing

### Error: "Connection timeout"
- Check your internet connection
- Verify the cluster is created (not still deploying)
- Wait 2-3 minutes after creating cluster before connecting

## Quick Checklist

After creating cluster:
- [ ] Created database user (username + password saved)
- [ ] Added IP address to Network Access
- [ ] Got connection string from "Connect your application"
- [ ] Updated .env file with correct MONGODB_URI
- [ ] Tested server connection successfully

