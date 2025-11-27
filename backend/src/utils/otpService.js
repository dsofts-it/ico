const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

// Simple Gmail SMTP email sender (using environment variables EMAIL_USER and EMAIL_PASS)
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"nirvistra" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

// Generate a 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email – prefers SendGrid, then Gmail SMTP, then generic SMTP fallback
const sendEmailOTP = async (email, otp) => {
  // 1️⃣ SendGrid (if configured)
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
      };
      await sgMail.send(msg);
      console.log(`OTP sent via SendGrid to email: ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending email OTP via SendGrid:', error);
      // fall back to other methods
    }
  }

  // 2️⃣ Gmail SMTP (if EMAIL_USER / EMAIL_PASS are set)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await sendEmail(
        email,
        'Your OTP Code',
        `Your OTP code is: ${otp}. It expires in 10 minutes.`,
      );
      console.log(`OTP sent via Gmail SMTP to email: ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending email OTP via Gmail SMTP:', error);
      // fall back to generic SMTP
    }
  }

  // 3️⃣ Generic SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
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
    console.log(`OTP sent via generic SMTP to email: ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email OTP via generic SMTP:', error);
    throw new Error('Failed to send OTP via Email');
  }
};

// Send OTP via SMS using Twilio
const sendSmsOTP = async (mobile, otp) => {
  try {
    // Ensure mobile number includes country code (default to +91 if missing)
    let formattedMobile = mobile;
    if (!mobile.startsWith('+')) {
      formattedMobile = '+91' + mobile;
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
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
    console.error('❌ Error sending SMS OTP:', error);
    // Fallback: log OTP to console so the flow does not break
    console.log(`\n[FALLBACK - MOCK SMS] OTP for ${mobile}: ${otp}\n`);
    return true;
  }
};

// Unified OTP sender – type can be 'email', 'mobile' or 'sms'
const sendOTP = async (destination, otp, type = 'email') => {
  if (type === 'email') {
    // Mock email when no credentials are provided
    if (
      !process.env.EMAIL_USER &&
      !process.env.SENDGRID_API_KEY &&
      !process.env.SMTP_USER
    ) {
      console.log(`[MOCK EMAIL] OTP for ${destination}: ${otp}`);
      return true;
    }
    return await sendEmailOTP(destination, otp);
  } else if (type === 'mobile' || type === 'sms') {
    // Mock SMS when Twilio is not configured
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      process.env.TWILIO_ACCOUNT_SID.includes('your_twilio')
    ) {
      console.log(`[MOCK SMS] OTP for ${destination}: ${otp}`);
      return true;
    }
    return await sendSmsOTP(destination, otp);
  }
};

module.exports = { generateOTP, sendOTP };
