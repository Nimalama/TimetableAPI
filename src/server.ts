import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mysql from 'mysql';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME } from './constants/consts';
import authRouter from './routes/authRoutes';
import classRouter from './routes/classroomRoutes';
import routineRoutes from './routes/classroutineRoutes';
import courseRouter from './routes/courseRoutes';
import timeSlotRoutes from './routes/timeslotRoutes';

const app = express();
const port = 6173;

// Middleware to parse JSON bodies
app.use(express.json());
dotenv.config();

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

app.use('/src/uploads', express.static(path.join(__dirname, 'uploads')));

// Use user routes
app.use('/api/user', authRouter);

// Use classroom routes
app.use('/api/classroom', classRouter);

// Use course routes
app.use('/api/course', courseRouter);

app.use('/api/timeslots', timeSlotRoutes);

app.use('/api/classroutine', routineRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// add a ping pong logic
app.get('/ping', (req: Request, res: Response) => {
  res.send('pong');
});
