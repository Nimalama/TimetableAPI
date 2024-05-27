/* eslint-disable indent */
import dotenv from 'dotenv';

dotenv.config();

export const GOOGLE_CLIENT_ID = '682374523124-chs6fq2ctt29ngk5omi23qqv62qm3bg2.apps.googleusercontent.com'; // Replace with your Google client ID

export const GOOGLE_CLIENT_SECRET = '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';

export const REFRESH_TOKEN =
  '1//047Zwnq2aoyzQCgYIARAAGAQSNwF-L9IrCe_rc2HhDkdF3eN6QNNZHPfapwZd32OqVqy-eVofQjfHhgl1kNzMKtmhrhkg_0IlSng';

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
