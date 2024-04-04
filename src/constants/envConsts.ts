export const ENV_CONSTANTS = {
  DB_USERNAME: process.env.DB_USERNAME ?? 'root',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'root',
  DB_NAME: process.env.DB_NAME ?? 'timetable',
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? ''
};
