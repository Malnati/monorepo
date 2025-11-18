// app/job/src/config/configuration.ts

export default () => ({
  job: {
    inbox: process.env.APP_JOB_INBOX || "/var/data/inbox",
    processed: process.env.APP_JOB_PROCESSED || "/var/data/processed",
    failed: process.env.APP_JOB_FAILED || "/var/data/failed",
    pollInterval: parseInt(process.env.APP_JOB_POLL_INTERVAL || "60000", 10),
    batchSize: parseInt(process.env.APP_JOB_BATCH_SIZE || "100", 10),
    maxRetries: parseInt(process.env.APP_JOB_MAX_RETRIES || "3", 10),
  },
  api: {
    baseUrl: process.env.APP_API_BASE_URL || "http://api:3001",
    token: process.env.APP_API_TOKEN || "",
  },
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
  nodeEnv: process.env.NODE_ENV || "development",
});
