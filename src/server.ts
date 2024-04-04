import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mysql from 'mysql';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME } from './constants/consts';
import router from './routes/authRoutes';

const app = express();
const port = 6173;

// Middleware to parse JSON bodies
app.use(express.json());
dotenv.config();

// add cors fro http://127.0.0.1:5173/
// add cors fro http://localhost:5173/
// Define the allowed origins
const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173'];

// CORS options
const corsOptions = {
  origin: allowedOrigins
};

// Use CORS middleware with the specified options
app.use(cors(corsOptions));

// MySQL Connection Configuration
const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);

    return;
  }
  console.log('Connected to MySQL');
});

// Define routes
app.get('/', (req: Request, res: Response) => {
  connection.query('SELECT * FROM your_table', (err, results) => {
    if (err) {
      console.error('Error executing MySQL query: ', err);
      res.status(500).send('Internal Server Error');

      return;
    }
    res.json(results);
  });
});

// Use user routes
app.use('/api/user', router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// add a ping pong logic
app.get('/ping', (req: Request, res: Response) => {
  res.send('pong');
});
