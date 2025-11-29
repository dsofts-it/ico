# 🎯 API Endpoints & Credentials for Flutter

## 🔑 CREDENTIALS (Copy to Flutter)

```dart
// lib/config/api_config.dart

class ApiConfig {
  // ✅ BASE URL - ONLY CREDENTIAL YOU NEED
  static const String BASE_URL = 'https://nirv-ico.onrender.com/api';

  // ✅ NO OTHER CREDENTIALS NEEDED
  // All backend services (Twilio, PhonePe, MongoDB) are configured on server
}
```

---

## 📍 ALL API ENDPOINTS

### **AUTHENTICATION** (No Token Required)

| Method | Endpoint                    | Purpose                 |
| ------ | --------------------------- | ----------------------- |
| POST   | `/auth/signup/mobile-init`  | Start mobile signup     |
| POST   | `/auth/signup/verify`       | Verify OTP after signup |
| POST   | `/auth/login/mobile-init`   | Request login OTP       |
| POST   | `/auth/login/mobile-verify` | Verify login OTP        |
| POST   | `/auth/login/pin`           | Login with PIN          |

### **USER** (Token Required)

| Method | Endpoint          | Purpose                          |
| ------ | ----------------- | -------------------------------- |
| POST   | `/auth/pin/setup` | Setup PIN after signup           |
| GET    | `/user/profile`   | Get user profile & referral code |

### **WALLET** (Token Required)

| Method | Endpoint               | Purpose                 |
| ------ | ---------------------- | ----------------------- |
| GET    | `/wallet/summary`      | Get wallet balance      |
| POST   | `/wallet/topup`        | Add money via PhonePe   |
| GET    | `/wallet/transactions` | Get transaction history |
| POST   | `/wallet/withdraw`     | Request withdrawal      |

### **ICO TRADING** (Token Required except price)

| Method | Endpoint            | Purpose                     |
| ------ | ------------------- | --------------------------- |
| GET    | `/ico/price`        | Get token price (public)    |
| GET    | `/ico/summary`      | Get user holdings           |
| POST   | `/ico/buy`          | Buy tokens via PhonePe      |
| POST   | `/ico/sell`         | Sell tokens                 |
| GET    | `/ico/transactions` | Get ICO transaction history |

### **REFERRAL** (Token Required)

| Method | Endpoint                  | Purpose               |
| ------ | ------------------------- | --------------------- |
| GET    | `/user/referral/earnings` | Get referral earnings |
| GET    | `/user/referral/network`  | Get referral network  |

---

## 📝 REQUEST/RESPONSE EXAMPLES

### 1. SIGNUP

**Request:**

```dart
POST https://nirv-ico.onrender.com/api/auth/signup/mobile-init

Body:
{
  "name": "John Doe",
  "mobile": "+919876543210",
  "referralCode": "ICO123ABC"  // Optional
}
```

**Response:**

```json
{
  "message": "Signup initiated. OTP sent to mobile.",
  "userId": "674a1b2c3d4e5f6789abcdef"
}
```

---

### 2. VERIFY OTP

**Request:**

```dart
POST https://nirv-ico.onrender.com/api/auth/signup/verify

Body:
{
  "userId": "674a1b2c3d4e5f6789abcdef",
  "otp": "123456",
  "type": "mobile"
}
```

**Response:**

```json
{
  "_id": "674a1b2c3d4e5f6789abcdef",
  "name": "John Doe",
  "mobile": "+919876543210",
  "isMobileVerified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

⚠️ **SAVE THE TOKEN!**

---

### 3. SETUP PIN

**Request:**

```dart
POST https://nirv-ico.onrender.com/api/auth/pin/setup

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}

Body:
{
  "pin": "1234"
}
```

**Response:**

```json
{
  "message": "PIN setup successful"
}
```

---

### 4. LOGIN WITH PIN

**Request:**

```dart
POST https://nirv-ico.onrender.com/api/auth/login/pin

