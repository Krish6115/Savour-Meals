# Savour Meals

![Savour Meals](https://img.shields.io/badge/Status-Active-brightgreen) ![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)

**Savour Meals** is a full-stack web application designed to combat food waste by seamlessly connecting food **Donors**, **NGOs**, and **Volunteers**. Through real-time notifications, geolocation-based tracking, and role-based workflows, the platform ensures that surplus food is efficiently distributed to those in need before it perishes.

---

## 🚀 Key Features

### 1. Role-Based Access & Authentication
- Secure JWT-based authentication.
- Dedicated dashboards and workflows for **Donors**, **NGOs**, and **Volunteers**.
- Strict route protection to ensure data privacy and authorized actions.

### 2. Food Donation Module
- **Donors** can create food donation requests specifying food type, quantity, preparation time, and strict expiry timelines.
- Real-time validation preventing listings with backward/invalid expiry dates.
- Automatic filtering hides expired food from NGOs to ensure food safety.

### 3. Delivery & Volunteer Tracking
- **NGOs** can accept requests, scan for available volunteers, and assign pickup tasks.
- **Volunteers** can update real-time statuses (`pending` -> `accepted` -> `picked` -> `delivered`).
- Interactive maps using Leaflet for precise pickup and delivery locations.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, React Router, React Leaflet
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication & Security:** JSON Web Tokens (JWT), bcrypt.js
- **Notifications:** Firebase Cloud Messaging (FCM), Nodemailer

---

## 📂 Project Structure

Savour Meals is structured as a monorepo containing both the frontend and backend applications:

- `/client` - React frontend application.
- `/server` - Node.js/Express backend server.

---

## ⚙️ Quick Start

### Prerequisites
- Node.js installed
- MongoDB URI
- Firebase Service Account (optional for push notifications)
- SMTP credentials (optional for emails)

### 1. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file based on the configurations listed in `server/README.md`.
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm start
```

For detailed backend API documentation and routes, please refer to the [Server README](./server/README.md).

---

## 🧪 Testing & Reliability
The application includes robust validations covering:
- Authentication edge cases (duplicate emails, invalid passwords, token expiry).
- Logical food state validations (ensuring expiry > prepared time).
- Status transition validations for volunteer deliveries.

*For more details on our software testing approach, check out [Testing Documentation](./test.md).*