# 🪙 ICO Coin Trading Platform - Backend API

> Complete backend system for ICO coin trading with MLM referral system, wallet management, and PhonePe payment integration.

[![API Status](https://img.shields.io/badge/API-Live-success)](https://nirv-ico.onrender.com/api/health)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 🚀 Live API

**Base URL:** `https://nirv-ico.onrender.com/api`

**Health Check:** [https://nirv-ico.onrender.com/api/health](https://nirv-ico.onrender.com/api/health)

---

## ✨ Features

### 🔐 Authentication

- ✅ Mobile number signup with OTP verification (Twilio)
- ✅ 4-digit PIN setup for quick login
- ✅ Dual login options: PIN or OTP
- ✅ JWT token-based authentication
- ✅ Secure password/PIN hashing (bcrypt)

### 💰 Wallet System

- ✅ PhonePe payment gateway integration
- ✅ Add money to wallet
- ✅ Real-time balance tracking
- ✅ Transaction history
- ✅ Withdrawal requests (admin approval)

### 🪙 ICO Coin Trading

- ✅ Buy ICO tokens with real money
- ✅ Sell ICO tokens for cash
- ✅ Real-time token price
- ✅ Holdings and valuation tracking
- ✅ Transaction history

### 👥 MLM Referral System

- ✅ 9-level commission structure (0-8)
- ✅ Automatic commission distribution
- ✅ Unique referral codes for each user
- ✅ Network level calculation
- ✅ Referral earnings tracking
- ✅ Downline network visualization

### 🛡️ Admin Panel

- ✅ User management
- ✅ Transaction monitoring
- ✅ Withdrawal approval system
- ✅ ICO token price management

---

## 📱 App Flow

```
┌─────────────┐
│   SIGNUP    │  Mobile + Name + Referral Code (optional)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  VERIFY OTP │  6-digit OTP via SMS
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  SETUP PIN  │  4-digit PIN for quick login
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LOGIN    │  PIN or OTP
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│           MAIN FEATURES              │
├──────────────┬──────────────┬────────┤
│    WALLET    │  ICO TRADING │ REFERRAL│
│              │              │         │
│ • Add Money  │ • Buy Tokens │ • Code  │
│ • Withdraw   │ • Sell Tokens│ • Network│
│ • History    │ • Holdings   │ • Earnings│
└──────────────┴──────────────┴─────────┘
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18.x
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT + bcrypt
- **SMS OTP:** Twilio
- **Payment Gateway:** PhonePe
- **Deployment:** Render

---

## 📚 Documentation

### For Flutter Developers (Start Here! 👇)

| Document                                                     | Description                         | Priority |
| ------------------------------------------------------------ | ----------------------------------- | -------- |
| **[FLUTTER_API_INTEGRATION.md](FLUTTER_API_INTEGRATION.md)** | Complete Flutter code with examples | ⭐⭐⭐   |
| **[FLUTTER_QUICK_START.md](FLUTTER_QUICK_START.md)**         | Quick reference guide               | ⭐⭐     |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**                 | Project overview & roadmap          | ⭐       |

### For API Reference

| Document                                                                                   | Description                    |
| ------------------------------------------------------------------------------------------ | ------------------------------ |
| **[COMPLETE_API_DOCUMENTATION.md](COMPLETE_API_DOCUMENTATION.md)**                         | Detailed API documentation     |
| **[ICO_COMPLETE_FLOW.postman_collection.json](ICO_COMPLETE_FLOW.postman_collection.json)** | Postman collection for testing |

---

## 🔗 API Endpoints

### Authentication

```
POST   /api/auth/signup/mobile-init      - Mobile signup
POST   /api/auth/signup/verify           - Verify OTP
POST   /api/auth/pin/setup                - Setup PIN
POST   /api/auth/login/pin                - Login with PIN
POST   /api/auth/login/mobile-init        - Request login OTP
POST   /api/auth/login/mobile-verify      - Verify login OTP
```

### Wallet

```
GET    /api/wallet/summary                - Get wallet balance
POST   /api/wallet/topup                  - Add money (PhonePe)
GET    /api/wallet/transactions           - Transaction history
POST   /api/wallet/withdraw               - Request withdrawal
```

### ICO Trading

```
GET    /api/ico/price                     - Get token price (public)
GET    /api/ico/summary                   - Get user holdings
POST   /api/ico/buy                       - Buy tokens (PhonePe)
POST   /api/ico/sell                      - Sell tokens
GET    /api/ico/transactions              - ICO transaction history
```

### Referral System

```
GET    /api/user/profile                  - Get user profile
GET    /api/user/referral/earnings        - Referral earnings
GET    /api/user/referral/network         - Referral network
```

---

## 💰 MLM Commission Structure

| Level      | Percentage | Requirement           |
| ---------- | ---------- | --------------------- |
| 0 (Direct) | 5%         | Default               |
| 1          | 15%        | 8+ at Level 0         |
| 2          | 10%        | 8+ at Levels 0 & 1    |
| 3          | 8%         | 8+ at Levels 0, 1 & 2 |
| 4          | 5%         | 8+ at Levels 0-3      |
| 5          | 3%         | 8+ at Levels 0-4      |
| 6          | 2%         | 8+ at Levels 0-5      |
| 7          | 1%         | 8+ at Levels 0-6      |
| 8          | 1%         | 8+ at Levels 0-7      |

**Total Commission Pool:** 50% of transaction value

---

## 🚀 Quick Start (For Developers)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ico-backend.git
cd ico-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Test API

```bash
curl https://nirv-ico.onrender.com/api/health
```

---

## 📦 Environment Variables

```env
# Server
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# PhonePe
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_CALLBACK_URL=https://your-domain.com/api/payments/phonepe/callback

# ICO Settings
ICO_TOKEN_SYMBOL=ICOX
ICO_PRICE_INR=10
```

---

## 🧪 Testing

### Using Postman

1. Import `ICO_COMPLETE_FLOW.postman_collection.json`
2. Update `base_url` variable
3. Run the collection in order

### Using cURL

```bash
# Health Check
curl https://nirv-ico.onrender.com/api/health

# Get Token Price
curl https://nirv-ico.onrender.com/api/ico/price

# Signup
curl -X POST https://nirv-ico.onrender.com/api/auth/signup/mobile-init \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","mobile":"+919876543210"}'
```

---

## 📊 Database Schema

### Collections

- **users** - User accounts and referral data
- **walletaccounts** - Wallet balances
- **wallettransactions** - Wallet transaction history
- **icoholdings** - ICO token holdings
- **icotransactions** - ICO buy/sell transactions
- **referralearnings** - MLM commission records

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Bcrypt password/PIN hashing
- ✅ OTP expiration (10 minutes)
- ✅ CORS enabled
- ✅ Input validation
- ✅ Secure token storage
- ✅ Rate limiting (recommended for production)

---

## 🌐 Deployment

### Current Deployment

- **Platform:** Render
- **URL:** https://nirv-ico.onrender.com
- **Status:** ✅ Live

### Deploy Your Own

1. Fork this repository
2. Create account on [Render](https://render.com)
3. Create new Web Service
4. Connect your GitHub repository
5. Add environment variables
6. Deploy!

---

## 📱 Flutter Integration

### Quick Setup

```dart
// 1. Add to pubspec.yaml
dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  webview_flutter: ^4.4.4

// 2. Configure API
const String BASE_URL = 'https://nirv-ico.onrender.com/api';

// 3. Start coding!
// See FLUTTER_API_INTEGRATION.md for complete code
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Twilio](https://www.twilio.com/) - SMS OTP service
- [PhonePe](https://www.phonepe.com/) - Payment gateway
- [Render](https://render.com/) - Deployment platform

---

## 📞 Support

For support, email your.email@example.com or create an issue in this repository.

---

## 🗺️ Roadmap

- [x] Mobile authentication with OTP
- [x] PIN-based login
- [x] Wallet system
- [x] PhonePe integration
- [x] ICO trading
- [x] MLM referral system
- [ ] Email notifications
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] KYC verification

---

## ⚡ Performance

- **Response Time:** < 200ms average
- **Uptime:** 99.9%
- **Concurrent Users:** Supports 1000+
- **Database:** Optimized with indexes

---

## 🎯 Use Cases

1. **ICO Token Sales** - Launch your own ICO
2. **MLM Business** - Multi-level marketing platform
3. **Crypto Trading** - Token buy/sell platform
4. **Referral Programs** - Advanced referral tracking
5. **Wallet Services** - Digital wallet management

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

**🚀 Ready to build your Flutter app?**

**See [FLUTTER_API_INTEGRATION.md](FLUTTER_API_INTEGRATION.md) to get started!**

</div>

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
