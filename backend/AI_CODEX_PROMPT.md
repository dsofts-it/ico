# AI Code Generation Prompt for Flutter App Integration

## Project Overview

Create a complete, production-ready Flutter mobile application that integrates with the ICO backend API deployed at `https://nirv-ico.onrender.com/api`. The app should handle user authentication, wallet management with PhonePe payments, ICO token trading, and user profile management.

---

## Technical Stack

### Flutter Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP & Networking
  http: ^1.1.0
  dio: ^5.4.0

  # State Management
  provider: ^6.1.1

  # Secure Storage
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2

  # UI Components
  pin_code_fields: ^8.0.1
  otp_text_field: ^1.1.3

  # WebView for Payments
  webview_flutter: ^4.4.2
  url_launcher: ^6.2.2

  # Utilities
  intl: ^0.19.0
  logger: ^2.0.2
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0

  # UI Enhancement
  shimmer: ^3.0.0
  lottie: ^2.7.0
```

---

## App Architecture

### Folder Structure

```
lib/
├── main.dart
├── config/
│   ├── app_config.dart          # API URLs, constants
│   ├── theme.dart               # App theme configuration
│   └── routes.dart              # Named routes

├── models/
│   ├── user_model.dart
│   ├── transaction_model.dart
│   ├── address_model.dart
│   ├── ico_summary_model.dart
│   └── payment_session_model.dart

├── services/
│   ├── api_service.dart         # Base HTTP service
│   ├── auth_service.dart        # Authentication APIs
│   ├── wallet_service.dart      # Wallet & ICO APIs
│   ├── user_service.dart        # Profile & Address APIs
│   ├── storage_service.dart     # Secure storage
│   └── payment_service.dart     # PhonePe integration

├── providers/
│   ├── auth_provider.dart
│   ├── wallet_provider.dart
│   └── user_provider.dart

├── screens/
│   ├── splash_screen.dart
│   ├── auth/
│   │   ├── mobile_signup_screen.dart
│   │   ├── otp_verification_screen.dart
│   │   ├── pin_setup_screen.dart
│   │   ├── login_screen.dart
│   │   └── pin_login_screen.dart

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
│       ├── edit_profile_screen.dart
│       ├── address_list_screen.dart
│       └── add_edit_address_screen.dart
└── widgets/
    ├── custom_button.dart
    ├── custom_text_field.dart
    ├── loading_overlay.dart
    ├── error_dialog.dart
    └── transaction_card.dart
```

---

## Detailed Implementation Requirements

### 1. Configuration (config/app_config.dart)

```dart
class AppConfig {
  static const String baseUrl = 'https://nirv-ico.onrender.com/api';
  static const String tokenKey = 'jwt_token';
  static const String userKey = 'user_data';

  // API Endpoints
  static const String signupMobileInit = '/auth/signup/mobile-init';
  static const String signupVerify = '/auth/signup/verify';
  static const String pinSetup = '/auth/pin/setup';
  static const String loginPin = '/auth/login/pin';
  static const String loginMobileInit = '/auth/login/mobile-init';
  static const String loginMobileVerify = '/auth/login/mobile-verify';

  static const String icoPrice = '/ico/price';
  static const String icoSummary = '/ico/summary';
  static const String icoTransactions = '/ico/transactions';
  static const String icoBuy = '/ico/buy';
  static const String icoSell = '/ico/sell';

  static const String userAddresses = '/user/addresses';
}
```

### 2. Models

#### user_model.dart

```dart
class UserModel {
  final String id;
  final String name;
  final String? mobile;
  final String? email;
  final bool isMobileVerified;
  final bool isEmailVerified;
  final String role;

  UserModel({
    required this.id,
    required this.name,
    this.mobile,
    this.email,
    required this.isMobileVerified,
    required this.isEmailVerified,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'],
      name: json['name'],
      mobile: json['mobile'],
      email: json['email'],
      isMobileVerified: json['isMobileVerified'] ?? false,
      isEmailVerified: json['isEmailVerified'] ?? false,
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'mobile': mobile,
      'email': email,
      'isMobileVerified': isMobileVerified,
      'isEmailVerified': isEmailVerified,
      'role': role,
    };
  }
}
```

#### transaction_model.dart

```dart
class TransactionModel {
  final String id;
  final String type; // 'buy' or 'sell'
  final int tokens;
  final double pricePerToken;
  final double totalAmountINR;
  final String paymentStatus;
  final DateTime createdAt;

