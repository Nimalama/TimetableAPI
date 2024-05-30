/* eslint-disable indent */
import dotenv from 'dotenv';

dotenv.config();

export const GOOGLE_CLIENT_ID = '682374523124-chs6fq2ctt29ngk5omi23qqv62qm3bg2.apps.googleusercontent.com'; // Replace with your Google client ID

export const GOOGLE_CLIENT_SECRET = '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';

export const REFRESH_TOKEN =
  '1//0428fJ6OnGm_OCgYIARAAGAQSNwF-L9IrlG4S-2fCdhiete1xVWPUWPpTt4W_Ju0GYRVzMjcAPDad74aN9QmhAKeWS_FUi80nXwc';

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ?? '';

export const DB_HOST = process.env.DB_HOST ?? '';
export const DB_USERNAME = process.env.DB_USERNAME ?? '';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? '';
export const DB_NAME = process.env.DB_NAME ?? '';

export const COURSE_STATUS = {
  UNENROLLED: 'unenrolled',
  ENROLLED: 'enrolled',
  COMPLETED: 'completed'
};
