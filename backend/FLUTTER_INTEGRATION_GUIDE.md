# Flutter App Integration Guide - Complete Flow

## 🚀 Backend API Base URL

```
Production: https://nirv-ico.onrender.com/api
Local Development: http://localhost:5000/api
```

---

## 📱 Complete App Flow for Flutter Integration

### **Flow Overview**

1. **Signup with Mobile** → OTP Verification → Account Created
2. **Setup PIN** → Secure PIN for quick login
3. **Login Options** → Mobile + OTP OR Mobile + PIN
4. **Wallet Section** → Add Money via PhonePe → View Balance & Transactions
5. **Profile Section** → View/Edit Profile → Manage Addresses
6. **ICO Token Trading** → Buy/Sell Tokens → View Holdings

---

## 🔐 Authentication Flow

### **1. Mobile Signup Flow**

#### Step 1: Initiate Mobile Signup

**Endpoint:** `POST /auth/signup/mobile-init`

**Request:**

```json
{
  "name": "John Doe",
  "mobile": "9876543210"
}
```

**Response (Success):**

```json
{
  "message": "Signup initiated. OTP sent to mobile.",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Flutter Implementation:**

- Show mobile number input screen
- Validate mobile number (10 digits)
- Call API and store `userId` for next step
- Navigate to OTP verification screen

---

#### Step 2: Verify OTP

**Endpoint:** `POST /auth/signup/verify`

**Request:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "otp": "123456",
  "type": "mobile"
}
```

**Response (Success):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "isEmailVerified": false,
  "isMobileVerified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Flutter Implementation:**

- Show OTP input screen (6 digits)
- Add resend OTP functionality (call signup-init again)
- Store JWT token securely (use flutter_secure_storage)
- Store user data locally
- Navigate to PIN setup screen

---

### **2. PIN Setup Flow**

**Endpoint:** `POST /auth/pin/setup`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request:**

```json
{
  "pin": "1234"
}
```

**Response (Success):**

```json
{
  "message": "PIN setup successful"
}
```

**Flutter Implementation:**

- Show PIN creation screen (4-6 digits)
- Confirm PIN (enter twice)
- Store PIN setup status locally
- Navigate to home/dashboard

---

### **3. Login Flow**

#### Option A: Login with Mobile + OTP

**Step 1: Request OTP**
**Endpoint:** `POST /auth/login/mobile-init`

**Request:**

```json
{
  "mobile": "9876543210"
}
```

**Response:**

```json
{
  "message": "OTP sent to mobile"
}
```

**Step 2: Verify OTP and Login**
**Endpoint:** `POST /auth/login/mobile-verify`

**Request:**

```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "email": null,
  "role": "user",
  "isEmailVerified": false,
  "isMobileVerified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Option B: Login with Mobile + PIN (Faster)

**Endpoint:** `POST /auth/login/pin`

**Request:**

```json
{
  "identifier": "9876543210",
  "pin": "1234"
}
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Flutter Implementation:**

- Check if user has PIN setup
- If yes, show PIN login screen
- If no, show OTP login flow
- Store token and navigate to home

---

## 💰 Wallet Section - PhonePe Integration

### **Add Money to Wallet Flow**

**Endpoint:** `POST /orders`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request:**

```json
{
  "items": [
    {
      "product": "wallet_topup_product_id",
      "quantity": 1,
      "price": 500
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "line1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "IN"
  }
}
```

**Response (Success):**

```json
{
  "order": {
    "_id": "order_123456",
    "user": "507f1f77bcf86cd799439011",
    "totalAmount": 500,
    "paymentStatus": "pending",
    "orderStatus": "pending"
  },
  "paymentSession": {
    "merchantTransactionId": "TXN_1234567890",
    "base64Payload": "ewogICJtZXJjaGFudElkIjogIk1fVEVTVCIsCiAgIm1lcmNoYW50VHJhbnNhY3Rpb25JZCI6ICJUWU5fMTIzNDU2Nzg5MCIsCiAgImFtb3VudCI6IDUwMDAwLAogICJjYWxsYmFja1VybCI6ICJodHRwczovL25pcnYtaWNvLm9ucmVuZGVyLmNvbS9hcGkvcGF5bWVudHMvcGhvbmVwZS9jYWxsYmFjayIKfQ==",
    "checksum": "abc123def456...",
    "redirectUrl": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
  }
}
```

