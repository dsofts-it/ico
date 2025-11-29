# Flutter App Integration Prompt - Complete API Flow

## Project Requirements

Create a complete Flutter mobile application that integrates with the backend API at `https://nirv-ico.onrender.com/api`. Implement all features with proper error handling, loading states, and a modern UI.

---

## API Base Configuration

```dart
class AppConfig {
  static const String baseUrl = 'https://nirv-ico.onrender.com/api';
  static const String tokenKey = 'jwt_token';
}
```

---

## Complete API Flow & Integration

### **FLOW 1: USER SIGNUP (Mobile + OTP)**

#### Step 1: Initiate Signup

```
Endpoint: POST /auth/signup/mobile-init
Request Body:
{
  "name": "John Doe",
  "mobile": "9876543210"
}

Response:
{
  "message": "Signup initiated. OTP sent to mobile.",
  "userId": "507f1f77bcf86cd799439011"
}

Flutter Implementation:
- Screen: MobileSignupScreen
- Input: Name (text), Mobile (10 digits)
- Validation: Name required, Mobile must be 10 digits
- On Success: Navigate to OTP screen with userId
- Store: userId for next step
```

#### Step 2: Verify OTP

```
Endpoint: POST /auth/signup/verify
Request Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "otp": "123456",
  "type": "mobile"
}

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "isEmailVerified": false,
  "isMobileVerified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Flutter Implementation:
- Screen: OTPVerificationScreen
- Input: 6-digit OTP
- Add: Resend OTP button (calls signup-init again)
- On Success:
  * Save token to flutter_secure_storage
  * Save user data locally
  * Navigate to PIN setup screen
```

#### Step 3: Setup PIN

```
Endpoint: POST /auth/pin/setup
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}
Request Body:
{
  "pin": "1234"
}

Response:
{
  "message": "PIN setup successful"
}

Flutter Implementation:
- Screen: PINSetupScreen
- Input: 4-digit PIN (enter twice for confirmation)
- Validation: Both PINs must match
- On Success: Navigate to Home screen
```

---

### **FLOW 2: USER LOGIN**

#### Option A: Login with PIN (Fast & Recommended)

```
Endpoint: POST /auth/login/pin
Request Body:
{
  "identifier": "9876543210",
  "pin": "1234"
}

Response:
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

Flutter Implementation:
- Screen: PINLoginScreen
- Input: Mobile number, 4-digit PIN
- On Success:
  * Save token to secure storage
  * Save user data
  * Navigate to Home screen
```

#### Option B: Login with OTP

```
Step 1: Request OTP
Endpoint: POST /auth/login/mobile-init
Request Body:
{
  "mobile": "9876543210"
}

Response:
{
  "message": "OTP sent to mobile"
}

Step 2: Verify OTP
Endpoint: POST /auth/login/mobile-verify
Request Body:
{
  "mobile": "9876543210",
  "otp": "123456"
}

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "mobile": "9876543210",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Flutter Implementation:
- Screen: OTPLoginScreen
- Flow: Enter mobile → Request OTP → Enter OTP → Login
- On Success: Save token and navigate to Home
```

---

### **FLOW 3: WALLET MANAGEMENT**

#### Get Wallet Balance & Holdings

```
Endpoint: GET /ico/summary
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}

Response:
{
  "tokenSymbol": "ICOX",
  "pricePerToken": 10,
  "totalTokens": 100,
  "totalInvestedINR": 1000,
  "currentValueINR": 1000,
  "profitLoss": 0,
  "profitLossPercent": 0
}

Flutter Implementation:
- Screen: WalletScreen (Dashboard)
- Display:
  * Total Balance (₹)
  * Total Tokens
  * Current Value
  * Profit/Loss with color (green/red)
- Refresh: Pull-to-refresh to reload data
```

#### Get Transaction History

```
Endpoint: GET /ico/transactions
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}

Response:
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

Flutter Implementation:
- Screen: TransactionHistoryScreen
- Display: ListView with transaction cards
- Show: Type icon, tokens, amount, status badge, date
- Status colors: completed=green, pending=orange, failed=red
```

