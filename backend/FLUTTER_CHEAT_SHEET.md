# 🚀 Flutter ICO App - Quick Cheat Sheet

## 📍 API Base URL

```dart
const BASE_URL = 'https://nirv-ico.onrender.com/api';
```

## 🔑 No Credentials Needed!

Just use the BASE_URL. Everything else is on the backend.

---

## 📱 COMPLETE FLOW

### 1️⃣ SIGNUP

```dart
// Step 1: Mobile Signup
POST /auth/signup/mobile-init
{ "name": "John", "mobile": "+919876543210", "referralCode": "ICO123" }
→ Returns: { userId }

// Step 2: Verify OTP
POST /auth/signup/verify
{ "userId": "xxx", "otp": "123456", "type": "mobile" }
→ Returns: { token } ⚠️ SAVE THIS

// Step 3: Setup PIN
POST /auth/pin/setup
Headers: Authorization: Bearer {token}
{ "pin": "1234" }
```

### 2️⃣ LOGIN

```dart
// Option A: PIN (Fast)
POST /auth/login/pin
{ "identifier": "+919876543210", "pin": "1234" }
→ Returns: { token } ⚠️ SAVE THIS

// Option B: OTP (Secure)
POST /auth/login/mobile-init
{ "mobile": "+919876543210" }
→ Returns: { userId }

POST /auth/login/mobile-verify
{ "mobile": "+919876543210", "otp": "123456" }
→ Returns: { token } ⚠️ SAVE THIS
```

### 3️⃣ WALLET

```dart
// Get Balance
GET /wallet/summary
Headers: Authorization: Bearer {token}

// Add Money
POST /wallet/topup
Headers: Authorization: Bearer {token}
{ "amount": 1000 }
→ Returns: { paymentSession } → Open PhonePe WebView
```

### 4️⃣ ICO

```dart
// Get Price
GET /ico/price

// Get Holdings
GET /ico/summary
Headers: Authorization: Bearer {token}

// Buy Tokens
POST /ico/buy
Headers: Authorization: Bearer {token}
{ "fiatAmount": 1000 }
→ Returns: { paymentSession } → Open PhonePe WebView

// Sell Tokens
POST /ico/sell
Headers: Authorization: Bearer {token}
{ "tokenAmount": 50 }
```

### 5️⃣ REFERRAL

```dart
// Get Profile
GET /user/profile
Headers: Authorization: Bearer {token}
→ Returns: { referralCode, referralWalletBalance, referralTotalEarned }

// Get Earnings
GET /user/referral/earnings
Headers: Authorization: Bearer {token}

// Get Network
GET /user/referral/network
Headers: Authorization: Bearer {token}
```

---

## 💻 COPY-PASTE CODE

### API Service

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

### Token Storage

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save
await storage.write(key: 'token', value: token);

// Get
final token = await storage.read(key: 'token');
```

### PhonePe Payment

```dart
import 'package:webview_flutter/webview_flutter.dart';

class PaymentScreen extends StatelessWidget {
  final Map session;

  @override
  Widget build(BuildContext context) {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(
        Uri.parse(session['endpoint']),
        method: LoadRequestMethod.post,
        headers: {'X-VERIFY': session['checksum']},
        body: session['request'].codeUnits,
      );

    return Scaffold(
      appBar: AppBar(title: Text('Payment')),
      body: WebViewWidget(controller: controller),
    );
  }
}
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

## 🎯 QUICK EXAMPLE

```dart
// 1. Signup
final r1 = await Api.post('/auth/signup/mobile-init', {
  'name': 'John', 'mobile': '+919876543210'
});

// 2. Verify OTP
final r2 = await Api.post('/auth/signup/verify', {
  'userId': r1['userId'], 'otp': '123456', 'type': 'mobile'
});
final token = r2['token'];
await storage.write(key: 'token', value: token);

// 3. Setup PIN
await Api.post('/auth/pin/setup', {'pin': '1234'}, token: token);

// 4. Buy ICO
final r3 = await Api.post('/ico/buy', {'fiatAmount': 1000}, token: token);

// 5. Open Payment
Navigator.push(context, MaterialPageRoute(
  builder: (_) => PaymentScreen(session: r3['paymentSession'])
));
```

---

## ✅ THAT'S IT!

**Base URL:** `https://nirv-ico.onrender.com/api`

**No credentials needed!**

**Copy code above and start building!** 🚀
