const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const http = require('node:http');
const mongoose = require('mongoose');
const createApp = require('./app');
const connectDatabase = require('./config/database');
const { startTelegramReportScheduler } = require('./services/telegramReportService');

async function startServer() {
 await connectDatabase();

 const port = Number(process.env.PORT) || 5001;
 const server = http.createServer(createApp());

 await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, () => {
   server.removeListener('error', reject);
   resolve();
  });
 });

 const reportScheduler = startTelegramReportScheduler();
 console.log(`Yemxona API listening on port ${port}`);

 let isShuttingDown = false;
 const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received; shutting down.`);
  reportScheduler.stop();

  server.close(async (error) => {
   try {
    await mongoose.disconnect();
   } catch (disconnectError) {
    console.error(disconnectError);
    process.exitCode = 1;
   }

   if (error) {
    console.error(error);
    process.exitCode = 1;
   }
  });
 };

 process.once('SIGINT', () => shutdown('SIGINT'));
 process.once('SIGTERM', () => shutdown('SIGTERM'));

 return server;
}

if (require.main === module) {
 startServer().catch((error) => {
  console.error('Failed to start Yemxona API:', error.message);
  process.exitCode = 1;
 });
}

module.exports = startServer;
