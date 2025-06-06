import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '6d',
  });
};

export const setJwtCookie = (h, token) => {
  return h.state('jwt', token, {
    ttl: 6 * 24 * 60 * 60 * 1000,
    isSecure: process.env.NODE_ENV === 'production',
    isHttpOnly: true,
    encoding: 'none',
    isSameSite: 'Lax',
    path: '/',
  });
};
