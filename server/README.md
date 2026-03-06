# Savour Meals - Backend Server

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/savour-meals?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Firebase Cloud Messaging (Optional - for push notifications)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Email Configuration (Optional - for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Run the Server

Development mode (with nodemon - auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Food Donations
- `POST /api/food/create` - Create donation (Donor only)
- `GET /api/food/pending` - Get pending donations (NGO only)
- `GET /api/food/donor/:donorId` - Get donor's donations
- `PUT /api/food/accept/:id` - Accept donation (NGO only)
- `PUT /api/food/reject/:id` - Reject donation (NGO only)
- `PUT /api/food/status/:id` - Update status (NGO/Volunteer)

### NGO Routes
- `GET /api/ngo/requests` - Get all requests
- `POST /api/ngo/assign/:donationId` - Assign volunteer
- `GET /api/ngo/volunteers` - Get available volunteers

### Volunteer Routes
- `GET /api/volunteer/tasks` - Get assigned tasks
- `PUT /api/volunteer/task/:id` - Update task status
- `GET /api/volunteer/history` - Get delivery history

## Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── foodController.js     # Food donation logic
│   ├── ngoController.js      # NGO operations
│   └── volunteerController.js # Volunteer operations
├── middleware/
│   ├── auth.js               # JWT authentication
│   └── roleCheck.js          # Role-based access control
├── models/
│   ├── User.js               # User model
│   ├── FoodDonation.js       # Food donation model
│   └── Delivery.js           # Delivery tracking model
├── routes/
│   ├── auth.js               # Auth routes
│   ├── food.js               # Food routes
│   ├── ngo.js                # NGO routes
│   └── volunteer.js          # Volunteer routes
├── utils/
│   ├── generateToken.js      # JWT token generation
│   ├── notifications.js      # Firebase push notifications
│   └── email.js              # Email notifications
├── server.js                 # Main entry point
└── package.json
```