**Flutter Implementation:**

1. User enters amount to add
2. Create order with wallet topup item
3. Receive PhonePe payment session
4. Use WebView or URL launcher to redirect user to PhonePe:
   ```dart
   final url = '${paymentSession.redirectUrl}/${paymentSession.base64Payload}';
   // Add checksum as header: X-VERIFY: ${paymentSession.checksum}
   ```
5. PhonePe will redirect back to callback URL
6. Poll order status or use webhook to update payment status
7. Show success/failure message

---

### **View Wallet Balance**

**Endpoint:** `GET /ico/summary`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "tokenSymbol": "ICOX",
  "pricePerToken": 10,
  "totalTokens": 100,
  "totalInvestedINR": 1000,
  "currentValueINR": 1000,
  "profitLoss": 0,
  "profitLossPercent": 0
}
```

---

### **View Transaction History**

**Endpoint:** `GET /ico/transactions`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
[
  {
    "_id": "txn_123",
    "type": "buy",
    "tokens": 50,
    "pricePerToken": 10,
    "totalAmountINR": 500,
    "paymentStatus": "completed",
    "createdAt": "2025-11-29T10:30:00.000Z"
  },
  {
    "_id": "txn_124",
    "type": "sell",
    "tokens": 10,
    "pricePerToken": 10,
    "totalAmountINR": 100,
    "paymentStatus": "pending",
    "createdAt": "2025-11-29T11:00:00.000Z"
  }
]
```

---

## 🪙 ICO Token Trading

### **Get Current Token Price**

**Endpoint:** `GET /ico/price`

**No Authentication Required**

**Response:**

```json
{
  "symbol": "ICOX",
  "priceINR": 10
}
```

---

### **Buy Tokens**

**Endpoint:** `POST /ico/buy`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request:**

```json
{
  "tokens": 100
}
```

**Response:**

```json
{
  "transaction": {
    "_id": "txn_789",
    "type": "buy",
    "tokens": 100,
    "pricePerToken": 10,
    "totalAmountINR": 1000,
    "paymentStatus": "pending"
  },
  "paymentSession": {
    "merchantTransactionId": "ICO_BUY_1234567890",
    "base64Payload": "...",
    "checksum": "...",
    "redirectUrl": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
  }
}
```

**Flutter Implementation:**

- Same as wallet topup
- Redirect to PhonePe for payment
- Update transaction status after payment

---

### **Sell Tokens**

**Endpoint:** `POST /ico/sell`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request:**

```json
{
  "tokens": 50
}
```

**Response:**

```json
{
  "message": "Sell request submitted",
  "transaction": {
    "_id": "txn_790",
    "type": "sell",
    "tokens": 50,
    "pricePerToken": 10,
    "totalAmountINR": 500,
    "paymentStatus": "pending"
  }
}
```

---

## 👤 Profile Section

### **Get User Profile**

**Endpoint:** `GET /user/profile` (You'll need to add this endpoint or use the token payload)

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (from JWT token):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "email": null,
  "role": "user",
  "isEmailVerified": false,
  "isMobileVerified": true
}
```

---

### **Manage Addresses**

#### Get All Addresses

**Endpoint:** `GET /user/addresses`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
[
  {
    "_id": "addr_123",
    "label": "Home",
    "fullName": "John Doe",
    "phone": "9876543210",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "IN",
    "landmark": "Near ABC Mall",
    "isDefault": true
  }
]
```

---

#### Add Address

**Endpoint:** `POST /user/addresses`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request:**

```json
{
  "label": "Office",
  "fullName": "John Doe",
  "phone": "9876543210",
  "line1": "456 Business Park",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400002",
  "country": "IN"
}
```

---

#### Update Address

**Endpoint:** `PUT /user/addresses/:addressId`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request:**

```json
{
  "label": "Home (Updated)",
  "line1": "789 New Street"
}
```

---

#### Delete Address

**Endpoint:** `DELETE /user/addresses/:addressId`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

---

#### Set Default Address

**Endpoint:** `PATCH /user/addresses/:addressId/default`

**Headers:**

```
Authorization: Bearer <jwt_token>
```

