# 🚀 Flutter Quick Start - ICO App

## 📍 API Base URL

```dart
const String BASE_URL = 'https://nirv-ico.onrender.com/api';
```

---

## 🔑 No Credentials Needed!

Everything is handled by the backend. You only need:

- ✅ Base URL
- ✅ JWT Token (received after login)

---

## 📱 Complete App Flow

### 1️⃣ SIGNUP FLOW

```
Step 1: POST /auth/signup/mobile-init
{
  "name": "John Doe",
  "mobile": "+919876543210",
  "referralCode": "ICO123ABC"  // Optional
}
→ Returns: { userId }

Step 2: POST /auth/signup/verify
{
  "userId": "...",
  "otp": "123456",
  "type": "mobile"
}
→ Returns: { token, user data }

Step 3: POST /auth/pin/setup
Headers: Authorization: Bearer <token>
{
  "pin": "1234"
}
→ Returns: { message: "PIN setup successful" }
```

---

### 2️⃣ LOGIN FLOW

**Option A: Login with PIN (Fast)**

```
POST /auth/login/pin
{
  "identifier": "+919876543210",
  "pin": "1234"
}
→ Returns: { token, user data }
```

**Option B: Login with OTP**

```
Step 1: POST /auth/login/mobile-init
{
  "mobile": "+919876543210"
}
→ Returns: { userId }

Step 2: POST /auth/login/mobile-verify
{
  "mobile": "+919876543210",
  "otp": "123456"
}
→ Returns: { token, user data }
```

---

### 3️⃣ WALLET FLOW

**Get Balance**

```
GET /wallet/summary
Headers: Authorization: Bearer <token>
→ Returns: { wallet: { balance, currency, ... }, recentTransactions }
```

**Add Money (PhonePe)**

```
POST /wallet/topup
Headers: Authorization: Bearer <token>
{
  "amount": 1000,
  "redirectUrl": "myapp://wallet/success"
}
→ Returns: { paymentSession: { endpoint, request, checksum } }
→ Open PhonePe payment in WebView
```

---

### 4️⃣ ICO FLOW

**Get Token Price**

```
GET /ico/price
→ Returns: { tokenSymbol: "ICOX", price: 10 }
```

**Get Holdings**

```
GET /ico/summary
Headers: Authorization: Bearer <token>
→ Returns: { balance: 100, valuation: 1000, price: 10 }
```

**Buy Tokens**

```
POST /ico/buy
Headers: Authorization: Bearer <token>
{
  "fiatAmount": 1000
}
→ Returns: { paymentSession: { endpoint, request, checksum } }
→ Open PhonePe payment in WebView
→ MLM commissions auto-distributed!
```

**Sell Tokens**

```
POST /ico/sell
Headers: Authorization: Bearer <token>
{
  "tokenAmount": 50
}
→ Returns: { transaction, payoutNote }
→ Admin will process payout
```

---

### 5️⃣ REFERRAL FLOW

**Get Profile (with Referral Code)**

```
GET /user/profile
Headers: Authorization: Bearer <token>
→ Returns: {
  referralCode: "ICO123ABC",
  referralWalletBalance: 1500,
  referralTotalEarned: 5000,
  referralLevel: 2
}
```

**Get Earnings**

```
GET /user/referral/earnings?page=1&limit=50
Headers: Authorization: Bearer <token>
→ Returns: { earnings: [...], pagination }
```

**Get Network**

```
GET /user/referral/network?page=1&limit=50
Headers: Authorization: Bearer <token>
→ Returns: { network: [...], summary }
```

---

## 📦 Required Flutter Packages

```yaml
dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  webview_flutter: ^4.4.4
  provider: ^6.1.1
```

---

## 🔐 Token Storage

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save token
await storage.write(key: 'jwt_token', value: token);

// Get token
final token = await storage.read(key: 'jwt_token');

// Use in API calls
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

---

## 🌐 API Call Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> apiCall(
  String endpoint,
  String method, {
  Map<String, dynamic>? body,
  String? token,
}) async {
  final url = Uri.parse('https://nirv-ico.onrender.com/api$endpoint');

  final headers = {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  http.Response response;

  if (method == 'GET') {
    response = await http.get(url, headers: headers);
  } else if (method == 'POST') {
    response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(body),
    );
  } else {
    throw Exception('Unsupported method');
  }

  return jsonDecode(response.body);
}

// Usage
final result = await apiCall('/auth/login/pin', 'POST', body: {
  'identifier': '+919876543210',
  'pin': '1234',
});

if (result['token'] != null) {
  // Save token and navigate to home
}
```

---

## 💳 PhonePe Payment WebView

```dart
import 'package:webview_flutter/webview_flutter.dart';

class PhonePePayment extends StatelessWidget {
  final String endpoint;
  final String request;
  final String checksum;

  PhonePePayment({
    required this.endpoint,
    required this.request,
    required this.checksum,
  });

  @override
  Widget build(BuildContext context) {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(
        Uri.parse(endpoint),
        method: LoadRequestMethod.post,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        body: request.codeUnits,
      );

    return Scaffold(
      appBar: AppBar(title: Text('Payment')),
      body: WebViewWidget(controller: controller),
    );
  }
}
```

---

## 🎯 MLM Commission Structure

```
Level 0 (Direct):     5%
Level 1:             15%
Level 2:             10%
Level 3:              8%
Level 4:              5%
Level 5:              3%
Level 6:              2%
Level 7:              1%
Level 8:              1%
```

**Automatic Distribution:**

- When user buys ICO tokens
- Commissions go to all qualified upline members
- Stored in `referralWalletBalance`

---

## ✅ Testing Checklist

### 1. Test Signup

```
✓ Mobile number validation
✓ OTP received via SMS
✓ OTP verification works
✓ PIN setup successful
```

### 2. Test Login

```
✓ Login with PIN works
✓ Login with OTP works
✓ Token saved securely
```

### 3. Test Wallet

```
✓ Balance shows correctly
✓ PhonePe payment opens
✓ Balance updates after payment
```

### 4. Test ICO

```
✓ Token price fetched
✓ Buy tokens via PhonePe
✓ Holdings updated
✓ Sell tokens request created
```

### 5. Test Referral

```
✓ Referral code displayed
✓ Signup with referral code
✓ Earnings show up
✓ Network visible
```

---

## 🚨 Common Issues & Solutions

### Issue: "Network Error"

**Solution:** Check if BASE_URL is correct and server is running

### Issue: "Unauthorized"

**Solution:** Token expired or not sent. Re-login to get new token

### Issue: "OTP not received"

**Solution:** Check Twilio configuration on backend (admin issue)

### Issue: "PhonePe payment not working"

**Solution:** Currently in sandbox mode. For production, update PhonePe credentials on backend

---

## 📞 API Status Check

Test if API is running:

```dart
final response = await http.get(
  Uri.parse('https://nirv-ico.onrender.com/api/health')
);
print(response.body); // Should return: {"status":"ok"}
```

---

## 🎉 You're Ready!

**Base URL:** `https://nirv-ico.onrender.com/api`

**All endpoints are live and working!**

For detailed code examples, see: `FLUTTER_API_INTEGRATION.md`

---

## 📚 Documentation Files

1. **FLUTTER_API_INTEGRATION.md** - Complete code with examples
2. **COMPLETE_API_DOCUMENTATION.md** - All API endpoints explained
3. **FLUTTER_QUICK_START.md** - This file (quick reference)

---

**Happy Coding! 🚀**
