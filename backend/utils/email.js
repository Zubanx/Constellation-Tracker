const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.confirmationEmail = async (
  userEmail,
  firstName,
  confirmationToken
) => {
  const msg = {
    to: userEmail,
    from: 'ja316466@ucf.edu',
    templateId: 'd-61ca99dbbc0f491da91f6a7ce5666c74',
    dynamicTemplateData: {
      name: firstName,
      confirmationToken: confirmationToken,
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

exports.passwordResetEmail = async (userEmail, firstName, resetUrl) => {
  const msg = {
    to: userEmail,
    from: 'ja316466@ucf.edu',
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
