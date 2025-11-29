# 📱 Flutter App Integration Guide - ICO App

## 🔗 API Configuration

### Base URL

```dart
// Production (Deployed on Render)
const String BASE_URL = 'https://nirv-ico.onrender.com/api';

// Local Development (if testing locally)
// const String BASE_URL = 'http://localhost:5000/api';
```

### API Endpoints Structure

```
Base: https://nirv-ico.onrender.com/api

Authentication:
├── /auth/signup/mobile-init       (POST) - Mobile Signup
├── /auth/signup/verify            (POST) - Verify OTP
├── /auth/pin/setup                (POST) - Setup PIN
├── /auth/login/mobile-init        (POST) - Login with OTP (Step 1)
├── /auth/login/mobile-verify      (POST) - Login with OTP (Step 2)
└── /auth/login/pin                (POST) - Login with PIN

Wallet:
├── /wallet/summary                (GET)  - Get Wallet Balance
├── /wallet/topup                  (POST) - Add Money via PhonePe
├── /wallet/transactions           (GET)  - Transaction History
└── /wallet/withdraw               (POST) - Withdraw Money

ICO:
├── /ico/price                     (GET)  - Get Token Price (Public)
├── /ico/summary                   (GET)  - Get User Holdings
├── /ico/buy                       (POST) - Buy ICO Tokens
├── /ico/sell                      (POST) - Sell ICO Tokens
└── /ico/transactions              (GET)  - ICO Transaction History

User/Referral:
├── /user/profile                  (GET)  - Get User Profile
├── /user/referral/earnings        (GET)  - Referral Earnings
└── /user/referral/network         (GET)  - Referral Network
```

---

## 🔐 No Additional Credentials Needed!

**Good News:** Your Flutter app only needs the **BASE_URL**. All other credentials (Twilio, PhonePe, MongoDB, etc.) are stored securely on the backend server.

### What You Need:

1. ✅ **Base URL**: `https://nirv-ico.onrender.com/api`
2. ✅ **JWT Token**: Received after login (store in secure storage)

### What You DON'T Need:

- ❌ PhonePe credentials (handled by backend)
- ❌ Twilio credentials (handled by backend)
- ❌ Database credentials (handled by backend)
- ❌ API keys (handled by backend)

---

## 📦 Flutter Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP Client
  http: ^1.1.0
  dio: ^5.4.0 # Alternative to http (recommended)

  # State Management
  provider: ^6.1.1 # or riverpod, bloc, getx

  # Secure Storage (for JWT token)
  flutter_secure_storage: ^9.0.0

  # Local Storage
  shared_preferences: ^2.2.2

  # UI Components
  fluttertoast: ^8.2.4

  # WebView (for PhonePe payment)
  webview_flutter: ^4.4.4

  # URL Launcher
  url_launcher: ^6.2.2
```

---

## 🏗️ Flutter Project Structure

```
lib/
├── main.dart
├── config/
│   └── api_config.dart          # API URLs and constants
├── models/
│   ├── user_model.dart
│   ├── wallet_model.dart
│   ├── ico_model.dart
│   └── referral_model.dart
├── services/
│   ├── api_service.dart         # HTTP client wrapper
│   ├── auth_service.dart        # Authentication APIs
│   ├── wallet_service.dart      # Wallet APIs
│   ├── ico_service.dart         # ICO APIs
│   └── storage_service.dart     # Secure storage for token
├── providers/
│   ├── auth_provider.dart
│   ├── wallet_provider.dart
│   └── ico_provider.dart
└── screens/
    ├── auth/
    │   ├── signup_screen.dart
    │   ├── otp_verification_screen.dart
    │   ├── pin_setup_screen.dart
    │   └── login_screen.dart
    ├── wallet/
    │   ├── wallet_screen.dart
    │   └── add_money_screen.dart
    ├── ico/
    │   ├── ico_dashboard_screen.dart
    │   ├── buy_ico_screen.dart
    │   └── sell_ico_screen.dart
    └── referral/
        └── referral_screen.dart
