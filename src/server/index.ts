import { createApp } from './app.js';
import { db } from './db/database.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Ensure database connection is initialized
const _ = db;

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Tech Quiz REST API Server running on port ${PORT}`);
  console.log(`  SQLite DB: ./data/app.db`);
  console.log(`  Media Uploads: ./data/uploads (served at /media/:filename)`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server and DB...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});
