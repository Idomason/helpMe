import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1.) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    // Activate in gmail "less secure app" option
  });

  // 2.) Define email options
  const mailOptions = {
    from: 'Idoma Ngbede <idomangbede@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3.) Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
