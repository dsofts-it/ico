# Auth Backend - Node.js + Express + MongoDB

Complete authentication backend with Email/Mobile signup, OTP verification, and PIN login.

## Features

- **Email Signup**: Register with email, password, and OTP verification
- **Mobile Signup**: Register with mobile number and OTP verification
- **Multiple Login Methods**:
  - Email + Password
  - Mobile + OTP
  - PIN (after setup)
- **Security**: JWT authentication, bcrypt password hashing
- **OTP Delivery**: SMTP (email) and Twilio (SMS) integration

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- Bcrypt
- Nodemailer (SMTP)
- Twilio (SMS)

## Installation

1. Clone the repository
```bash
git clone https://github.com/dsofts-it/ico.git
cd ico/backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your credentials:
- MongoDB URI
- JWT Secret
- SMTP credentials (for email OTP)
- Twilio credentials (for SMS OTP)

4. Start the server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/email-init` | Initiate email signup |
| POST | `/api/auth/signup/mobile-init` | Initiate mobile signup |
| POST | `/api/auth/signup/verify` | Verify OTP (email/mobile) |
| POST | `/api/auth/pin/setup` | Setup PIN (requires auth) |
| POST | `/api/auth/login/email` | Login with email/password |
| POST | `/api/auth/login/mobile-init` | Request mobile OTP |
| POST | `/api/auth/login/mobile-verify` | Verify mobile OTP & login |
| POST | `/api/auth/login/pin` | Login with PIN |

## Testing

Import `POSTMAN_COLLECTION.json` into Postman for ready-to-use API tests.

See `API_TESTING_GUIDE.md` for detailed testing instructions.

## Configuration

### Twilio Setup
For SMS OTP delivery, configure Twilio:
1. Create account at https://www.twilio.com
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env` file
4. For trial accounts, verify recipient numbers

See `TWILIO_SETUP.md` for detailed setup instructions.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   ├── utils/
│   │   ├── generateToken.js   # JWT generator
│   │   └── otpService.js      # OTP service
│   ├── app.js                 # Express app
│   └── server.js              # Entry point
├── .env.example               # Environment template
├── package.json
└── README.md
```

## License

ISC
