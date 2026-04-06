const nodemailer = require('nodemailer');

// Create transporter if email config is provided
let transporter = null;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('Email transporter configured');
  }
} catch (error) {
  console.log('Email transporter not configured:', error.message);
}

const sendEmail = async (to, subject, text, html) => {
  if (!transporter) {
    console.log('Email not sent - transporter not configured');
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Savour Meals" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return null;
  }
};

const sendNotificationEmail = async (to, title, message, actionUrl = null) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">${title}</h2>
      <p>${message}</p>
      ${actionUrl ? `<a href="${actionUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Details</a>` : ''}
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">This is an automated message from Savour Meals</p>
    </div>
  `;

  return await sendEmail(to, title, message, html);
};

module.exports = {
  sendEmail,
  sendNotificationEmail
};

