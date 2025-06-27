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
    headers: {
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`
    },
    redirect: '/dashboard',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  };
}


export async function confirmHandler({ body }) {
  const token = body.token;

  if (!token) {
    throw {
      status: 400,
      message: 'Token is required'
    };
  }

  const result = await AuthService.confirmEmail(token);
  console.log('Result from confirmEmail:', result);

  if (!result || typeof result !== 'object' || typeof result.status !== 'number') {
    throw {
      status: 500,
      message: 'Invalid response from confirmation service'
    };
  }

  return result;
}


// Add these to your existing auth controller

export async function dashboardHandler({ user }) {
  // user comes from the authenticated request
  return {
    status: 200,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      stats: {
        // Add dashboard statistics here
        logins: 12,
        lastLogin: new Date().toISOString()
      }
    }
  };
}

export async function accountHandler({ body, user }) {
  if (body.update) {
    // Handle account updates
    return {
      status: 200,
      message: 'Account updated successfully',
      data: {
        updatedFields: body.update
      }
    };
  }
  
  // Return account info
  return {
    status: 200,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        joined: user.createdAt
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: user.updatedAt
      }
    }
  };
}
