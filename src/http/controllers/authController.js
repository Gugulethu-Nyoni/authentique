import { signupUser } from '../../services/auth/service.js';

export const signupHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const { verification_token } = await signupUser({ name, email, password });

    // Next step: send verification email here in Deliverable 5
    return res.status(200).json({ message: 'Account created. Please check your email to verify.', token: verification_token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Signup failed.' });
  }
};