  TransactionModel({
    required this.id,
    required this.type,
    required this.tokens,
    required this.pricePerToken,
    required this.totalAmountINR,
    required this.paymentStatus,
    required this.createdAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['_id'],
      type: json['type'],
      tokens: json['tokens'],
      pricePerToken: (json['pricePerToken'] as num).toDouble(),
      totalAmountINR: (json['totalAmountINR'] as num).toDouble(),
      paymentStatus: json['paymentStatus'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
```

#### address_model.dart

```dart
class AddressModel {
  final String? id;
  final String label;
  final String fullName;
  final String phone;
  final String line1;
  final String? line2;
  final String city;
  final String state;
  final String postalCode;
  final String country;
  final String? landmark;
  final bool isDefault;

  AddressModel({
    this.id,
    required this.label,
    required this.fullName,
    required this.phone,
    required this.line1,
    this.line2,
    required this.city,
    required this.state,
    required this.postalCode,
    this.country = 'IN',
    this.landmark,
    this.isDefault = false,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['_id'],
      label: json['label'] ?? '',
      fullName: json['fullName'] ?? '',
      phone: json['phone'] ?? '',
      line1: json['line1'] ?? '',
      line2: json['line2'],
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      postalCode: json['postalCode'] ?? '',
      country: json['country'] ?? 'IN',
      landmark: json['landmark'],
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'label': label,
      'fullName': fullName,
      'phone': phone,
      'line1': line1,
      if (line2 != null) 'line2': line2,
      'city': city,
      'state': state,
      'postalCode': postalCode,
      'country': country,
      if (landmark != null) 'landmark': landmark,
      'isDefault': isDefault,
    };
  }
}
```

#### ico_summary_model.dart

```dart
class IcoSummaryModel {
  final String tokenSymbol;
  final double pricePerToken;
  final int totalTokens;
  final double totalInvestedINR;
  final double currentValueINR;
  final double profitLoss;
  final double profitLossPercent;

  IcoSummaryModel({
    required this.tokenSymbol,
    required this.pricePerToken,
    required this.totalTokens,
    required this.totalInvestedINR,
    required this.currentValueINR,
    required this.profitLoss,
    required this.profitLossPercent,
  });

  factory IcoSummaryModel.fromJson(Map<String, dynamic> json) {
    return IcoSummaryModel(
      tokenSymbol: json['tokenSymbol'],
      pricePerToken: (json['pricePerToken'] as num).toDouble(),
      totalTokens: json['totalTokens'],
      totalInvestedINR: (json['totalInvestedINR'] as num).toDouble(),
      currentValueINR: (json['currentValueINR'] as num).toDouble(),
      profitLoss: (json['profitLoss'] as num).toDouble(),
      profitLossPercent: (json['profitLossPercent'] as num).toDouble(),
    );
  }
}
```

### 3. Services

#### storage_service.dart

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class StorageService {
  static const _storage = FlutterSecureStorage();

  static Future<void> saveToken(String token) async {
    await _storage.write(key: AppConfig.tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: AppConfig.tokenKey);
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: AppConfig.tokenKey);
  }

  static Future<void> saveUser(UserModel user) async {
    await _storage.write(
      key: AppConfig.userKey,
      value: json.encode(user.toJson()),
    );
  }

  static Future<UserModel?> getUser() async {
    final userJson = await _storage.read(key: AppConfig.userKey);
    if (userJson != null) {
      return UserModel.fromJson(json.decode(userJson));
    }
    return null;
  }

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
```

#### api_service.dart

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:logger/logger.dart';

class ApiService {
  final Logger _logger = Logger();

  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body, {
    String? token,
  }) async {
    try {
      final url = Uri.parse('${AppConfig.baseUrl}$endpoint');
      _logger.d('POST $url');
      _logger.d('Body: $body');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode(body),
      );

      _logger.d('Response: ${response.statusCode}');
      _logger.d('Response Body: ${response.body}');

      final responseData = json.decode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return responseData;
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Unknown error',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      _logger.e('API Error: $e');
      rethrow;
    }
  }

  Future<dynamic> get(String endpoint, {String? token}) async {
    try {
      final url = Uri.parse('${AppConfig.baseUrl}$endpoint');
      _logger.d('GET $url');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      _logger.d('Response: ${response.statusCode}');
      _logger.d('Response Body: ${response.body}');

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Unknown error',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      _logger.e('API Error: $e');
      rethrow;
    }
  }

  Future<dynamic> put(
    String endpoint,
    Map<String, dynamic> body, {
    String? token,
  }) async {
    try {
      final url = Uri.parse('${AppConfig.baseUrl}$endpoint');
      final response = await http.put(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode(body),
      );

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Unknown error',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> delete(String endpoint, {String? token}) async {
    try {
      final url = Uri.parse('${AppConfig.baseUrl}$endpoint');
      final response = await http.delete(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 200) {
        final responseData = json.decode(response.body);
        throw ApiException(
          message: responseData['message'] ?? 'Unknown error',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<dynamic> patch(
    String endpoint, {
    Map<String, dynamic>? body,
    String? token,
  }) async {
    try {
      final url = Uri.parse('${AppConfig.baseUrl}$endpoint');
      final response = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: body != null ? json.encode(body) : null,
      );

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Unknown error',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      rethrow;
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => message;
}
```

#### auth_service.dart

```dart
class AuthService {
  final ApiService _api = ApiService();

  Future<String> signupMobileInit(String name, String mobile) async {
    final response = await _api.post(
      AppConfig.signupMobileInit,
      {'name': name, 'mobile': mobile},
    );
    return response['userId'];
  }

  Future<Map<String, dynamic>> verifyOTP(
    String userId,
    String otp,
  ) async {
    final response = await _api.post(
      AppConfig.signupVerify,
      {'userId': userId, 'otp': otp, 'type': 'mobile'},
    );

    // Save token and user
    await StorageService.saveToken(response['token']);
    final user = UserModel.fromJson(response);
    await StorageService.saveUser(user);

    return response;
  }

  Future<void> setupPIN(String pin) async {
    final token = await StorageService.getToken();
    await _api.post(
      AppConfig.pinSetup,
      {'pin': pin},
      token: token,
    );
  }

  Future<Map<String, dynamic>> loginWithPIN(
    String mobile,
    String pin,
  ) async {
    final response = await _api.post(
      AppConfig.loginPin,
      {'identifier': mobile, 'pin': pin},
    );

    await StorageService.saveToken(response['token']);
    final user = UserModel.fromJson(response);
    await StorageService.saveUser(user);

    return response;
  }

  Future<void> loginMobileInit(String mobile) async {
    await _api.post(
      AppConfig.loginMobileInit,
      {'mobile': mobile},
    );
  }

  Future<Map<String, dynamic>> loginMobileVerify(
    String mobile,
    String otp,
  ) async {
    final response = await _api.post(
      AppConfig.loginMobileVerify,
      {'mobile': mobile, 'otp': otp},
    );

    await StorageService.saveToken(response['token']);
    final user = UserModel.fromJson(response);
    await StorageService.saveUser(user);

    return response;
  }

  Future<void> logout() async {
    await StorageService.clearAll();
  }
}
```

#### wallet_service.dart

```dart
class WalletService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getTokenPrice() async {
    return await _api.get(AppConfig.icoPrice);
  }

  Future<IcoSummaryModel> getIcoSummary() async {
    final token = await StorageService.getToken();
    final response = await _api.get(AppConfig.icoSummary, token: token);
    return IcoSummaryModel.fromJson(response);
  }

  Future<List<TransactionModel>> getTransactions() async {
    final token = await StorageService.getToken();
    final response = await _api.get(AppConfig.icoTransactions, token: token);
    return (response as List)
        .map((json) => TransactionModel.fromJson(json))
        .toList();
  }

  Future<Map<String, dynamic>> buyTokens(int tokens) async {
    final token = await StorageService.getToken();
    return await _api.post(
      AppConfig.icoBuy,
      {'tokens': tokens},
      token: token,
    );
  }

  Future<Map<String, dynamic>> sellTokens(int tokens) async {
    final token = await StorageService.getToken();
    return await _api.post(
      AppConfig.icoSell,
      {'tokens': tokens},
      token: token,
    );
  }
}
```

### 4. Providers (State Management)

#### auth_provider.dart

```dart
import 'package:flutter/foundation.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  UserModel? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;

  UserModel? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await StorageService.getToken();
      final user = await StorageService.getUser();

      if (token != null && user != null) {
        _user = user;
        _isAuthenticated = true;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String> signupMobile(String name, String mobile) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final userId = await _authService.signupMobileInit(name, mobile);
      return userId;
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> verifyOTP(String userId, String otp) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.verifyOTP(userId, otp);
      _user = UserModel.fromJson(response);
      _isAuthenticated = true;
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> setupPIN(String pin) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.setupPIN(pin);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loginWithPIN(String mobile, String pin) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.loginWithPIN(mobile, pin);
      _user = UserModel.fromJson(response);
      _isAuthenticated = true;
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
```

### 5. UI Screens

#### mobile_signup_screen.dart

```dart
class MobileSignupScreen extends StatefulWidget {
  @override
  _MobileSignupScreenState createState() => _MobileSignupScreenState();
}

class _MobileSignupScreenState extends State<MobileSignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sign Up')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(labelText: 'Full Name'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _mobileController,
                decoration: InputDecoration(labelText: 'Mobile Number'),
                keyboardType: TextInputType.phone,
                maxLength: 10,
                validator: (value) {
                  if (value == null || value.length != 10) {
                    return 'Please enter a valid 10-digit mobile number';
                  }
                  return null;
                },
              ),
              SizedBox(height: 24),
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  return ElevatedButton(
                    onPressed: auth.isLoading
                        ? null
                        : () async {
                            if (_formKey.currentState!.validate()) {
                              try {
                                final userId = await auth.signupMobile(
                                  _nameController.text,
                                  _mobileController.text,
                                );
                                Navigator.pushNamed(
                                  context,
                                  '/otp-verification',
                                  arguments: {
                                    'userId': userId,
                                    'mobile': _mobileController.text,
                                  },
                                );
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(e.toString())),
                                );
                              }
                            }
                          },
                    child: auth.isLoading
                        ? CircularProgressIndicator()
                        : Text('Send OTP'),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

#### payment_webview_screen.dart

```dart
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
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            setState(() => _isLoading = false);

            // Check if payment completed
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
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
```

---

## Key Implementation Points

### 1. Error Handling

- Implement try-catch blocks in all API calls
- Show user-friendly error messages
- Handle network errors gracefully
- Implement retry logic for failed requests

### 2. Loading States

- Show loading indicators during API calls
- Disable buttons while processing
- Use shimmer effects for loading lists

### 3. Form Validation

- Validate mobile number (10 digits)
- Validate OTP (6 digits)
- Validate PIN (4-6 digits)
- Validate address fields

### 4. Security

- Store JWT token in flutter_secure_storage
- Clear token on logout
- Handle 401 errors (token expiry)
- Implement auto-logout

### 5. PhonePe Integration

- Use WebView for payment
- Handle success/failure callbacks
- Poll transaction status after payment
- Show payment confirmation

### 6. UI/UX

- Material Design 3
- Smooth animations
- Pull-to-refresh on lists
- Bottom navigation bar
- Custom theme colors
- Responsive design

---

## Testing Requirements

1. **Authentication Flow**

   - Test signup with valid/invalid mobile
   - Test OTP verification
   - Test PIN setup
   - Test PIN login
   - Test OTP login

2. **Wallet Operations**

   - Test balance display
   - Test add money flow
   - Test PhonePe payment
   - Test transaction history

3. **ICO Trading**

   - Test buy tokens
   - Test sell tokens
   - Test holdings display

4. **Profile Management**

   - Test address CRUD operations
   - Test default address setting

5. **Error Scenarios**
   - Test network errors
   - Test invalid credentials
   - Test expired OTP
   - Test payment failures

---

## Deliverables

1. Complete Flutter app source code
2. All models, services, and providers
3. All UI screens with proper navigation
4. Error handling and loading states
5. PhonePe payment integration
6. Secure token storage
7. README with setup instructions
8. Comments in code for clarity

---

## Success Criteria

✅ User can signup with mobile number
✅ User can verify OTP
✅ User can setup PIN
✅ User can login with PIN
✅ User can view wallet balance
✅ User can add money via PhonePe
✅ User can buy/sell ICO tokens
✅ User can manage addresses
✅ App handles errors gracefully
✅ App has smooth, modern UI
✅ All API integrations work correctly
