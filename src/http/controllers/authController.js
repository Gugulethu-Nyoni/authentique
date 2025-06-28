import { signupUser } from '../../services/auth/service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const signupHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, 'All fields are required.', 400);
    }

    const { verification_token } = await signupUser({ name, email, password });

    // Next step: send verification email here in Deliverable 5

    return successResponse(
      res,
      'Account created. Please check your email to verify.',
      { token: verification_token },
      200
    );

  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message || 'Signup failed.', 500);
  }
};
