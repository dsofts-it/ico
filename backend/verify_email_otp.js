require('dotenv').config();
const { sendOTP } = require('./src/utils/otpService');

// You can hardcode your email here for testing, or set TEST_EMAIL in your .env file
const email = process.env.TEST_EMAIL || 'rohan@dsofts.com';

console.log(`Attempting to send OTP to ${email}...`);
console.log('Checking environment variables...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');
console.log(
  'SENDGRID_API_KEY:',
  process.env.SENDGRID_API_KEY ? 'Set' : 'Not Set',
);

sendOTP(email, '123456', 'email')
  .then((result) => {
    console.log('Result:', result);
    if (result) {
      console.log('✅ OTP sending triggered successfully.');
    } else {
      console.log('❌ OTP sending failed or returned false.');
    }
  })
  .catch((err) => {
    console.error('❌ Error occurred:', err);
  });