Body:
{
  "identifier": "+919876543210",
  "pin": "1234"
}
```

**Response:**

```json
{
  "_id": "674a1b2c3d4e5f6789abcdef",
  "name": "John Doe",
  "mobile": "+919876543210",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

⚠️ **SAVE THE TOKEN!**

---

### 5. GET WALLET BALANCE

**Request:**

```dart
GET https://nirv-ico.onrender.com/api/wallet/summary

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "wallet": {
    "balance": 5000.00,
    "currency": "INR",
    "totalCredited": 10000.00,
    "totalDebited": 5000.00
  },
  "recentTransactions": [...]
}
```

---

### 6. ADD MONEY TO WALLET

**Request:**

```dart
POST https://nirv-ico.onrender.com/api/wallet/topup

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}

Body:
{
  "amount": 1000,
  "redirectUrl": "myapp://wallet/success"
}
```

**Response:**

```json
{
  "wallet": {
    "balance": 5000.0,
    "currency": "INR"
  },
  "transaction": {
    "_id": "674a1b2c3d4e5f6789abcdef",
    "amount": 1000,
    "status": "initiated"
  },
  "paymentSession": {
    "endpoint": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
    "request": "eyJtZXJjaGFudElkIjoiTUVSQ0hBTlRfSUQi...",
    "checksum": "abc123def456...###1"
  }
}
```

→ **Use paymentSession to open PhonePe WebView**

---

### 7. GET ICO PRICE

**Request:**

```dart
GET https://nirv-ico.onrender.com/api/ico/price

// No headers needed (public endpoint)
```

**Response:**

```json
{
  "tokenSymbol": "ICOX",
  "price": 10
}
```

---

### 8. GET ICO HOLDINGS

**Request:**

```dart
GET https://nirv-ico.onrender.com/api/ico/summary

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "tokenSymbol": "ICOX",
  "price": 10,
  "balance": 100,
  "valuation": 1000
}
```

---

### 9. BUY ICO TOKENS

**Request:**

```dart
POST https://nirv-ico.onrender.com/api/ico/buy

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}

Body (Option 1 - Specify amount):
{
  "fiatAmount": 1000
}

OR

Body (Option 2 - Specify tokens):
{
  "tokenAmount": 100
}
```

**Response:**

```json
{
  "transaction": {
    "_id": "674a1b2c3d4e5f6789abcdef",
    "tokenAmount": 100,
    "fiatAmount": 1000,
    "status": "initiated"
  },
  "paymentSession": {
    "endpoint": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
    "request": "eyJtZXJjaGFudElkIjoiTUVSQ0hBTlRfSUQi...",
    "checksum": "abc123def456...###1"
  }
}
```

→ **Use paymentSession to open PhonePe WebView**
→ **After payment, tokens auto-credited & MLM commissions distributed!**

---

### 10. SELL ICO TOKENS

**Request:**

```dart
POST https://nirv-ico.onrender.com/api/ico/sell

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}

Body:
{
  "tokenAmount": 50
}
```

**Response:**

```json
{
  "transaction": {
    "_id": "674a1b2c3d4e5f6789abcdef",
    "tokenAmount": 50,
    "fiatAmount": 500,
    "status": "pending"
  },
  "payoutNote": "Admin needs to process payout manually or via PhonePe Payouts."
}
```

---

### 11. GET USER PROFILE

**Request:**

```dart
GET https://nirv-ico.onrender.com/api/user/profile

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "_id": "674a1b2c3d4e5f6789abcdef",
  "name": "John Doe",
  "mobile": "+919876543210",
  "referralCode": "ICO123ABC",
  "referralLevel": 2,
  "referralWalletBalance": 1500.0,
  "referralTotalEarned": 5000.0,
  "referralDownlineCounts": [8, 15, 20, 5, 2, 0, 0, 0, 0]
}
```

---

### 12. GET REFERRAL EARNINGS

**Request:**

```dart
GET https://nirv-ico.onrender.com/api/user/referral/earnings?page=1&limit=50

Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "earnings": [
    {
      "_id": "674a1b2c3d4e5f6789abcdef",
      "sourceUser": {
        "name": "Jane Smith",
        "mobile": "+919876543211"
      },
      "sourceType": "ico",
      "depth": 0,
      "percentage": 5,
      "amount": 50.0,
      "currency": "INR",
      "createdAt": "2025-11-29T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "hasMore": true
  }
}
```

---

## 🔐 AUTHENTICATION FLOW

```
1. User enters mobile number
   ↓
2. Call POST /auth/signup/mobile-init
   ↓
3. User receives OTP via SMS
   ↓
4. User enters OTP
   ↓
5. Call POST /auth/signup/verify
   ↓
6. Receive TOKEN → Save in secure storage
   ↓
7. Call POST /auth/pin/setup with token
   ↓
8. User can now login with PIN or OTP
```

---

## 💻 FLUTTER CODE

### API Service Class

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String BASE_URL = 'https://nirv-ico.onrender.com/api';

  // POST Request
  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body, {
    String? token,
  }) async {
    final url = Uri.parse('$BASE_URL$endpoint');

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Error');
    }
  }

  // GET Request
  static Future<Map<String, dynamic>> get(
    String endpoint, {
    String? token,
  }) async {
    final url = Uri.parse('$BASE_URL$endpoint');

    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Error');
    }
  }
}
```

### Token Storage

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static final _storage = FlutterSecureStorage();

  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  static Future<void> clearToken() async {
    await _storage.delete(key: 'jwt_token');
  }
}
```

