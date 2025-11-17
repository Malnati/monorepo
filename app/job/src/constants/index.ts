// app/job/src/constants/index.ts

export const CSV_FILE_PATTERN = /^onboarding-\d{8}\.csv$/;
export const LOCK_FILE_SUFFIX = '.lock';
export const REPORT_FILE_SUFFIX = '.json';

export const DEFAULT_POLL_INTERVAL = 60000;
export const DEFAULT_BATCH_SIZE = 100;
export const DEFAULT_MAX_RETRIES = 3;

export const CSV_ENCODING = 'utf8';
export const CSV_BOM = '\uFEFF';

export const DATE_FORMAT = 'DD/MM/YYYY';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

export const CPF_LENGTH = 11;
export const PHONE_E164_PREFIX = '+55';

export const STATUS_SUBSCRIBED = 'subscribed';
export const STATUS_PF = 'PF';
export const STATUS_PJ = 'PJ';