---

### **FLOW 4: ADD MONEY (PhonePe Payment)**

```
Endpoint: POST /orders
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}
Request Body:
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

Response:
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

Flutter Implementation:
- Screen: AddMoneyScreen
- Input: Amount to add (₹)
- On Submit:
  1. Create order with API
  2. Receive paymentSession
  3. Open PaymentWebViewScreen with:
     - URL: {redirectUrl}/{base64Payload}
     - Header: X-VERIFY: {checksum}
  4. User completes payment on PhonePe
  5. On redirect back:
     - If success: Show success message, refresh balance
     - If failure: Show error message
```

---

### **FLOW 5: ICO TOKEN TRADING**

#### Get Current Token Price (Public)

```
Endpoint: GET /ico/price
No Authentication Required

Response:
{
  "symbol": "ICOX",
  "priceINR": 10
}

Flutter Implementation:
- Display on ICO Dashboard
- Show prominently with symbol
- Auto-refresh every 30 seconds
```

#### Buy Tokens

```
Endpoint: POST /ico/buy
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}
Request Body:
{
  "tokens": 100
}

Response:
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

Flutter Implementation:
- Screen: BuyTokensScreen
- Input: Number of tokens to buy
- Display: Total amount (tokens × price)
- On Submit:
  1. Call buy API
  2. Open PaymentWebViewScreen (same as Add Money)
  3. After payment: Refresh holdings
```

#### Sell Tokens

```
Endpoint: POST /ico/sell
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}
Request Body:
{
  "tokens": 50
}

Response:
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

Flutter Implementation:
- Screen: SellTokensScreen
- Input: Number of tokens to sell
- Validation: Cannot sell more than owned
- Display: Total amount to receive
- On Success: Show pending status message
```

---

### **FLOW 6: PROFILE & ADDRESS MANAGEMENT**

#### Get All Addresses

```
Endpoint: GET /user/addresses
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}

Response:
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

Flutter Implementation:
- Screen: AddressListScreen
- Display: List of address cards
- Show: Default badge on default address
- Actions: Edit, Delete, Set Default buttons
```

#### Add New Address

```
Endpoint: POST /user/addresses
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}
Request Body:
{
  "label": "Office",
  "fullName": "John Doe",
  "phone": "9876543210",
  "line1": "456 Business Park",
  "line2": "Floor 3",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400002",
  "country": "IN",
  "landmark": "Near XYZ Tower"
}

Response:
{
  "message": "Address added successfully",
  "address": { ... }
}

Flutter Implementation:
- Screen: AddAddressScreen
- Form Fields: All address fields
- Validation: Required fields marked
- On Success: Navigate back to address list
```

#### Update Address

```
Endpoint: PUT /user/addresses/{addressId}
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}
Request Body:
{
  "label": "Home (Updated)",
  "line1": "789 New Street"
}

Response:
{
  "message": "Address updated successfully"
}

Flutter Implementation:
- Screen: EditAddressScreen
- Pre-fill: Existing address data
- On Success: Update list and navigate back
```

#### Delete Address

```
Endpoint: DELETE /user/addresses/{addressId}
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}

Response:
{
  "message": "Address deleted successfully"
}

Flutter Implementation:
- Show confirmation dialog before delete
- On Success: Remove from list
```

#### Set Default Address

```
Endpoint: PATCH /user/addresses/{addressId}/default
Headers:
{
  "Authorization": "Bearer {jwt_token}"
}

Response:
{
  "message": "Default address updated"
}

Flutter Implementation:
- Single tap to set as default
- Update UI to show new default badge
```

---

## Required Flutter Implementation

### 1. Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  provider: ^6.1.1
  pin_code_fields: ^8.0.1
  webview_flutter: ^4.4.2
  intl: ^0.19.0
