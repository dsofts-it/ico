# 📱 Flutter App Integration - Complete Package

## 🎯 Overview

This package contains everything you need to integrate your existing Flutter app with the ICO backend API deployed at **https://nirv-ico.onrender.com/api**.

---

## 📚 Documentation Files

### 1. **FLUTTER_INTEGRATION_GUIDE.md** ⭐ START HERE

**Purpose:** Complete integration guide with all API endpoints, request/response examples, and step-by-step flows.

**What's Inside:**

- ✅ Complete API documentation
- ✅ Authentication flow (Signup → OTP → PIN → Login)
- ✅ Wallet section with PhonePe integration
- ✅ ICO token trading APIs
- ✅ Profile and address management
- ✅ Error handling guide
- ✅ Testing instructions

**Best For:** Understanding the complete backend API structure and integration requirements.

---

### 2. **FLUTTER_QUICK_REFERENCE.md** 🚀 QUICK START

**Purpose:** Quick reference card with essential endpoints and code snippets.

**What's Inside:**

- ✅ All API endpoints in one place
- ✅ Ready-to-use Flutter code snippets
- ✅ API service implementation
- ✅ Secure token storage
- ✅ PhonePe payment integration code
- ✅ Testing checklist

**Best For:** Quick lookup while coding and copy-paste ready code examples.

---

### 3. **AI_CODEX_PROMPT.md** 🤖 AI INTEGRATION

**Purpose:** Comprehensive prompt for AI code generators (Codex, Claude, GPT, etc.)

**What's Inside:**

- ✅ Complete project architecture
- ✅ All models with full code
- ✅ All services with implementations
- ✅ Provider pattern setup
- ✅ UI screen templates
- ✅ Detailed requirements
- ✅ Success criteria

**Best For:** Using AI to generate the complete Flutter app automatically.

---

### 4. **APP_FLOW_DIAGRAM.md** 📊 VISUAL GUIDE

**Purpose:** Visual flow diagrams showing complete app navigation and user journeys.

**What's Inside:**

- ✅ User flow diagrams
- ✅ Screen navigation maps
- ✅ API flow charts
- ✅ State management structure
- ✅ Security flow
- ✅ Performance optimization tips

**Best For:** Understanding the big picture and planning the implementation.

---

## 🔑 Backend Credentials

### **API Base URL**

```
Production: https://nirv-ico.onrender.com/api
```

### **Required Environment Variables (Backend)**

The backend is already configured with:

- ✅ MongoDB Database
- ✅ JWT Authentication
- ✅ Twilio SMS (for OTP)
- ✅ PhonePe Payment Gateway (Sandbox)
- ✅ ICO Token Settings (ICOX @ ₹10)

**Note:** All credentials are configured on the backend. Flutter app only needs to call the APIs.

---

## 🚀 Quick Start Guide

### **Step 1: Choose Your Approach**

#### Option A: Manual Integration (Recommended for Learning)

1. Read `FLUTTER_INTEGRATION_GUIDE.md`
2. Use `FLUTTER_QUICK_REFERENCE.md` for code snippets
3. Refer to `APP_FLOW_DIAGRAM.md` for navigation
4. Implement step by step

#### Option B: AI-Assisted Integration (Fastest)

1. Copy the entire content of `AI_CODEX_PROMPT.md`
2. Paste it into your AI code generator (Claude, GPT-4, Codex, etc.)
3. Review and customize the generated code
4. Test and deploy

---

### **Step 2: Set Up Flutter Project**

```bash
# Create new Flutter project (if needed)
flutter create ico_app
cd ico_app

# Add required dependencies
flutter pub add http flutter_secure_storage provider pin_code_fields webview_flutter intl

# Or add to pubspec.yaml:
```

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

---

### **Step 3: Implement Core Features**

#### Priority 1: Authentication (Week 1)

- [ ] Mobile signup screen
- [ ] OTP verification screen
- [ ] PIN setup screen
- [ ] Login screen (PIN + OTP options)
- [ ] Secure token storage

#### Priority 2: Wallet (Week 2)

- [ ] Wallet dashboard
- [ ] Balance display
- [ ] Add money screen
- [ ] PhonePe payment integration
- [ ] Transaction history

#### Priority 3: ICO Trading (Week 3)

- [ ] ICO dashboard
- [ ] Buy tokens screen
- [ ] Sell tokens screen
- [ ] Holdings display

#### Priority 4: Profile (Week 4)

