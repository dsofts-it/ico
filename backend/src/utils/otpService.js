const nodemailer = require('nodemailer');
const twilio = require('twilio');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to email: ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email OTP:', error);
    throw new Error('Failed to send OTP via Email');
  }
};

const sendSmsOTP = async (mobile, otp) => {
  try {
    // Ensure mobile number has country code
    let formattedMobile = mobile;
    if (!mobile.startsWith('+')) {
      formattedMobile = '+91' + mobile; // Add India country code
    }

    console.log('Attempting to send SMS...');
    console.log('Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not Set');
    console.log('Twilio Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not Set');
    console.log('Twilio Phone Number:', process.env.TWILIO_PHONE_NUMBER);
    console.log('Recipient:', formattedMobile);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedMobile,
    });

    console.log(`✓ SMS sent successfully! Message SID: ${message.sid}`);
    console.log(`OTP sent to mobile: ${formattedMobile}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending SMS OTP:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    
    // Fallback to console logging
    console.log(`\n[FALLBACK - MOCK SMS] OTP for ${mobile}: ${otp}\n`);
    return true; // Don't fail the request, just log the OTP
  }
};

const sendOTP = async (destination, otp, type = 'email') => {
  if (type === 'email') {
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('example.com')) {
      console.log(`[MOCK EMAIL] OTP for ${destination}: ${otp}`);
      return true;
    }
    return await sendEmailOTP(destination, otp);
  } else if (type === 'mobile' || type === 'sms') {
    if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.includes('your_twilio')) {
      console.log(`[MOCK SMS] OTP for ${destination}: ${otp}`);
      return true;
    }
    return await sendSmsOTP(destination, otp);
  }
};

module.exports = { generateOTP, sendOTP };