---

## 🔑 API Credentials & Configuration

### **Environment Variables (Backend)**

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/auth_db

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# PhonePe Payment Gateway
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_CALLBACK_URL=https://nirv-ico.onrender.com/api/payments/phonepe/callback

# ICO Token
ICO_TOKEN_SYMBOL=ICOX
ICO_PRICE_INR=10
```

### **PhonePe Integration Details**

**Test Credentials (Sandbox):**

- Use PhonePe sandbox environment for testing
- Merchant ID and Salt Key are configured in backend
- Frontend receives `base64Payload` and `checksum`
- Redirect URL: Combine `redirectUrl` + `/` + `base64Payload`
- Add header: `X-VERIFY: {checksum}`

**Payment Flow:**

1. Backend creates payment session
2. Flutter app receives payment data
3. Open PhonePe URL in WebView/Browser
4. User completes payment
5. PhonePe calls callback URL
6. Backend updates order/transaction status
7. App polls for status update

---

## 📱 Flutter App Structure Recommendation

```
lib/
├── main.dart
├── models/
│   ├── user.dart
│   ├── transaction.dart
│   ├── address.dart
│   └── ico_summary.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── storage_service.dart
│   └── payment_service.dart
├── screens/
│   ├── auth/
│   │   ├── mobile_signup_screen.dart
│   │   ├── otp_verification_screen.dart
│   │   ├── pin_setup_screen.dart
│   │   └── login_screen.dart
│   ├── wallet/
│   │   ├── wallet_screen.dart
│   │   ├── add_money_screen.dart
│   │   └── transaction_history_screen.dart
│   ├── ico/
│   │   ├── ico_dashboard_screen.dart
│   │   ├── buy_tokens_screen.dart
│   │   └── sell_tokens_screen.dart
│   └── profile/
│       ├── profile_screen.dart
│       └── address_management_screen.dart
└── widgets/
    ├── custom_button.dart
    ├── custom_text_field.dart
    └── loading_indicator.dart
```

---

## 🔧 Required Flutter Packages

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP & API
  http: ^1.1.0
  dio: ^5.4.0

  # State Management
  provider: ^6.1.1
  # OR
  riverpod: ^2.4.9

  # Secure Storage
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2

  # UI Components
  pin_code_fields: ^8.0.1
  otp_text_field: ^1.1.3

  # WebView for PhonePe
  webview_flutter: ^4.4.2
  url_launcher: ^6.2.2

  # Utils
  intl: ^0.19.0
  logger: ^2.0.2
```

---

## 🤖 AI Integration Prompt for Codex

```
Create a complete Flutter mobile application with the following features:

BASE API URL: https://nirv-ico.onrender.com/api

AUTHENTICATION FLOW:
1. Mobile Signup Screen
   - Input: Name, Mobile Number (10 digits)
   - API: POST /auth/signup/mobile-init
   - Navigate to OTP screen with userId

2. OTP Verification Screen
   - Input: 6-digit OTP
   - API: POST /auth/signup/verify with userId, otp, type="mobile"
   - Store JWT token using flutter_secure_storage
   - Navigate to PIN setup

3. PIN Setup Screen
   - Input: 4-digit PIN (enter twice for confirmation)
   - API: POST /auth/pin/setup with Authorization header
   - Navigate to home screen

4. Login Screen
   - Option A: Mobile + OTP
     * API: POST /auth/login/mobile-init → POST /auth/login/mobile-verify
   - Option B: Mobile + PIN (faster)
     * API: POST /auth/login/pin with identifier and pin
   - Store token and navigate to home

WALLET SECTION:
1. Wallet Dashboard
   - Display current balance from GET /ico/summary
   - Show recent transactions from GET /ico/transactions
   - Button to add money

2. Add Money Flow
   - User enters amount
   - Create order: POST /orders with wallet topup item
   - Receive PhonePe payment session
   - Open WebView with: {redirectUrl}/{base64Payload}
   - Add header X-VERIFY: {checksum}
   - Handle payment callback and update UI

ICO TRADING:
1. ICO Dashboard
   - Show token price: GET /ico/price
   - Display holdings: GET /ico/summary
   - Buy/Sell buttons

2. Buy Tokens
   - Input: Number of tokens
   - API: POST /ico/buy
   - Redirect to PhonePe payment
   - Update holdings after payment

3. Sell Tokens
   - Input: Number of tokens to sell
   - API: POST /ico/sell
   - Show pending status

PROFILE SECTION:
1. Profile Screen
   - Display user info from JWT token
   - Edit name, mobile (if needed)
   - Manage addresses button

2. Address Management
   - List addresses: GET /user/addresses
   - Add address: POST /user/addresses
   - Edit address: PUT /user/addresses/:id
   - Delete address: DELETE /user/addresses/:id
   - Set default: PATCH /user/addresses/:id/default

TECHNICAL REQUIREMENTS:
- Use Provider or Riverpod for state management
- Implement proper error handling with try-catch
- Show loading indicators during API calls
- Use flutter_secure_storage for JWT token
- Implement token refresh logic
- Add proper form validation
- Use custom widgets for reusable components
- Implement beautiful, modern UI with Material Design 3
- Add animations and transitions
- Handle network errors gracefully
- Implement pull-to-refresh on list screens

SECURITY:
- Store JWT token securely
- Add token to Authorization header: "Bearer {token}"
- Implement auto-logout on token expiry
- Validate all user inputs
- Use HTTPS for all API calls

UI/UX GUIDELINES:
- Clean, modern design
- Easy navigation with bottom navigation bar
- Smooth transitions between screens
- Clear error messages
- Success confirmations with animations
- Loading states for all async operations
```

