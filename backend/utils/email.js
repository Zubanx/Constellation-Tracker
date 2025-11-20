const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.confirmationEmail = async (
  userEmail,
  firstName,
  confirmationToken
) => {
  const confirmationUrl = `${process.env.APP_URL}/user/confirmEmail/${confirmationToken}`;
  const msg = {
    to: userEmail,
    from: {
      email: 'noreply@cop-433121.com',
      name: 'Constellation Tracker'
    },
    templateId: 'd-61ca99dbbc0f491da91f6a7ce5666c74',
    dynamicTemplateData: {
      name: firstName,
      confirmationUrl: confirmationUrl,
    },
  };
  try {
    await sgMail.send(msg);
    console.log('Confirmation Email Sent');
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.passwordResetEmail = async (userEmail, firstName, resetToken) => {
  // Build reset URL using APP_URL, since req is not available in this helper.
  const base = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${base}/user/resetPassword/${resetToken}`;

  const msg = {
    to: userEmail,
    from: {
      email: 'noreply@cop-433121.com',
      name: 'Constellation Tracker'
    },
    templateId: 'd-ed1bad55f642474ea8503179e4a15472',
    dynamicTemplateData: {
      name: firstName,
      resetUrl: resetUrl,
    },
  };
  try {
    await sgMail.send(msg);
    console.log('Confirmation Email Sent');
  } catch (error) {
    console.error(error);
    throw error;
  }
};
