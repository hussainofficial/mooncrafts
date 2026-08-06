// Dev-only email sender: logs the email instead of sending it.
// Swap the body of sendEmail() for Nodemailer/Resend once real credentials
// are available — callers (auth.service.js) don't need to change.

async function sendEmail({ to, subject, html }) {
  console.log('\n📧 [DEV EMAIL] ---------------------------------');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(html.replace(/<[^>]+>/g, ''));
  console.log('---------------------------------------------\n');
}

async function sendPasswordResetEmail(to, resetUrl) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #ec4899;">Reset your MOONCRAFT password</h2>
      <p>We received a request to reset your password. This link expires in 15 minutes.</p>
      <p><a href="${resetUrl}" style="background: #ec4899; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({ to, subject: 'Reset your MOONCRAFT password', html });
  console.log(`🔗 [DEV EMAIL] Reset link: ${resetUrl}`);
}

module.exports = { sendEmail, sendPasswordResetEmail };