- [ ] Profile screen
- [ ] Address management
- [ ] Edit profile
- [ ] Logout functionality

---

## 📱 App Features Checklist

### **Authentication Features**

- ✅ Mobile number signup
- ✅ OTP verification (SMS via Twilio)
- ✅ 4-digit PIN setup
- ✅ Login with PIN (fast)
- ✅ Login with OTP (secure)
- ✅ Secure JWT token storage
- ✅ Auto-logout on token expiry

### **Wallet Features**

- ✅ View current balance
- ✅ Add money via PhonePe
- ✅ Transaction history
- ✅ Filter transactions
- ✅ Pull-to-refresh

### **ICO Trading Features**

- ✅ View token price (ICOX)
- ✅ Buy tokens with PhonePe
- ✅ Sell tokens (request)
- ✅ View holdings
- ✅ Profit/Loss calculation
- ✅ Transaction status tracking

### **Profile Features**

- ✅ View profile information
- ✅ Manage multiple addresses
- ✅ Add/Edit/Delete addresses
- ✅ Set default address
- ✅ Change PIN
- ✅ Logout

---

## 🔐 Security Implementation

### **Token Management**

```dart
// Store token securely
await StorageService.saveToken(token);

// Add to all authenticated requests
headers: {
  'Authorization': 'Bearer $token',
}

// Handle token expiry
if (response.statusCode == 401) {
  await StorageService.clearAll();
  Navigator.pushReplacementNamed(context, '/login');
}
```

### **PIN Security**

- PIN is hashed on backend (bcrypt)
- Never stored in plain text
- 4-6 digit validation
- Confirm PIN during setup

### **Payment Security**

- PhonePe handles payment processing
- Secure checksum verification
- HTTPS for all API calls
- Callback URL validation

---

## 💳 PhonePe Integration Guide

### **How It Works**

1. **User initiates payment** (Add money or Buy tokens)
2. **Backend creates payment session**
3. **Flutter receives:**

   - `base64Payload` - Payment data
   - `checksum` - Security verification
   - `redirectUrl` - PhonePe gateway URL

4. **Flutter opens WebView:**

   ```dart
   final url = '$redirectUrl/$base64Payload';
   // Add header: X-VERIFY: $checksum
   ```

5. **User completes payment on PhonePe**
6. **PhonePe calls backend callback**
7. **Backend updates order/transaction status**
8. **Flutter polls for status update**
9. **Show success/failure message**

### **Implementation**

See `FLUTTER_QUICK_REFERENCE.md` → PhonePe Payment Integration section for complete code.

---

## 🧪 Testing Guide

### **Test Credentials**

```
Mobile: Any 10-digit number (e.g., 9876543210)
OTP: Check backend console logs (or SMS if Twilio configured)
PIN: Any 4-digit number (e.g., 1234)
```

### **Test Flow**

1. **Signup Test**

   ```
   POST /auth/signup/mobile-init
   Body: { "name": "Test User", "mobile": "9876543210" }
   ```

2. **Check OTP** (Backend logs or SMS)

3. **Verify OTP**

   ```
   POST /auth/signup/verify
   Body: { "userId": "xxx", "otp": "123456", "type": "mobile" }
   ```

4. **Setup PIN**

   ```
   POST /auth/pin/setup
   Headers: Authorization: Bearer {token}
   Body: { "pin": "1234" }
   ```

5. **Login with PIN**
   ```
   POST /auth/login/pin
   Body: { "identifier": "9876543210", "pin": "1234" }
   ```

### **Postman Collection**

Import `ICO_Full_App_Flow.postman_collection.json` for ready-to-use API tests.

---

## 📊 API Endpoint Summary

### **Authentication (No Auth Required)**

```
POST /auth/signup/mobile-init
POST /auth/signup/verify
POST /auth/login/pin
POST /auth/login/mobile-init
POST /auth/login/mobile-verify
```

### **Authenticated Endpoints (Require JWT Token)**

```
POST /auth/pin/setup
GET  /ico/summary
GET  /ico/transactions
POST /ico/buy
POST /ico/sell
GET  /user/addresses
POST /user/addresses
PUT  /user/addresses/:id
DELETE /user/addresses/:id
PATCH /user/addresses/:id/default
```

### **Public Endpoints**

```
GET /ico/price
```

---

## 🎨 UI/UX Guidelines

### **Design Principles**

- ✅ Material Design 3
- ✅ Clean, modern interface
- ✅ Smooth animations
- ✅ Intuitive navigation
- ✅ Clear error messages
- ✅ Loading states everywhere
- ✅ Pull-to-refresh on lists

