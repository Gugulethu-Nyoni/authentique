import jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3LCJlbWFpbCI6Imd1Z3Vubm5AZ21haWwuY29tIiwiaWF0IjoxNzUxMTM1MzgxLCJleHAiOjE3NTEyMjE3ODF9.PA-kvQSL5BI1PMSqnGmmwjjQtECBr6I1FksJeDZqyno';
const decoded = jwt.decode(token);
console.log('Decoded JWT:', decoded);
