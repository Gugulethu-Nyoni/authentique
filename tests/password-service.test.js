import PasswordService from '../lib/core/password-service.js';
import assert from 'node:assert/strict';

const passwordService = new PasswordService();

async function runTests() {
  // Test hashing and comparison
  const plain = "SecurePass123!";
  const hash = await passwordService.hashPassword(plain);
  assert.equal(
    await passwordService.comparePassword(plain, hash),
    true,
    'Password comparison should succeed'
  );

  // Test invalid comparison
  assert.equal(
    await passwordService.comparePassword('wrong', hash),
    false,
    'Invalid password should fail'
  );

  // Test requirements
  assert.equal(
    passwordService.meetsRequirements("Weak"),
    false,
    'Weak password should fail'
  );
  
  assert.equal(
    passwordService.meetsRequirements("StrongPass123!"),
    true,
    'Strong password should pass'
  );

  console.log("All password service tests passed!");
}

runTests().catch(err => {
  console.error("Tests failed:", err);
  process.exit(1);
});