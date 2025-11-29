# 📱 Flutter Integration - Simple Guide

## 🔗 API Configuration

### Add This to Your Flutter App:

```dart
// lib/config/api_config.dart

class ApiConfig {
  // ✅ ONLY CREDENTIAL YOU NEED
  static const String BASE_URL = 'https://nirv-ico.onrender.com/api';

  // That's it! No other credentials needed.
  // Everything else is handled by the backend.
}
```

---

## 📱 Complete App Flow with APIs

### **FLOW 1: SIGNUP** (New User)

```
Step 1: Mobile Signup
├─ API: POST /auth/signup/mobile-init
├─ Body: {
│    "name": "John Doe",
│    "mobile": "+919876543210",
│    "referralCode": "ICO123ABC"  // Optional
│  }
└─ Response: { "userId": "xxx", "message": "OTP sent" }

Step 2: Verify OTP
├─ API: POST /auth/signup/verify
├─ Body: {
│    "userId": "xxx",
│    "otp": "123456",
│    "type": "mobile"
│  }
└─ Response: { "token": "xxx", "_id": "xxx", "mobile": "xxx" }
   ⚠️ SAVE THIS TOKEN IN SECURE STORAGE

Step 3: Setup PIN
├─ API: POST /auth/pin/setup
├─ Headers: Authorization: Bearer {token}
├─ Body: { "pin": "1234" }
└─ Response: { "message": "PIN setup successful" }
```

---

### **FLOW 2: LOGIN** (Existing User)

**Option A: Login with PIN (Fast)**

```
API: POST /auth/login/pin
Body: {
  "identifier": "+919876543210",
  "pin": "1234"
}
Response: { "token": "xxx", "_id": "xxx", "mobile": "xxx" }
⚠️ SAVE THIS TOKEN
```

**Option B: Login with OTP (Secure)**

```
Step 1: Request OTP
├─ API: POST /auth/login/mobile-init
├─ Body: { "mobile": "+919876543210" }
└─ Response: { "userId": "xxx", "message": "OTP sent" }

Step 2: Verify OTP
├─ API: POST /auth/login/mobile-verify
├─ Body: {
│    "mobile": "+919876543210",
│    "otp": "123456"
│  }
└─ Response: { "token": "xxx", "_id": "xxx", "mobile": "xxx" }
   ⚠️ SAVE THIS TOKEN
```

---

### **FLOW 3: WALLET** (Add Money)

```
Step 1: Get Wallet Balance
├─ API: GET /wallet/summary
├─ Headers: Authorization: Bearer {token}
└─ Response: {
     "wallet": {
       "balance": 5000,
       "currency": "INR"
     }
   }

Step 2: Add Money via PhonePe
├─ API: POST /wallet/topup
├─ Headers: Authorization: Bearer {token}
├─ Body: {
│    "amount": 1000,
│    "redirectUrl": "myapp://wallet/success"
│  }
└─ Response: {
     "paymentSession": {
       "endpoint": "https://api-preprod.phonepe.com/...",
       "request": "base64_encoded_data",
       "checksum": "xxx"
     }
   }

Step 3: Open PhonePe Payment
├─ Use WebView in Flutter
├─ Load the endpoint with request & checksum
├─ User completes payment
└─ Wallet balance auto-updated by backend
```

---

### **FLOW 4: ICO TRADING** (Buy/Sell Coins)

```
Step 1: Get Token Price
├─ API: GET /ico/price
├─ No auth required
└─ Response: { "tokenSymbol": "ICOX", "price": 10 }

Step 2: Get Your Holdings
├─ API: GET /ico/summary
├─ Headers: Authorization: Bearer {token}
└─ Response: {
     "balance": 100,
     "price": 10,
     "valuation": 1000
   }

Step 3: Buy ICO Tokens
├─ API: POST /ico/buy
├─ Headers: Authorization: Bearer {token}
├─ Body: { "fiatAmount": 1000 }
│  OR
│  Body: { "tokenAmount": 100 }
└─ Response: {
     "paymentSession": {
       "endpoint": "https://api-preprod.phonepe.com/...",
       "request": "base64_encoded_data",
       "checksum": "xxx"
     }
   }
   → Open PhonePe payment
   → After payment, tokens auto-credited
   → MLM commissions auto-distributed to upline!

Step 4: Sell ICO Tokens
├─ API: POST /ico/sell
├─ Headers: Authorization: Bearer {token}
├─ Body: { "tokenAmount": 50 }
└─ Response: {
     "transaction": { "status": "pending" },
     "payoutNote": "Admin will process payout"
   }
   → Tokens deducted immediately
   → Money added to wallet after admin approval
```

---

### **FLOW 5: REFERRAL** (View Earnings)

```
Step 1: Get Your Profile (with Referral Code)
├─ API: GET /user/profile
├─ Headers: Authorization: Bearer {token}
└─ Response: {
     "referralCode": "ICO123ABC",
     "referralWalletBalance": 1500,
     "referralTotalEarned": 5000,
     "referralLevel": 2
   }

Step 2: Get Referral Earnings
├─ API: GET /user/referral/earnings?page=1&limit=50
├─ Headers: Authorization: Bearer {token}
└─ Response: {
     "earnings": [
       {
         "amount": 50,
         "percentage": 5,
         "depth": 0,
         "sourceUser": { "name": "Jane" }
       }
     ]
   }

Step 3: Get Referral Network
├─ API: GET /user/referral/network?page=1&limit=50
├─ Headers: Authorization: Bearer {token}
└─ Response: {
     "network": [
       {
         "name": "Jane",
         "mobile": "+919876543211",
         "depth": 0
       }
     ],
     "summary": {
       "totalDownline": 50
     }
   }
```