---

## 🧪 Testing the Integration

### **Test Flow:**

1. **Signup Test:**

   ```bash
   curl -X POST https://nirv-ico.onrender.com/api/auth/signup/mobile-init \
   -H "Content-Type: application/json" \
   -d '{"name":"Test User","mobile":"9999999999"}'
   ```

2. **Check OTP in Backend Logs** (or use Twilio if configured)

3. **Verify OTP:**

   ```bash
   curl -X POST https://nirv-ico.onrender.com/api/auth/signup/verify \
   -H "Content-Type: application/json" \
   -d '{"userId":"USER_ID","otp":"123456","type":"mobile"}'
   ```

4. **Setup PIN:**

   ```bash
   curl -X POST https://nirv-ico.onrender.com/api/auth/pin/setup \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"pin":"1234"}'
   ```

5. **Login with PIN:**
   ```bash
   curl -X POST https://nirv-ico.onrender.com/api/auth/login/pin \
   -H "Content-Type: application/json" \
   -d '{"identifier":"9999999999","pin":"1234"}'
   ```

---

## 📞 Support & Documentation

- **Backend Repository:** https://github.com/dsofts-it/ico
- **API Documentation:** See README.md and API_TESTING_GUIDE.md
- **Postman Collection:** Import ICO_Full_App_Flow.postman_collection.json

---

## ⚠️ Important Notes

1. **OTP Handling:**

   - In development, OTPs are logged to console
   - In production, configure Twilio credentials for real SMS
   - OTP expires in 10 minutes
   - Can regenerate OTP by calling signup-init again

2. **PhonePe Integration:**

   - Use sandbox for testing
   - Switch to production credentials before launch
   - Test payment flow thoroughly
   - Handle all payment statuses: pending, completed, failed

3. **Token Management:**

   - JWT tokens expire in 30 days
   - Implement token refresh mechanism
   - Clear token on logout
   - Handle 401 errors (unauthorized)

4. **Error Handling:**

   - 400: Bad Request (validation errors)
   - 401: Unauthorized (invalid/expired token)
   - 403: Forbidden (unverified account)
   - 404: Not Found
   - 500: Server Error

5. **Mobile Number Format:**
   - Accept 10-digit Indian mobile numbers
   - Can add country code support if needed
   - Validate format before API call

---

## 🎯 Next Steps

1. ✅ Review this integration guide
2. ✅ Set up Flutter project with required packages
3. ✅ Implement authentication flow
4. ✅ Test signup and login
5. ✅ Implement wallet section
6. ✅ Integrate PhonePe payments
7. ✅ Add ICO trading features
8. ✅ Build profile section
9. ✅ Test complete flow end-to-end
10. ✅ Deploy and monitor

---

**Ready to integrate! 🚀**