### **Color Scheme Suggestion**

```dart
Primary: Color(0xFF6200EE)    // Purple
Secondary: Color(0xFF03DAC6)  // Teal
Success: Color(0xFF4CAF50)    // Green
Error: Color(0xFFB00020)      // Red
Background: Color(0xFFF5F5F5) // Light Gray
```

### **Key Screens**

- Splash screen with logo
- Clean login/signup forms
- Dashboard with cards
- Transaction list with icons
- Profile with avatar
- Bottom navigation bar

---

## 🐛 Common Issues & Solutions

### **Issue 1: OTP Not Received**

**Solution:** Check backend console logs. In development, OTPs are logged. For production, configure Twilio credentials.

### **Issue 2: Token Expired**

**Solution:** Implement auto-logout on 401 errors and redirect to login.

### **Issue 3: Payment Not Working**

**Solution:** Ensure WebView has JavaScript enabled and proper headers are set.

### **Issue 4: Address Not Saving**

**Solution:** Verify all required fields are provided and token is valid.

---

## 📞 Support & Resources

### **Documentation**

- Backend README: `README.md`
- API Testing Guide: `API_TESTING_GUIDE.md`
- Twilio Setup: `TWILIO_SETUP.md`

### **Postman Collections**

- Full App Flow: `ICO_Full_App_Flow.postman_collection.json`
- Render E2E: `ICO_Render_E2E.postman_collection.json`

### **Backend Repository**

```
https://github.com/dsofts-it/ico
```

---

## 🚀 Deployment Checklist

### **Before Production**

- [ ] Test all authentication flows
- [ ] Test PhonePe payments (sandbox)
- [ ] Verify error handling
- [ ] Test on multiple devices
- [ ] Check token expiry handling
- [ ] Verify logout functionality
- [ ] Test network error scenarios
- [ ] Review security measures

### **Production Setup**

- [ ] Switch PhonePe to production credentials
- [ ] Configure real Twilio credentials
- [ ] Update API base URL if needed
- [ ] Enable analytics
- [ ] Set up crash reporting
- [ ] Configure app signing
- [ ] Prepare app store listings

---

## 📈 Next Steps

### **Phase 1: MVP (4 Weeks)**

✅ Complete authentication flow
✅ Basic wallet functionality
✅ ICO trading (buy/sell)
✅ Profile management

### **Phase 2: Enhancements (2 Weeks)**

- Add email signup option
- Implement push notifications
- Add biometric authentication
- Enhanced transaction filters
- Dark mode support

### **Phase 3: Advanced Features (4 Weeks)**

- Referral system
- KYC verification
- Advanced analytics
- Multi-language support
- In-app chat support

---

## 🎯 Success Metrics

### **Technical Metrics**

- ✅ All APIs working correctly
- ✅ <2s average response time
- ✅ 99% uptime
- ✅ Zero critical bugs
- ✅ Secure token management

### **User Experience Metrics**

- ✅ Smooth signup flow (<2 minutes)
- ✅ Fast login (<10 seconds)
- ✅ Successful payment completion
- ✅ Intuitive navigation
- ✅ Clear error messages

---

## 📝 Final Notes

### **Important Reminders**

1. **Always use HTTPS** for API calls
2. **Store tokens securely** using flutter_secure_storage
3. **Handle errors gracefully** with user-friendly messages
4. **Test payment flow** thoroughly before production
5. **Implement logging** for debugging
6. **Follow Material Design** guidelines
7. **Optimize performance** with proper state management
8. **Test on real devices** not just emulators

### **Best Practices**

- Use const constructors where possible
- Implement proper error boundaries
- Add loading states for all async operations
- Use meaningful variable names
- Comment complex logic
- Follow Flutter style guide
- Write unit tests for critical functions

---

## 🎉 You're Ready to Build!

Choose your path:

1. **Manual Integration** → Start with `FLUTTER_INTEGRATION_GUIDE.md`
2. **AI-Assisted** → Use `AI_CODEX_PROMPT.md`
3. **Quick Reference** → Keep `FLUTTER_QUICK_REFERENCE.md` handy
4. **Visual Planning** → Review `APP_FLOW_DIAGRAM.md`

**Good luck with your integration! 🚀**

---

## 📧 Contact

For backend issues or questions:

- Repository: https://github.com/dsofts-it/ico
- Backend API: https://nirv-ico.onrender.com/api

---

**Last Updated:** November 29, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
