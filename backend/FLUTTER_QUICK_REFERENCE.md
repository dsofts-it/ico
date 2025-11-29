# Flutter Integration - Quick Reference Card

## 🔗 Base URL

```
https://nirv-ico.onrender.com/api
```

## 🔐 Authentication Header

```
Authorization: Bearer {jwt_token}
```

---

## 📱 Essential API Endpoints

### **1. SIGNUP FLOW**

```dart
// Step 1: Initiate Signup
POST /auth/signup/mobile-init
Body: { "name": "John", "mobile": "9876543210" }
Response: { "userId": "xxx", "message": "OTP sent" }

// Step 2: Verify OTP
POST /auth/signup/verify
Body: { "userId": "xxx", "otp": "123456", "type": "mobile" }
Response: { "token": "jwt_token", "isMobileVerified": true }

// Step 3: Setup PIN
POST /auth/pin/setup
Headers: Authorization: Bearer {token}
Body: { "pin": "1234" }
```

---

### **2. LOGIN FLOW**

```dart
// Option A: PIN Login (Fast)
POST /auth/login/pin
Body: { "identifier": "9876543210", "pin": "1234" }
Response: { "token": "jwt_token", "name": "John" }

// Option B: OTP Login
POST /auth/login/mobile-init
Body: { "mobile": "9876543210" }

POST /auth/login/mobile-verify
Body: { "mobile": "9876543210", "otp": "123456" }
Response: { "token": "jwt_token" }
```

---

### **3. WALLET & PAYMENTS**

```dart
// Get Wallet Balance
GET /ico/summary
Headers: Authorization: Bearer {token}
Response: { "totalTokens": 100, "currentValueINR": 1000 }

// Add Money (PhonePe)
POST /orders
Headers: Authorization: Bearer {token}
Body: {
  "items": [{ "product": "id", "quantity": 1, "price": 500 }],
  "shippingAddress": { ... }
}
Response: {
  "paymentSession": {
    "base64Payload": "...",
    "checksum": "...",
    "redirectUrl": "https://phonepe.com/..."
  }
}

// Transaction History
GET /ico/transactions
Headers: Authorization: Bearer {token}
```

---

### **4. ICO TRADING**

```dart
// Get Token Price
GET /ico/price
Response: { "symbol": "ICOX", "priceINR": 10 }

// Buy Tokens
POST /ico/buy
Headers: Authorization: Bearer {token}
Body: { "tokens": 100 }
Response: { "paymentSession": { ... } }

// Sell Tokens
POST /ico/sell
Headers: Authorization: Bearer {token}
Body: { "tokens": 50 }
Response: { "message": "Sell request submitted" }
```

---

### **5. PROFILE & ADDRESSES**

```dart
// Get Addresses
GET /user/addresses
Headers: Authorization: Bearer {token}

// Add Address
POST /user/addresses
Headers: Authorization: Bearer {token}
Body: {
  "label": "Home",
  "fullName": "John Doe",
  "phone": "9876543210",
  "line1": "123 Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "country": "IN"
}

// Update Address
PUT /user/addresses/{addressId}

// Delete Address
DELETE /user/addresses/{addressId}

// Set Default
PATCH /user/addresses/{addressId}/default
```

---

## 🎨 Flutter Code Snippets

### **API Service Setup**

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'https://nirv-ico.onrender.com/api';

  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body,
    {String? token}
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: json.encode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception(json.decode(response.body)['message']);
    }
  }

  Future<Map<String, dynamic>> get(
    String endpoint,
    {String? token}
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception(json.decode(response.body)['message']);
    }
  }
}
```

---

### **Secure Token Storage**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _storage = FlutterSecureStorage();

  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: 'jwt_token');
  }
}
```

---

### **Mobile Signup Example**

```dart
class AuthService {
  final ApiService _api = ApiService();

  Future<String> signupMobile(String name, String mobile) async {
    final response = await _api.post('/auth/signup/mobile-init', {
      'name': name,
      'mobile': mobile,
    });
    return response['userId'];
  }

  Future<String> verifyOTP(String userId, String otp) async {
    final response = await _api.post('/auth/signup/verify', {
      'userId': userId,
      'otp': otp,
      'type': 'mobile',
    });

    final token = response['token'];
    await StorageService.saveToken(token);
    return token;
  }

  Future<void> setupPIN(String pin) async {
    final token = await StorageService.getToken();
    await _api.post('/auth/pin/setup', {'pin': pin}, token: token);
  }

  Future<String> loginWithPIN(String mobile, String pin) async {
    final response = await _api.post('/auth/login/pin', {
      'identifier': mobile,
      'pin': pin,
    });

    final token = response['token'];
    await StorageService.saveToken(token);
    return token;
  }
}
```

---

### **PhonePe Payment Integration**

```dart
import 'package:webview_flutter/webview_flutter.dart';

class PaymentScreen extends StatelessWidget {
  final String base64Payload;
  final String checksum;
  final String redirectUrl;

  @override
  Widget build(BuildContext context) {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            // Check if payment completed
            if (url.contains('success') || url.contains('callback')) {
              Navigator.pop(context, true);
            }
          },
        ),
      )
      ..loadRequest(
        Uri.parse('$redirectUrl/$base64Payload'),
        headers: {'X-VERIFY': checksum},
      );

    return Scaffold(
      appBar: AppBar(title: Text('Payment')),
      body: WebViewWidget(controller: controller),
    );
  }
}
```

---

### **Wallet Service Example**

```dart
class WalletService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getBalance() async {
    final token = await StorageService.getToken();
    return await _api.get('/ico/summary', token: token);
  }

  Future<List<dynamic>> getTransactions() async {
    final token = await StorageService.getToken();
    return await _api.get('/ico/transactions', token: token);
  }

  Future<Map<String, dynamic>> buyTokens(int tokens) async {
    final token = await StorageService.getToken();
    return await _api.post('/ico/buy', {'tokens': tokens}, token: token);
  }
}
```

---

## 🔒 Error Codes

| Code | Meaning      | Action                   |
| ---- | ------------ | ------------------------ |
| 400  | Bad Request  | Check request body       |
| 401  | Unauthorized | Token expired, re-login  |
| 403  | Forbidden    | Account not verified     |
| 404  | Not Found    | Check endpoint           |
| 500  | Server Error | Retry or contact support |

---

## ✅ Testing Checklist

- [ ] Signup with mobile number
- [ ] Receive and verify OTP
- [ ] Setup 4-digit PIN
- [ ] Login with PIN
- [ ] Login with OTP
- [ ] View wallet balance
- [ ] Add money via PhonePe
- [ ] Buy ICO tokens
- [ ] Sell ICO tokens
- [ ] View transaction history
- [ ] Add shipping address
- [ ] Edit address
- [ ] Set default address
- [ ] Handle network errors
- [ ] Handle token expiry
- [ ] Test logout flow

---

## 📦 Required Packages

```yaml
dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  provider: ^6.1.1
  pin_code_fields: ^8.0.1
  webview_flutter: ^4.4.2
  intl: ^0.19.0
```

---

## 🚀 Quick Start Command

```bash
# Add all dependencies at once
flutter pub add http flutter_secure_storage provider pin_code_fields webview_flutter intl
```

---

## 📞 Support

- **Backend Repo:** https://github.com/dsofts-it/ico
- **Full Guide:** See FLUTTER_INTEGRATION_GUIDE.md
- **Postman Collection:** ICO_Full_App_Flow.postman_collection.json
