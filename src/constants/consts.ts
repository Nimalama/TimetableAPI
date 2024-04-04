import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ?? '';

export const DB_HOST = process.env.DB_HOST ?? '';
export const DB_USERNAME = process.env.DB_USERNAME ?? '';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? '';
export const DB_NAME = process.env.DB_NAME ?? '';
