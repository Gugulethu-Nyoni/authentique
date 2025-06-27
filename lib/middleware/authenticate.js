import jwt from 'jsonwebtoken';
import { config }  from '../../config.js'; // Adjust if your config is elsewhere

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(value);
  });

  return cookies;
}

export async function authenticateRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.token;

  if (!token) {
    throw { status: 401, message: 'Unauthorized: No token found in cookies' };
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (err) {
    throw { status: 403, message: 'Invalid or expired token' };
  }
}