### Usage Examples

```dart
// 1. Signup
final result = await ApiService.post('/auth/signup/mobile-init', {
  'name': 'John Doe',
  'mobile': '+919876543210',
  'referralCode': 'ICO123ABC',
});
final userId = result['userId'];

// 2. Verify OTP
final result = await ApiService.post('/auth/signup/verify', {
  'userId': userId,
  'otp': '123456',
  'type': 'mobile',
});
final token = result['token'];
await StorageService.saveToken(token);

// 3. Setup PIN
await ApiService.post('/auth/pin/setup', {
  'pin': '1234',
}, token: token);

// 4. Login with PIN
final result = await ApiService.post('/auth/login/pin', {
  'identifier': '+919876543210',
  'pin': '1234',
});
final token = result['token'];
await StorageService.saveToken(token);

// 5. Get Wallet Balance
final token = await StorageService.getToken();
final result = await ApiService.get('/wallet/summary', token: token);
final balance = result['wallet']['balance'];

// 6. Buy ICO Tokens
final result = await ApiService.post('/ico/buy', {
  'fiatAmount': 1000,
}, token: token);
final paymentSession = result['paymentSession'];
// Open PhonePe WebView with paymentSession
```

---

## 📦 REQUIRED PACKAGES

```yaml
# pubspec.yaml

dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  webview_flutter: ^4.4.4
```

---

## ✅ SUMMARY

### Credentials:

```dart
BASE_URL = 'https://nirv-ico.onrender.com/api'
```

### Total Endpoints: 15

- **Auth:** 5 endpoints
- **Wallet:** 4 endpoints
- **ICO:** 5 endpoints
- **Referral:** 2 endpoints

### Authentication:

- Use JWT token in `Authorization: Bearer {token}` header
- Store token securely using `flutter_secure_storage`

### Payment:

- PhonePe integration via WebView
- Backend handles all payment processing
- Balance/tokens auto-updated after payment

### MLM:

- Commissions auto-distributed on ICO purchases
- 9 levels (0-8)
- Rates: 5%, 15%, 10%, 8%, 5%, 3%, 2%, 1%, 1%

---

**🚀 Copy the code above and start building!**

**API is live at:** `https://nirv-ico.onrender.com/api`
