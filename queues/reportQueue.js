const { Queue, Worker } = require('bullmq');
const { processReportGeneration } = require('../services/reportProcessor');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT) || 6379;

const connection = {
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null
};

let reportQueue = null;
let reportWorker = null;
let redisAvailable = false;

try {
  reportQueue = new Queue('report-generation', { connection });

  reportWorker = new Worker('report-generation', async (job) => {
    console.log(`[BullMQ Worker] Processing report job ID: ${job.id}, report ID: ${job.data.reportId}`);
    return await processReportGeneration(job.data);
  }, { connection });

  reportQueue.on('error', (err) => {
    if (!redisAvailable) return;
    console.warn('[BullMQ] Redis Queue Error:', err.message);
    redisAvailable = false;
  });

  reportWorker.on('completed', (job) => {
    console.log(`[BullMQ Worker] Report job ${job.id} completed successfully`);
  });

  reportWorker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Report job ${job ? job.id : 'unknown'} failed:`, err.message);
  });

  redisAvailable = true;
} catch (err) {
  console.warn('[BullMQ] Initializing BullMQ Queue failed. Will use fallback async processing.', err.message);
  redisAvailable = false;
}

const addReportJob = async (jobData) => {
  if (redisAvailable && reportQueue) {
    try {
      await reportQueue.add('generate-report', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true
      });
      console.log(`[BullMQ] Enqueued report generation job for report ID: ${jobData.reportId}`);
      return true;
    } catch (err) {
      console.warn('[BullMQ] Failed to enqueue to Redis. Executing direct fallback generation.', err.message);
      redisAvailable = false;
    }
  }

  // Fallback: Run asynchronously in background without blocking API
  setImmediate(async () => {
    try {
      console.log(`[Fallback Worker] Processing report ID: ${jobData.reportId}`);
      await processReportGeneration(jobData);
    } catch (fallbackError) {
      console.error(`[Fallback Worker] Error processing report ID ${jobData.reportId}:`, fallbackError.message);
    }
  });

  return false;
};

module.exports = {
  reportQueue,
  reportWorker,
  addReportJob
};
