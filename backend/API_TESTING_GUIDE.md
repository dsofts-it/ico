# API Testing Guide - Mobile Signup for Rohan Dede

## Quick Start with Postman

### Import Collection
1. Open Postman
2. Click **Import** → **File** → Select `POSTMAN_COLLECTION.json`
3. The collection will be imported with all endpoints ready to test

## Testing Mobile Signup for Rohan Dede (8446031622)

### Step 1: Mobile Signup Init
**Endpoint:** `POST http://localhost:5000/api/auth/signup/mobile-init`

**Request Body:**
```json
{
  "name": "Rohan Dede",
  "mobile": "8446031622"
}
```

**Expected Response:**
```json
{
  "message": "Signup initiated. OTP sent to mobile.",
  "userId": "69200d3e9664fef6e9aafb10"
}
```

**Important:** Check your server console for the OTP. You'll see:
```
[MOCK SMS] OTP for 8446031622: 123456
```

### Step 2: Verify OTP
**Endpoint:** `POST http://localhost:5000/api/auth/signup/verify`

**Request Body:**
```json
{
  "userId": "69200d3e9664fef6e9aafb10",
  "otp": "123456",
  "type": "mobile"
}
```
*Replace `userId` with the one from Step 1 and `otp` with the one from server console*

**Expected Response:**
```json
{
  "_id": "69200d3e9664fef6e9aafb10",
  "name": "Rohan Dede",
  "mobile": "8446031622",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 3: Setup PIN (Optional)
**Endpoint:** `POST http://localhost:5000/api/auth/pin/setup`

**Headers:**
```
Authorization: Bearer <token_from_step_2>
```

**Request Body:**
```json
{
  "pin": "1234"
}
```

### Step 4: Login with Mobile OTP
**Endpoint:** `POST http://localhost:5000/api/auth/login/mobile-init`

**Request Body:**
```json
{
  "mobile": "8446031622"
}
```

Then verify with:
**Endpoint:** `POST http://localhost:5000/api/auth/login/mobile-verify`

**Request Body:**
```json
{
  "mobile": "8446031622",
  "otp": "<otp_from_console>"
}
```

### Step 5: Login with PIN
**Endpoint:** `POST http://localhost:5000/api/auth/login/pin`

**Request Body:**
```json
{
  "identifier": "8446031622",
  "pin": "1234"
}
```

## All Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/email-init` | Start email signup |
| POST | `/api/auth/signup/mobile-init` | Start mobile signup |
| POST | `/api/auth/signup/verify` | Verify OTP (email/mobile) |
| POST | `/api/auth/pin/setup` | Setup PIN (requires auth) |
| POST | `/api/auth/login/email` | Login with email/password |
| POST | `/api/auth/login/mobile-init` | Request mobile OTP |
| POST | `/api/auth/login/mobile-verify` | Verify mobile OTP & login |
| POST | `/api/auth/login/pin` | Login with PIN |

## Notes
- Server must be running: `node src/server.js`
- OTPs are logged to console (mock mode) unless you configure real SMTP/Twilio credentials
- JWT tokens expire in 30 days
- Mobile number format: Include country code if needed (e.g., +918446031622)
