# ⚡ FLUTTER INTEGRATION - ESSENTIALS ONLY

## 🔑 CREDENTIAL (Copy This)

```dart
const String BASE_URL = 'https://nirv-ico.onrender.com/api';
```

**That's the ONLY credential you need!**

---

## 📍 ALL ENDPOINTS

```
BASE: https://nirv-ico.onrender.com/api

SIGNUP & LOGIN:
POST   /auth/signup/mobile-init       - Signup
POST   /auth/signup/verify            - Verify OTP
POST   /auth/pin/setup                - Setup PIN (needs token)
POST   /auth/login/pin                - Login with PIN
POST   /auth/login/mobile-init        - Request login OTP
POST   /auth/login/mobile-verify      - Verify login OTP

WALLET:
GET    /wallet/summary                - Get balance (needs token)
POST   /wallet/topup                  - Add money (needs token)
GET    /wallet/transactions           - History (needs token)

ICO:
GET    /ico/price                     - Get price (public)
GET    /ico/summary                   - Get holdings (needs token)
POST   /ico/buy                       - Buy tokens (needs token)
POST   /ico/sell                      - Sell tokens (needs token)

REFERRAL:
GET    /user/profile                  - Get profile (needs token)
GET    /user/referral/earnings        - Get earnings (needs token)
GET    /user/referral/network         - Get network (needs token)
```

---

## 💻 COPY-PASTE CODE

### 1. API Service

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class Api {
  static const BASE = 'https://nirv-ico.onrender.com/api';

  static Future<Map> post(String path, Map body, {String? token}) async {
    final res = await http.post(
      Uri.parse('$BASE$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return jsonDecode(res.body);
  }

  static Future<Map> get(String path, {String? token}) async {
    final res = await http.get(
      Uri.parse('$BASE$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    return jsonDecode(res.body);
  }
}
```

### 2. Token Storage

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save
await storage.write(key: 'token', value: token);

// Get
final token = await storage.read(key: 'token');

// Delete
await storage.delete(key: 'token');
```

---

## 🎯 USAGE

```dart
// Signup
var r = await Api.post('/auth/signup/mobile-init', {
  'name': 'John', 'mobile': '+919876543210'
});

// Verify OTP
r = await Api.post('/auth/signup/verify', {
  'userId': r['userId'], 'otp': '123456', 'type': 'mobile'
});
await storage.write(key: 'token', value: r['token']);

// Setup PIN
await Api.post('/auth/pin/setup', {'pin': '1234'}, token: r['token']);

// Login
r = await Api.post('/auth/login/pin', {
  'identifier': '+919876543210', 'pin': '1234'
});
await storage.write(key: 'token', value: r['token']);

// Get Balance
final token = await storage.read(key: 'token');
r = await Api.get('/wallet/summary', token: token);
print(r['wallet']['balance']);

// Buy ICO
r = await Api.post('/ico/buy', {'fiatAmount': 1000}, token: token);
// Open PhonePe with r['paymentSession']
```

---

## 📦 PACKAGES

```yaml
dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  webview_flutter: ^4.4.4
```

---

## ✅ DONE!

**Base URL:** `https://nirv-ico.onrender.com/api`

**15 Endpoints** | **No other credentials needed** | **Ready to use**
