import jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imd1Z3Vubm5AZ21haWwuY29tIiwicHVycG9zZSI6ImNvbmZpcm1hdGlvbiIsImlhdCI6MTc1MDk5MzgwMSwiZXhwIjoxNzUxMDgwMjAxfQ.Z6ADmSQWzAPAHUFl6thTmkekMqsb7c8IuSSTbw_7W-g';
const secret = 'KtrDWbW96NhNRyfyM72hQ1SGDV+IxULuevzTPSJPn7ajEKYWBAV4087shzhaNO/BoW0ByCkGANwpijAPtxXlnA=='; // Replace with your actual secret

try {
  const decoded = jwt.verify(token, secret);
  console.log('Token valid! Decoded payload:', decoded);
} catch (err) {
  console.error('Token verification failed:', err);
}