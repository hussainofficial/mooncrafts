require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Health Check: GET http://localhost:${PORT}/api/health`);
  console.log(`   - Register: POST http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`   - Login: POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`   - Refresh Token: POST http://localhost:${PORT}/api/v1/auth/refresh`);
  console.log(`   - Get Profile: GET http://localhost:${PORT}/api/v1/auth/me`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
