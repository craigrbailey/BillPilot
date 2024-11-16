import nodemailer from 'nodemailer';

const send = async (credentials, message) => {
  const transporter = nodemailer.createTransport({
    host: credentials.smtp_server,
    port: credentials.smtp_port,
    secure: credentials.smtp_port === 465,
    auth: {
      user: credentials.username,
      pass: credentials.password,
    },
  });

  await transporter.sendMail({
    from: credentials.username,
    to: credentials.username,
    subject: message.subject,
    text: message.body,
    html: message.html || message.body,
  });
};

export default { send }; 