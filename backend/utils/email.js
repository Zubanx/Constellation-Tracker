const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email confirmation to new users
 * @param {string} userEmail - User's email address
 * @param {string} firstName - User's first name
 * @param {string} confirmationToken - Email confirmation token
 */
exports.sendConfirmationEmail = async (
  userEmail,
  firstName,
  confirmationToken
) => {
  const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${confirmationToken}`;
  console.log('Confirmation URL:', confirmationUrl); // Debug log
  
  const msg = {
    to: userEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@cop-433121.com',
      name: 'Constellation Tracker'
    },
    templateId: process.env.SENDGRID_CONFIRMATION_TEMPLATE_ID || 'd-df61d49ae1b4456d80553d5fcf3b124c',
    dynamicTemplateData: {
      userName: firstName,
      confirmUrl: confirmationUrl,
    },
  };

  try {
    await sgMail.send(msg);
    console.log(`Confirmation email sent to: ${userEmail}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send confirmation email');
  }
};

/**
 * Send password reset email to users
 * @param {string} userEmail - User's email address
 * @param {string} firstName - User's first name
 * @param {string} resetToken - Password reset token
 */
exports.sendPasswordResetEmail = async (userEmail, firstName, resetToken) => {
  // Build reset URL using FRONTEND_URL from environment
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const msg = {
    to: userEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@cop-433121.com',
      name: 'Constellation Tracker'
    },
    templateId: process.env.SENDGRID_RESET_TEMPLATE_ID || 'd-e2b851589eeb443d83577ef0282b369a',
    dynamicTemplateData: {
      userName: firstName,
      resetUrl: resetUrl,
    },
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Password reset email sent to: ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email after successful email verification (optional)
 * @param {string} userEmail - User's email address
 * @param {string} firstName - User's first name
 */
exports.sendWelcomeEmail = async (userEmail, firstName) => {
  const msg = {
    to: userEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@cop-433121.com',
      name: 'Constellation Tracker'
    },
    subject: 'Welcome to Constellation Tracker! 🌟',
    text: `Hi ${firstName},\n\nWelcome to Constellation Tracker! Your email has been verified and you're all set to start tracking the stars.\n\nHappy stargazing!\n\nThe Constellation Tracker Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4158d0;">Welcome to Constellation Tracker! 🌟</h2>
        <p>Hi ${firstName},</p>
        <p>Welcome to Constellation Tracker! Your email has been verified and you're all set to start tracking the stars.</p>
        <p>Happy stargazing! ✨</p>
        <p><strong>The Constellation Tracker Team</strong></p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to: ${userEmail}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
};

// Export all functions
module.exports = {
  sendConfirmationEmail: exports.sendConfirmationEmail,
  sendPasswordResetEmail: exports.sendPasswordResetEmail,
  sendWelcomeEmail: exports.sendWelcomeEmail
};