# Twilio Configuration Checklist

## Required Environment Variables

Make sure your `.env` file has these values (no quotes needed):

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## Common Issues & Solutions

### 1. **Phone Number Format**
- Twilio requires E.164 format: `+[country code][number]`
- India: `+918446031622` (not `8446031622`)
- The code now auto-adds `+91` for Indian numbers

### 2. **Twilio Account Verification**
- Trial accounts can only send to verified numbers
- Go to Twilio Console → Phone Numbers → Verified Caller IDs
- Add `+918446031622` to verified numbers

### 3. **Twilio Phone Number**
- Must be a Twilio number (not your personal number)
- Format: `+1234567890` (with country code)
- Get one from: Twilio Console → Phone Numbers → Buy a Number

### 4. **Check Twilio Credentials**
- Account SID: Starts with `AC`
- Auth Token: 32-character string
- Find them at: https://console.twilio.com/

### 5. **Restart Server After .env Changes**
- Stop server (Ctrl+C)
- Run: `npm run dev`

## Testing Steps

1. **Check Server Logs** - Look for:
   ```
   Attempting to send SMS...
   Twilio Account SID: Set
   Twilio Auth Token: Set
   Twilio Phone Number: +1234567890
   ```

2. **If SMS Fails** - Server will log OTP to console as fallback:
   ```
   [FALLBACK - MOCK SMS] OTP for 8446031622: 123456
   ```

3. **Check Twilio Logs**
   - Go to: https://console.twilio.com/monitor/logs/sms
   - See delivery status and error messages

## Verification Checklist

- [ ] Twilio Account SID is correct (starts with AC)
- [ ] Auth Token is correct (32 characters)
- [ ] Twilio Phone Number includes country code (+1...)
- [ ] Recipient number is verified (for trial accounts)
- [ ] Server restarted after .env changes
- [ ] No quotes around values in .env file
