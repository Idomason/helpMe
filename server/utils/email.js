let _resend = null;

const getResend = async () => {
  if (!_resend) {
    const { Resend } = await import('resend');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

const sendEmail = async (options) => {
  const resend = await getResend();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'HelpMe <noreply@helpme.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  });
};

export default sendEmail;
