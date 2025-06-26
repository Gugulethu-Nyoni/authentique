import express from 'express';
import bodyParser from 'body-parser';
import MySQLAdapter from './lib/adapters/databases/mysql-adapter.js';
import AuthService from './lib/core/auth-service.js';

const app = express();
app.use(bodyParser.json());

// Initialize with test DB config
const adapter = new MySQLAdapter();
const auth = new AuthService({
  dbAdapter: adapter,
  secret: 'test-secret-123'
});

// Signup Endpoint (Test Only)
app.post('/test/signup', async (req, res) => {
  try {
    const result = await auth.register(req.body);
    res.json({ success: true, userId: result.user.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Test server running on http://localhost:3000');
});