---

## 🔐 Token Storage (IMPORTANT!)

```dart
// Add to pubspec.yaml
dependencies:
  flutter_secure_storage: ^9.0.0

// Save token after login/signup
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save
await storage.write(key: 'jwt_token', value: token);

// Get
final token = await storage.read(key: 'jwt_token');

// Use in API calls
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

---

## 🌐 API Call Example (Copy This!)

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

    return jsonDecode(response.body);
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

    return jsonDecode(response.body);
  }
}

// Usage Examples:

// 1. Signup
final result = await ApiService.post('/auth/signup/mobile-init', {
  'name': 'John Doe',
  'mobile': '+919876543210',
});

// 2. Login with PIN
final result = await ApiService.post('/auth/login/pin', {
  'identifier': '+919876543210',
  'pin': '1234',
});
final token = result['token'];

// 3. Get Wallet Balance
final result = await ApiService.get('/wallet/summary', token: token);
final balance = result['wallet']['balance'];

// 4. Buy ICO Tokens
final result = await ApiService.post('/ico/buy', {
  'fiatAmount': 1000,
}, token: token);
final paymentSession = result['paymentSession'];
```

---

## 💳 PhonePe Payment WebView (Copy This!)

```dart
// Add to pubspec.yaml
dependencies:
  webview_flutter: ^4.4.4

// Payment Screen
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PhonePePaymentScreen extends StatefulWidget {
  final String endpoint;
  final String request;
  final String checksum;

  PhonePePaymentScreen({
    required this.endpoint,
    required this.request,
    required this.checksum,
  });

  @override
  State<PhonePePaymentScreen> createState() => _PhonePePaymentScreenState();
}

class _PhonePePaymentScreenState extends State<PhonePePaymentScreen> {
  late WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            // Check if payment completed
            if (url.contains('success') || url.contains('callback')) {
              Navigator.pop(context, true); // Payment success
            }
          },
        ),
      )
      ..loadRequest(
        Uri.parse(widget.endpoint),
        method: LoadRequestMethod.post,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': widget.checksum,
        },
        body: widget.request.codeUnits,
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Payment')),
      body: WebViewWidget(controller: controller),
    );
  }
}

// Usage:
// After calling /wallet/topup or /ico/buy
final paymentSession = result['paymentSession'];

Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => PhonePePaymentScreen(
      endpoint: paymentSession['endpoint'],
      request: paymentSession['request'],
      checksum: paymentSession['checksum'],
    ),
  ),
);
```

---

## 📦 Required Flutter Packages

```yaml
# pubspec.yaml

dependencies:
  flutter:
    sdk: flutter

  # API calls
  http: ^1.1.0

  # Secure token storage
  flutter_secure_storage: ^9.0.0

  # PhonePe payment
  webview_flutter: ^4.4.4

  # Optional: State management
  provider: ^6.1.1
```

---

## ✅ Complete Example: Signup to Buy ICO

```dart
// 1. Signup
final signupResult = await ApiService.post('/auth/signup/mobile-init', {
  'name': 'John Doe',
  'mobile': '+919876543210',
  'referralCode': 'ICO123ABC', // Optional
});
final userId = signupResult['userId'];

// 2. Verify OTP (user enters OTP from SMS)
final verifyResult = await ApiService.post('/auth/signup/verify', {
  'userId': userId,
  'otp': '123456', // From SMS
  'type': 'mobile',
});
final token = verifyResult['token'];

// Save token
await storage.write(key: 'jwt_token', value: token);

// 3. Setup PIN
await ApiService.post('/auth/pin/setup', {
  'pin': '1234',
}, token: token);

// 4. Get ICO Price
final priceResult = await ApiService.get('/ico/price');
final tokenPrice = priceResult['price']; // 10

// 5. Buy ICO Tokens
final buyResult = await ApiService.post('/ico/buy', {
  'fiatAmount': 1000, // Buy ₹1000 worth
}, token: token);

// 6. Open PhonePe Payment
final paymentSession = buyResult['paymentSession'];
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => PhonePePaymentScreen(
      endpoint: paymentSession['endpoint'],
      request: paymentSession['request'],
      checksum: paymentSession['checksum'],
    ),
  ),
);

// 7. After payment, check holdings
final holdingsResult = await ApiService.get('/ico/summary', token: token);
final balance = holdingsResult['balance']; // 100 tokens
```

---

## 🎯 Summary

### What You Need:

1. ✅ **Base URL**: `https://nirv-ico.onrender.com/api`
2. ✅ **3 Flutter packages**: http, flutter_secure_storage, webview_flutter
3. ✅ **Copy the code above**

### What You DON'T Need:

- ❌ Twilio credentials (backend handles it)
- ❌ PhonePe credentials (backend handles it)
- ❌ Database credentials (backend handles it)
- ❌ Any API keys (backend handles it)

### App Flow:

```
Signup → OTP → PIN → Login → Wallet → Buy ICO → Referral
```

### MLM Commissions:

- Automatically distributed when users buy ICO tokens
- 9 levels (0-8)
- Rates: 5%, 15%, 10%, 8%, 5%, 3%, 2%, 1%, 1%

---

## 🚀 Start Building!

**Copy the code above and start building your Flutter app!**

**API is live at:** `https://nirv-ico.onrender.com/api`

**Test it:**

```bash
curl https://nirv-ico.onrender.com/api/health
```

---

**That's it! Everything you need is here. Happy coding! 🎉**
