import express, { Request, Response } from 'express';
import mysql from 'mysql';

import router from './routes/authRoutes';

const app = express();
const port = 6173;

// Middleware to parse JSON bodies
app.use(express.json());

// MySQL Connection Configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'timetable'
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
