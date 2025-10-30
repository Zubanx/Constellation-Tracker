const nodemailer = require('nodemailer');
const pug = require('pug');


module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.spit(' ')[0];
    this.url = url;
    this.from = `Constellation Tracker <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }
    return (transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    }));
  }

  send(template, subject) {

  }
  sendWelcome() {
    this.send('welcome', 'Welcome to the Constellation Tracker!');
  }
};
const sendEmail = async (options) => {
  const mailOptions = {
    from: 'Constellation Tracker <cjavier0315@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