```

---

## 📝 Complete Flutter Code

### 1. API Configuration (`config/api_config.dart`)

```dart
class ApiConfig {
  // Base URL - CHANGE THIS FOR LOCAL TESTING
  static const String BASE_URL = 'https://nirv-ico.onrender.com/api';

  // Auth Endpoints
  static const String SIGNUP_MOBILE = '/auth/signup/mobile-init';
  static const String VERIFY_OTP = '/auth/signup/verify';
  static const String SETUP_PIN = '/auth/pin/setup';
  static const String LOGIN_MOBILE_INIT = '/auth/login/mobile-init';
  static const String LOGIN_MOBILE_VERIFY = '/auth/login/mobile-verify';
  static const String LOGIN_PIN = '/auth/login/pin';

  // Wallet Endpoints
  static const String WALLET_SUMMARY = '/wallet/summary';
  static const String WALLET_TOPUP = '/wallet/topup';
  static const String WALLET_TRANSACTIONS = '/wallet/transactions';
  static const String WALLET_WITHDRAW = '/wallet/withdraw';

  // ICO Endpoints
  static const String ICO_PRICE = '/ico/price';
  static const String ICO_SUMMARY = '/ico/summary';
  static const String ICO_BUY = '/ico/buy';
  static const String ICO_SELL = '/ico/sell';
  static const String ICO_TRANSACTIONS = '/ico/transactions';

  // User/Referral Endpoints
  static const String USER_PROFILE = '/user/profile';
  static const String REFERRAL_EARNINGS = '/user/referral/earnings';
  static const String REFERRAL_NETWORK = '/user/referral/network';

  // Helper method to get full URL
  static String getUrl(String endpoint) => BASE_URL + endpoint;
}
```

---

### 2. Storage Service (`services/storage_service.dart`)

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final _storage = const FlutterSecureStorage();

  // Keys
  static const String _tokenKey = 'jwt_token';
  static const String _userIdKey = 'user_id';
  static const String _mobileKey = 'mobile';

  // Save token
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // Get token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Save user data
  Future<void> saveUserData({
    required String userId,
    required String mobile,
  }) async {
    await _storage.write(key: _userIdKey, value: userId);
    await _storage.write(key: _mobileKey, value: mobile);
  }

  // Get user ID
  Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }

  // Get mobile
  Future<String?> getMobile() async {
    return await _storage.read(key: _mobileKey);
  }

  // Clear all data (logout)
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
```

---

