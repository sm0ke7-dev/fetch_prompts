import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config({ path: '.local.env' });

const PORT = process.env.PORT || 3000;

/**
 * Start the Express server
 */
app.listen(PORT, () => {
  console.log(`🚀 Fetch Prompts API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/v1/text`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
