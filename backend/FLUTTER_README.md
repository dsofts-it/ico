# 📱 Flutter Integration Package - README

## 🎯 What is This?

This is a **complete integration package** for connecting your Flutter mobile app to the ICO backend API. Everything you need is included - from API documentation to ready-to-use code snippets and AI prompts.

---

## 📦 Package Contents

| File                               | Purpose                               | Use When          |
| ---------------------------------- | ------------------------------------- | ----------------- |
| **FLUTTER_INTEGRATION_SUMMARY.md** | 📋 Start here! Overview of everything | First time setup  |
| **FLUTTER_INTEGRATION_GUIDE.md**   | 📚 Complete API documentation         | Learning the APIs |
| **FLUTTER_QUICK_REFERENCE.md**     | ⚡ Quick lookup & code snippets       | Coding            |
| **AI_CODEX_PROMPT.md**             | 🤖 AI code generation prompt          | Using AI tools    |
| **APP_FLOW_DIAGRAM.md**            | 📊 Visual flow diagrams               | Planning          |

---

## 🚀 Quick Start (3 Steps)

### **Step 1: Read the Summary**

Open `FLUTTER_INTEGRATION_SUMMARY.md` to understand the complete package.

### **Step 2: Choose Your Path**

#### Path A: Manual Integration 👨‍💻

1. Read `FLUTTER_INTEGRATION_GUIDE.md` for complete API docs
2. Use `FLUTTER_QUICK_REFERENCE.md` while coding
3. Refer to `APP_FLOW_DIAGRAM.md` for navigation

#### Path B: AI-Assisted Integration 🤖

1. Copy entire content of `AI_CODEX_PROMPT.md`
2. Paste into Claude, GPT-4, or Codex
3. Review and customize generated code

### **Step 3: Start Building**

```bash
flutter pub add http flutter_secure_storage provider pin_code_fields webview_flutter intl
```

---

## 🔗 Backend API

**Production URL:** `https://nirv-ico.onrender.com/api`

**Status:** ✅ Live and Ready

**Features:**

- ✅ Mobile signup with OTP
- ✅ PIN-based login
- ✅ PhonePe payment integration
- ✅ ICO token trading
- ✅ Wallet management
- ✅ Address management

---

## 📱 App Features to Implement

### **Authentication**

- [x] Mobile signup
- [x] OTP verification
- [x] PIN setup
- [x] PIN login
- [x] OTP login

### **Wallet**

- [x] View balance
- [x] Add money (PhonePe)
- [x] Transaction history

### **ICO Trading**

- [x] View token price
- [x] Buy tokens
- [x] Sell tokens
- [x] View holdings

### **Profile**

- [x] View profile
- [x] Manage addresses
- [x] Edit profile
- [x] Logout

---

## 🎯 Essential APIs

### **Signup Flow**

```
1. POST /auth/signup/mobile-init
   → { name, mobile }
   ← { userId }

2. POST /auth/signup/verify
   → { userId, otp, type: "mobile" }
   ← { token, user }

3. POST /auth/pin/setup
   → { pin }
   ← { message }
```

### **Login Flow**

```
POST /auth/login/pin
→ { identifier, pin }
← { token, user }
```

### **Wallet**

```
GET /ico/summary
← { balance, tokens, value }

POST /ico/buy
→ { tokens }
← { paymentSession }
```

---

## 💡 Key Implementation Tips

### **1. Token Storage**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();
await storage.write(key: 'jwt_token', value: token);
```

### **2. API Calls**

```dart
final response = await http.post(
  Uri.parse('https://nirv-ico.onrender.com/api/auth/login/pin'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: json.encode({'identifier': mobile, 'pin': pin}),
);
```

### **3. PhonePe Payment**

```dart
// Use WebView to open payment URL
final url = '$redirectUrl/$base64Payload';
// Add header: X-VERIFY: $checksum
```

---

## 🧪 Testing

### **Test Credentials**

```
Mobile: 9876543210 (any 10-digit number)
OTP: Check backend console logs
PIN: 1234 (any 4-digit number)
```

### **Postman Collection**

Import `ICO_Full_App_Flow.postman_collection.json` for API testing.

---

## 📚 Documentation Reference

### **For Developers**

- **Complete Guide:** `FLUTTER_INTEGRATION_GUIDE.md`
- **Quick Reference:** `FLUTTER_QUICK_REFERENCE.md`
- **Flow Diagrams:** `APP_FLOW_DIAGRAM.md`

### **For AI Integration**

- **AI Prompt:** `AI_CODEX_PROMPT.md`

### **For Project Managers**

- **Summary:** `FLUTTER_INTEGRATION_SUMMARY.md`

---

## 🔐 Security Checklist

- [ ] Use flutter_secure_storage for tokens
- [ ] Add Authorization header to authenticated requests
- [ ] Handle 401 errors (token expiry)
- [ ] Clear tokens on logout
- [ ] Validate all user inputs
- [ ] Use HTTPS for all API calls

---

## 🎨 UI/UX Guidelines

- ✅ Material Design 3
- ✅ Loading states for all async operations
- ✅ Clear error messages
- ✅ Smooth animations
- ✅ Pull-to-refresh on lists
- ✅ Bottom navigation bar

---

## 📞 Support

**Backend Repository:** https://github.com/dsofts-it/ico

**API Base URL:** https://nirv-ico.onrender.com/api

**Documentation:** See individual markdown files in this package

---

## 🚀 Next Steps

1. ✅ Read `FLUTTER_INTEGRATION_SUMMARY.md`
2. ✅ Choose manual or AI-assisted approach
3. ✅ Set up Flutter project with dependencies
4. ✅ Implement authentication flow
5. ✅ Add wallet functionality
6. ✅ Integrate PhonePe payments
7. ✅ Build ICO trading features
8. ✅ Add profile management
9. ✅ Test thoroughly
10. ✅ Deploy to production

---

## 📊 Project Timeline

**Week 1:** Authentication (Signup, OTP, PIN, Login)
**Week 2:** Wallet (Balance, Add Money, Transactions)
**Week 3:** ICO Trading (Buy, Sell, Holdings)
**Week 4:** Profile (Addresses, Settings, Polish)

---

## ✅ Success Criteria

- [ ] User can signup with mobile
- [ ] User can verify OTP
- [ ] User can setup PIN
- [ ] User can login with PIN
- [ ] User can view wallet balance
- [ ] User can add money via PhonePe
- [ ] User can buy/sell tokens
- [ ] User can manage addresses
- [ ] App handles errors gracefully
- [ ] All APIs work correctly

---

## 🎉 Ready to Build!

**Start with:** `FLUTTER_INTEGRATION_SUMMARY.md`

**Good luck! 🚀**

---

**Version:** 1.0.0  
**Last Updated:** November 29, 2025  
**Status:** Production Ready ✅