### 3. API Service (`services/api_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final _storage = StorageService();

  // GET Request
  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final token = await _storage.getToken();
      final url = Uri.parse(ApiConfig.getUrl(endpoint));

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // POST Request
  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body, {
    bool requiresAuth = false,
  }) async {
    try {
      final token = await _storage.getToken();
      final url = Uri.parse(ApiConfig.getUrl(endpoint));

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (requiresAuth && token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // PUT Request
  Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    try {
      final token = await _storage.getToken();
      final url = Uri.parse(ApiConfig.getUrl(endpoint));

      final response = await http.put(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Handle API Response
  Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {
        'success': true,
        'data': data,
        'statusCode': response.statusCode,
      };
    } else {
      return {
        'success': false,
        'message': data['message'] ?? 'Something went wrong',
        'statusCode': response.statusCode,
      };
    }
  }
}
```

---

### 4. Auth Service (`services/auth_service.dart`)

```dart
import 'api_service.dart';
import 'storage_service.dart';
import '../config/api_config.dart';

class AuthService {
  final _api = ApiService();
  final _storage = StorageService();

  // 1. Mobile Signup
  Future<Map<String, dynamic>> signupWithMobile({
    required String name,
    required String mobile,
    String? referralCode,
  }) async {
    final body = {
      'name': name,
      'mobile': mobile,
      if (referralCode != null && referralCode.isNotEmpty)
        'referralCode': referralCode,
    };

    return await _api.post(ApiConfig.SIGNUP_MOBILE, body);
  }

  // 2. Verify OTP
  Future<Map<String, dynamic>> verifyOTP({
    required String userId,
    required String otp,
  }) async {
    final body = {
      'userId': userId,
      'otp': otp,
      'type': 'mobile',
    };

    final response = await _api.post(ApiConfig.VERIFY_OTP, body);

    // Save token if successful
    if (response['success'] && response['data']['token'] != null) {
      await _storage.saveToken(response['data']['token']);
      await _storage.saveUserData(
        userId: response['data']['_id'],
        mobile: response['data']['mobile'],
      );
    }

    return response;
  }

  // 3. Setup PIN
  Future<Map<String, dynamic>> setupPIN(String pin) async {
    final body = {'pin': pin};
    return await _api.post(ApiConfig.SETUP_PIN, body, requiresAuth: true);
  }

  // 4. Login with Mobile + OTP (Step 1: Request OTP)
  Future<Map<String, dynamic>> loginWithMobileInit(String mobile) async {
    final body = {'mobile': mobile};
    return await _api.post(ApiConfig.LOGIN_MOBILE_INIT, body);
  }

  // 5. Login with Mobile + OTP (Step 2: Verify OTP)
  Future<Map<String, dynamic>> loginWithMobileVerify({
    required String mobile,
    required String otp,
  }) async {
    final body = {
      'mobile': mobile,
      'otp': otp,
    };

    final response = await _api.post(ApiConfig.LOGIN_MOBILE_VERIFY, body);

    // Save token if successful
    if (response['success'] && response['data']['token'] != null) {
      await _storage.saveToken(response['data']['token']);
      await _storage.saveUserData(
        userId: response['data']['_id'],
        mobile: response['data']['mobile'],
      );
    }

    return response;
  }

  // 6. Login with PIN
  Future<Map<String, dynamic>> loginWithPIN({
    required String mobile,
    required String pin,
  }) async {
    final body = {
      'identifier': mobile,
      'pin': pin,
    };

    final response = await _api.post(ApiConfig.LOGIN_PIN, body);

    // Save token if successful
    if (response['success'] && response['data']['token'] != null) {
      await _storage.saveToken(response['data']['token']);
      await _storage.saveUserData(
        userId: response['data']['_id'],
        mobile: response['data']['mobile'],
      );
    }

    return response;
  }

  // 7. Logout
  Future<void> logout() async {
    await _storage.clearAll();
  }

  // 8. Check if logged in
  Future<bool> isLoggedIn() async {
    return await _storage.isLoggedIn();
  }
}
```

---

### 5. Wallet Service (`services/wallet_service.dart`)

```dart
import 'api_service.dart';
import '../config/api_config.dart';

class WalletService {
  final _api = ApiService();

  // 1. Get Wallet Summary
  Future<Map<String, dynamic>> getWalletSummary() async {
    return await _api.get(ApiConfig.WALLET_SUMMARY);
  }

  // 2. Add Money to Wallet (PhonePe)
  Future<Map<String, dynamic>> addMoney({
    required double amount,
    String? note,
  }) async {
    final body = {
      'amount': amount,
      if (note != null) 'note': note,
      'redirectUrl': 'myapp://wallet/success', // Deep link for your app
      'paymentInstrument': {'type': 'PAY_PAGE'},
    };

    return await _api.post(ApiConfig.WALLET_TOPUP, body, requiresAuth: true);
  }

  // 3. Get Wallet Transactions
  Future<Map<String, dynamic>> getTransactions({
    int page = 1,
    int limit = 50,
    String? status,
    String? type,
  }) async {
    String endpoint = '${ApiConfig.WALLET_TRANSACTIONS}?page=$page&limit=$limit';
    if (status != null) endpoint += '&status=$status';
    if (type != null) endpoint += '&type=$type';

    return await _api.get(endpoint);
  }

  // 4. Request Withdrawal
  Future<Map<String, dynamic>> requestWithdrawal({
    required double amount,
    required Map<String, dynamic> payoutDetails,
    String? note,
  }) async {
    final body = {
      'amount': amount,
      'payoutMethod': 'bank_transfer',
      'payoutDetails': payoutDetails,
      if (note != null) 'note': note,
    };

    return await _api.post(ApiConfig.WALLET_WITHDRAW, body, requiresAuth: true);
  }
}
```

---

### 6. ICO Service (`services/ico_service.dart`)

```dart
import 'api_service.dart';
import '../config/api_config.dart';

class IcoService {
  final _api = ApiService();

  // 1. Get ICO Token Price (Public - No Auth)
  Future<Map<String, dynamic>> getTokenPrice() async {
    return await _api.get(ApiConfig.ICO_PRICE);
  }

  // 2. Get ICO Summary (User Holdings)
  Future<Map<String, dynamic>> getIcoSummary() async {
    return await _api.get(ApiConfig.ICO_SUMMARY);
  }

  // 3. Buy ICO Tokens
  Future<Map<String, dynamic>> buyTokens({
    double? tokenAmount,
    double? fiatAmount,
  }) async {
    if (tokenAmount == null && fiatAmount == null) {
      throw Exception('Either tokenAmount or fiatAmount is required');
    }

    final body = {
      if (tokenAmount != null) 'tokenAmount': tokenAmount,
      if (fiatAmount != null) 'fiatAmount': fiatAmount,
    };

    return await _api.post(ApiConfig.ICO_BUY, body, requiresAuth: true);
  }

  // 4. Sell ICO Tokens
  Future<Map<String, dynamic>> sellTokens(double tokenAmount) async {
    final body = {'tokenAmount': tokenAmount};
    return await _api.post(ApiConfig.ICO_SELL, body, requiresAuth: true);
  }

  // 5. Get ICO Transactions
  Future<Map<String, dynamic>> getTransactions() async {
    return await _api.get(ApiConfig.ICO_TRANSACTIONS);
  }
}
```

---

### 7. User Service (`services/user_service.dart`)

```dart
import 'api_service.dart';
import '../config/api_config.dart';

class UserService {
  final _api = ApiService();

  // 1. Get User Profile
  Future<Map<String, dynamic>> getProfile() async {
    return await _api.get(ApiConfig.USER_PROFILE);
  }

  // 2. Get Referral Earnings
  Future<Map<String, dynamic>> getReferralEarnings({
    int page = 1,
    int limit = 50,
  }) async {
    return await _api.get(
      '${ApiConfig.REFERRAL_EARNINGS}?page=$page&limit=$limit',
    );
  }

  // 3. Get Referral Network
  Future<Map<String, dynamic>> getReferralNetwork({
    int page = 1,
    int limit = 50,
    int? depth,
  }) async {
    String endpoint = '${ApiConfig.REFERRAL_NETWORK}?page=$page&limit=$limit';
    if (depth != null) endpoint += '&depth=$depth';

    return await _api.get(endpoint);
  }
}
```

---

## 🎯 Complete App Flow Examples

### Example 1: Signup Flow

```dart
// Screen: SignupScreen
class SignupScreen extends StatefulWidget {
  @override
  _SignupScreenState createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _authService = AuthService();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _referralController = TextEditingController();
  bool _isLoading = false;

  Future<void> _signup() async {
    setState(() => _isLoading = true);

    try {
      final response = await _authService.signupWithMobile(
        name: _nameController.text.trim(),
        mobile: _mobileController.text.trim(),
        referralCode: _referralController.text.trim(),
      );

      if (response['success']) {
        // Navigate to OTP screen
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OTPVerificationScreen(
              userId: response['data']['userId'],
              mobile: _mobileController.text.trim(),
            ),
          ),
        );
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sign Up')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: InputDecoration(labelText: 'Name'),
            ),
            TextField(
              controller: _mobileController,
              decoration: InputDecoration(labelText: 'Mobile Number'),
              keyboardType: TextInputType.phone,
            ),
            TextField(
              controller: _referralController,
              decoration: InputDecoration(
                labelText: 'Referral Code (Optional)',
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _signup,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Sign Up'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### Example 2: OTP Verification

```dart
// Screen: OTPVerificationScreen
class OTPVerificationScreen extends StatefulWidget {
  final String userId;
  final String mobile;

  OTPVerificationScreen({required this.userId, required this.mobile});

  @override
  _OTPVerificationScreenState createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends State<OTPVerificationScreen> {
  final _authService = AuthService();
  final _otpController = TextEditingController();
  bool _isLoading = false;

  Future<void> _verifyOTP() async {
    setState(() => _isLoading = true);

    try {
      final response = await _authService.verifyOTP(
        userId: widget.userId,
        otp: _otpController.text.trim(),
      );

      if (response['success']) {
        // Navigate to PIN setup
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => PINSetupScreen()),
        );
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Verify OTP')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text('OTP sent to ${widget.mobile}'),
            SizedBox(height: 20),
            TextField(
              controller: _otpController,
              decoration: InputDecoration(labelText: 'Enter OTP'),
              keyboardType: TextInputType.number,
              maxLength: 6,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _verifyOTP,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Verify'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### Example 3: PIN Setup

```dart
// Screen: PINSetupScreen
class PINSetupScreen extends StatefulWidget {
  @override
  _PINSetupScreenState createState() => _PINSetupScreenState();
}

class _PINSetupScreenState extends State<PINSetupScreen> {
  final _authService = AuthService();
  final _pinController = TextEditingController();
  final _confirmPinController = TextEditingController();
  bool _isLoading = false;

  Future<void> _setupPIN() async {
    if (_pinController.text != _confirmPinController.text) {
      _showError('PINs do not match');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await _authService.setupPIN(_pinController.text);

      if (response['success']) {
        // Navigate to home/dashboard
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => HomeScreen()),
        );
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Setup PIN')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _pinController,
              decoration: InputDecoration(labelText: 'Enter PIN'),
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 4,
            ),
            TextField(
              controller: _confirmPinController,
              decoration: InputDecoration(labelText: 'Confirm PIN'),
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 4,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _setupPIN,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Setup PIN'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### Example 4: Login with PIN

```dart
// Screen: LoginScreen
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _authService = AuthService();
  final _mobileController = TextEditingController();
  final _pinController = TextEditingController();
  bool _isLoading = false;

  Future<void> _loginWithPIN() async {
    setState(() => _isLoading = true);

    try {
      final response = await _authService.loginWithPIN(
        mobile: _mobileController.text.trim(),
        pin: _pinController.text.trim(),
      );

      if (response['success']) {
        // Navigate to home
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => HomeScreen()),
        );
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _mobileController,
              decoration: InputDecoration(labelText: 'Mobile Number'),
              keyboardType: TextInputType.phone,
            ),
            TextField(
              controller: _pinController,
              decoration: InputDecoration(labelText: 'PIN'),
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 4,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _loginWithPIN,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Login'),
            ),
            TextButton(
              onPressed: () {
                // Navigate to OTP login
              },
              child: Text('Login with OTP instead'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### Example 5: Buy ICO Tokens with PhonePe

```dart
// Screen: BuyICOScreen
class BuyICOScreen extends StatefulWidget {
  @override
  _BuyICOScreenState createState() => _BuyICOScreenState();
}

class _BuyICOScreenState extends State<BuyICOScreen> {
  final _icoService = IcoService();
  final _amountController = TextEditingController();
  bool _isLoading = false;
  double _tokenPrice = 10.0;

  @override
  void initState() {
    super.initState();
    _loadTokenPrice();
  }

  Future<void> _loadTokenPrice() async {
    final response = await _icoService.getTokenPrice();
    if (response['success']) {
      setState(() {
        _tokenPrice = response['data']['price'].toDouble();
      });
    }
  }

  Future<void> _buyTokens() async {
    setState(() => _isLoading = true);

    try {
      final amount = double.parse(_amountController.text);
      final response = await _icoService.buyTokens(fiatAmount: amount);

      if (response['success']) {
        // Get PhonePe payment URL
        final paymentSession = response['data']['paymentSession'];

        // Open PhonePe payment in WebView or browser
        _openPhonePePayment(paymentSession);
      } else {
        _showError(response['message']);
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _openPhonePePayment(Map<String, dynamic> session) {
    // Navigate to WebView screen with payment URL
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PhonePePaymentScreen(
          endpoint: session['endpoint'],
          request: session['request'],
          checksum: session['checksum'],
        ),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Buy ICO Tokens')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Token Price: ₹$_tokenPrice'),
            SizedBox(height: 20),
            TextField(
              controller: _amountController,
              decoration: InputDecoration(
                labelText: 'Amount (INR)',
                helperText: 'Tokens: ${_calculateTokens()}',
              ),
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isLoading ? null : _buyTokens,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Buy Tokens'),
            ),
          ],
        ),
      ),
    );
  }

  String _calculateTokens() {
    try {
      final amount = double.parse(_amountController.text);
      final tokens = amount / _tokenPrice;
      return tokens.toStringAsFixed(2);
    } catch (e) {
      return '0';
    }
  }
}
```

---

## 🌐 PhonePe Payment Integration

### WebView Payment Screen

```dart
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
  _PhonePePaymentScreenState createState() => _PhonePePaymentScreenState();
}

class _PhonePePaymentScreenState extends State<PhonePePaymentScreen> {
  late WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            // Check if payment is complete
            if (url.contains('success') || url.contains('callback')) {
              // Payment completed, go back
              Navigator.pop(context, true);
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
      appBar: AppBar(title: Text('PhonePe Payment')),
      body: WebViewWidget(controller: _controller),
    );
  }
}
```

---

## ✅ Quick Start Checklist

### Step 1: Setup Flutter Project

```bash
flutter create ico_app
cd ico_app
```

### Step 2: Add Dependencies

Copy the dependencies from above to `pubspec.yaml` and run:

```bash
flutter pub get
```

### Step 3: Copy Code Files

1. Create folder structure as shown above
2. Copy all service files
3. Copy API configuration
4. Create UI screens

### Step 4: Test API Connection

```dart
// Test in main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Test API connection
  final icoService = IcoService();
  final response = await icoService.getTokenPrice();
  print('API Response: $response');

  runApp(MyApp());
}
```

### Step 5: Run App

```bash
flutter run
```

---

## 🎯 Summary

### What You Need:

1. ✅ **Base URL**: `https://nirv-ico.onrender.com/api`
2. ✅ **Flutter Code**: All provided above
3. ✅ **Dependencies**: Listed in pubspec.yaml section

### What's Handled by Backend:

- ✅ OTP sending (Twilio)
- ✅ Payment processing (PhonePe)
- ✅ MLM commission distribution
- ✅ Database operations
- ✅ Authentication & security

### Your Flutter App Flow:

```
1. Signup (Mobile + Name + Referral Code)
   ↓
2. Verify OTP
   ↓
3. Setup PIN
   ↓
4. Login (PIN or OTP)
   ↓
5. Add Money to Wallet (PhonePe WebView)
   ↓
6. Buy ICO Tokens (PhonePe WebView)
   ↓
7. View Holdings & Referral Earnings
```

---

## 🚀 You're Ready to Build!

All APIs are live and ready at: **https://nirv-ico.onrender.com/api**

Just copy the code above and start building your Flutter app! 🎉
