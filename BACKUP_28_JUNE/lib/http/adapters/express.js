export function expressSignupRoute(authService) {
  return async (req, res) => {
    try {
      const result = await authService.signup(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}
