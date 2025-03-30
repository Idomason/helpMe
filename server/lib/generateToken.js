import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 60 * 1000, // 15 days in milliseconds
    httpOnly: true, // prevent XSS attacks, cross-site scripting attacks
    sameSite: 'strict', // CSRF attacks, cross-site request forgery attacks
    secure: process.env.NODE_ENV !== 'development',
  });
};
