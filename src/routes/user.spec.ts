/* eslint-disable indent */
import express from 'express';
import jwt from 'jsonwebtoken';
import { Transaction } from 'sequelize';
import request from 'supertest';

import { sequelize } from '../../sequelize'; // Adjust the import based on your structure
import { JWT_SECRET_KEY } from '../constants/consts';

import authRouter from './authRoutes';

jest.mock('nodemailer');

const app = express();

app.use(express.json());
app.use('/auth', authRouter);

afterAll(async () => {
  await sequelize.close();
});

describe('Auth Routes', () => {
  let transaction: Transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  const testEmail = `test+${Date.now()}@example.com`;

  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send({
      email: testEmail,
      password: 'password',
      fullName: 'Test User',
      userType: 'student'
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should validate a valid token', async () => {
    const token = jwt.sign({ id: 1, email: testEmail, fullName: 'Test User', userType: 'student' }, JWT_SECRET_KEY, {
      expiresIn: '24h'
    });

    const res = await request(app).get('/auth/validateToken').query({ token });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('should not validate an invalid token', async () => {
    const res = await request(app).get('/auth/validateToken').query({ token: 'invalidtoken' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });
});
