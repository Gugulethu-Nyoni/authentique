// controllers/auth.js
import AuthService from '../services/auth-service.js';

export async function signupHandler({ body }) {
  const { email, password, name } = body;
  
  if (!email || !password || !name) {
    throw { 
      status: 400, 
      message: 'Email, password and name are required' 
    };
  }

  const user = await AuthService.signup(email, password, name);
  return { 
    status: 201,
    message: 'User created successfully',
    data: { userId: user.id }
  };
}

export async function loginHandler({ body }) {
  const { email, password } = body;
  
  if (!email || !password) {
    throw { 
      status: 400, 
      message: 'Email and password are required' 
    };
  }

  const { user, token } = await AuthService.login(email, password);
  return {
    status: 200,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }
  };
}

export async function confirmHandler({ body }) {
  const { token } = body;

  if (!token) {
    throw {
      status: 400,
      message: 'Token is required'
    };
  }

  const { email } = await AuthService.confirmEmail(token);
  return {
    status: 200,
    message: 'Email verified successfully',
    data: { email }
  };
}