```

### 2. API Service (services/api_service.dart)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'https://nirv-ico.onrender.com/api';

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body, {String? token}) async {
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

  Future<dynamic> get(String endpoint, {String? token}) async {
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

  Future<dynamic> put(String endpoint, Map<String, dynamic> body, {String? token}) async {
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: json.encode(body),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception(json.decode(response.body)['message']);
    }
  }

  Future<void> delete(String endpoint, {String? token}) async {
    final response = await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200) {
      throw Exception(json.decode(response.body)['message']);
    }
  }

  Future<dynamic> patch(String endpoint, {Map<String, dynamic>? body, String? token}) async {
    final response = await http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: body != null ? json.encode(body) : null,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception(json.decode(response.body)['message']);
    }
  }
}
```

### 3. Storage Service (services/storage_service.dart)

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

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

### 4. PhonePe Payment WebView (screens/payment_webview_screen.dart)

```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaymentWebViewScreen extends StatefulWidget {
  final String redirectUrl;
  final String base64Payload;
  final String checksum;

  PaymentWebViewScreen({
    required this.redirectUrl,
    required this.base64Payload,
    required this.checksum,
  });

  @override
  _PaymentWebViewScreenState createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<PaymentWebViewScreen> {
  late WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            if (url.contains('success') || url.contains('callback')) {
              Navigator.pop(context, true);
            } else if (url.contains('failure') || url.contains('cancel')) {
              Navigator.pop(context, false);
            }
          },
        ),
      )
      ..loadRequest(
        Uri.parse('${widget.redirectUrl}/${widget.base64Payload}'),
        headers: {'X-VERIFY': widget.checksum},
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Payment'),
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: () => Navigator.pop(context, null),
        ),
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
```

---

## App Structure

```
lib/
├── main.dart
├── screens/
│   ├── auth/
│   │   ├── mobile_signup_screen.dart
│   │   ├── otp_verification_screen.dart
│   │   ├── pin_setup_screen.dart
│   │   ├── pin_login_screen.dart
│   │   └── otp_login_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── wallet/
│   │   ├── wallet_screen.dart
│   │   ├── add_money_screen.dart
│   │   ├── transaction_history_screen.dart
│   │   └── payment_webview_screen.dart
│   ├── ico/
│   │   ├── ico_dashboard_screen.dart
│   │   ├── buy_tokens_screen.dart
│   │   └── sell_tokens_screen.dart
│   └── profile/
│       ├── profile_screen.dart
│       ├── address_list_screen.dart
│       ├── add_address_screen.dart
│       └── edit_address_screen.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── wallet_service.dart
│   └── storage_service.dart
├── models/
│   ├── user_model.dart
│   ├── transaction_model.dart
│   └── address_model.dart
└── providers/
    ├── auth_provider.dart
    └── wallet_provider.dart
```

---

## Error Handling

Handle these HTTP status codes:

- **400**: Bad Request - Show validation errors
- **401**: Unauthorized - Clear token, redirect to login
- **403**: Forbidden - Account not verified
- **404**: Not Found - Show not found message
- **500**: Server Error - Show retry option

---

## UI Requirements

1. **Material Design 3** theme
2. **Loading indicators** for all async operations
3. **Error dialogs** with clear messages
4. **Success confirmations** with animations
5. **Pull-to-refresh** on list screens
6. **Bottom navigation bar** for main sections
7. **Form validation** with error messages
8. **Responsive design** for different screen sizes

---

## Testing Checklist

- [ ] Signup with mobile number
- [ ] Verify OTP
- [ ] Setup PIN
- [ ] Login with PIN
- [ ] Login with OTP
- [ ] View wallet balance
- [ ] Add money via PhonePe
- [ ] Buy tokens
- [ ] Sell tokens
- [ ] View transaction history
- [ ] Add address
- [ ] Edit address
- [ ] Delete address
- [ ] Set default address
- [ ] Logout and clear data

---

**Generate a complete, production-ready Flutter app with all these features, proper error handling, and a modern UI.**
