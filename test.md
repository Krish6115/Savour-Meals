# Software Testing in Savour Meals

## PART 1: Basic Understanding

### What is software testing?
Software testing is the process of evaluating and verifying that a software application or product behaves as expected. It involves checking the code for errors, bugs, or missing requirements. The main goals are to ensure functionality, reliability, performance, and security of the overall system.

### Why is software testing important in your project?
In a critical application like **Savour Meals**—which connects donors, NGOs, and volunteers to distribute food—testing is critical. It guarantees that workflows like creating a donation, securing user accounts, tracking volunteers, and sending real-time notifications operate smoothly. A logic error here (like accepting an expired food pledge or exposing donor details) could result in wasted food, missed deliveries, or compromised user privacy.

---

## PART 2: Identify in Their Own Project

### Modules in the Project
1. **Authentication & Authorization Module** (Login/Signup & Role Checks)
2. **Food Donation Module** (Creating, listing, and updating donation requests)
3. **Delivery & Volunteer Module** (Assigning tasks, status tracking)

### Module Details

#### 1. Authentication & Authorization Module
* **What can go wrong?** A user might register with an improperly formatted email or attempt to log in with incorrect credentials. Furthermore, a Donor might try to access NGO-restricted API routes (like accepting a donation).
* **What should be tested?**
  - Registration with duplicate emails.
  - Login sequence using valid/invalid credentials.
  - JWT token generation, validity, and expiry.
  - Middleware restricting routes by role (Donor vs. NGO vs. Volunteer).

#### 2. Food Donation Module
* **What can go wrong?** A donor could mistakenly define the food's shelf life backwards (expiry time before the preparation time). The provided pickup location could have missing or malformed GPS coordinates.
* **What should be tested?**
  - Expiry time validation logic (ensuring `expiryTime > preparedAt`).
  - Creation of unique OTPs for pickup.
  - Automatic filtering preventing NGOs from seeing already expired food (`expiryTime <= new Date()`).

#### 3. Delivery & Volunteer Module
* **What can go wrong?** A volunteer might try to update a delivery status to "delivered" when the food hasn't been "picked" up yet, skipping logical states.
* **What should be tested?**
  - Valid status transitions (e.g., `pending` -> `accepted` -> `picked` -> `delivered`).
  - Access control ensuring only the assigned volunteer can update tracking details.

---

## PART 3: Simple Unit Testing

Taking two specific controller functions from the project backend:
1. `register` (in `authController.js`)
2. `createDonation` (in `foodController.js`)

| Test Case | Module / Function | Input | Expected Output | Actual Output | Pass/Fail |
|-----------|-------------------|-------|-----------------|---------------|-----------|
| **TC-01** | `authController` (`register`) | `{ email: "test@ngo.com", password: "pwd" }` when email already exists in DB | HTTP 400: `{"success": false, "msg": "User already exists with this email"}` | HTTP 400: `{"success": false, "msg": "User already exists with this email"}` | **Pass** |
| **TC-02** | `authController` (`register`) | Valid new donor object: `{ name: "Bob", email: "bob@bob.com", password: "123", role: "donor" }` | HTTP 201: Successfully creates user, returns JWT `token` and user body | HTTP 201: `{"success": true, "token": "ey...", ...}` | **Pass** |
| **TC-03** | `foodController` (`createDonation`) | `{ preparedAt: "2024-05-15", expiryTime: "2024-05-14" }` (Expiry occurs before preparation) | HTTP 400: `{"success": false, "msg": "Expiry time must be after prepared time"}` | HTTP 400: `{"success": false, "msg": "Expiry time must be after prepared time"}` | **Pass** |
| **TC-04** | `foodController` (`createDonation`) | Valid food details along with valid JWT Donor Token in Authorization Header | HTTP 201: Creates donation and triggers notification to NGOs. Returns donation object | HTTP 201: `{"success": true, "donation": {...}}` | **Pass** |
| **TC-05** | `authController` (`login`) | Valid registered email but incorrect password `{"email": "abc@example.com", "password": "wrong"}` | HTTP 401: `{"success": false, "msg": "Invalid credentials"}` | HTTP 401: `{"success": false, "msg": "Invalid credentials"}` | **Pass** |
| **TC-06** | `authController` (`login`) | Valid registered email and correctly matching password | HTTP 200: Successfully authenticates, returns new JWT `token` and user body | HTTP 200: `{"success": true, "token": "ey..."}` | **Pass** |
| **TC-07** | `authController` (`getMe`) | HTTP GET request to `/api/auth/me` with valid JWT token | HTTP 200: Successfully retrieves caller's profile data (`{"success": true, "user": {...}}`) | HTTP 200: `{"success": true, "user": {...}}` | **Pass** |
| **TC-08** | `foodController` (`createDonation`) | Valid food payload but missing Authorization Header (no JWT token) | HTTP 401: `{"success": false, "msg": "No token, authorization denied"}` | HTTP 401: `{"success": false, "msg": "No token, authorization denied"}` | **Pass** |

---

## PART 4: Integration Thinking

### Interacting Modules
**Authentication Module** → **Database Module** (e.g., User Login sequence)

#### What data is passed?
During login, the client passes a JSON payload containing the user's `email` and `password`. The authentication module queries the Database Module passing the `email` to fetch the user document.

#### What happens if data is wrong?
If the format is completely wrong or missing, the controller rejects the request early with a `400 Bad Request`. If the email is completely valid but the user doesn't exist, the Database Module returns `null`, causing the Authentication handler to gracefully return a `401 Unauthorized` with the message "Invalid credentials". The same "Invalid credentials" error is provided if the password fails the bcrypt check.

### System / Validation (User Requirements)
Based on the application design, here are 3 core user requirements that dictate the system's behavior:
1. **Donation Creation (Donor)**: A registered Donor must be able to successfully submit a food donation form including the quantity, food type, expiry time, and geolocation data.
2. **Access Control (NGO)**: Only verified NGOs must be permitted to call the endpoint to scan for pending donations and "accept" or "reject" those donation listings.
3. **Data Freshness**: The system must actively prevent expired listings from appearing in the NGO's pending dashboard to ensure that volunteers never attempt to collect spoiled food.
