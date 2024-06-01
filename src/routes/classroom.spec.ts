import express from 'express';
import request from 'supertest';

import { sequelize } from '../../sequelize';

import classroomRouter from './classroomRoutes';

jest.mock('../middleware/validation', () => ({
  validateAdminToken: jest.fn((req, res, next) => next()),
  validateToken: jest.fn((req, res, next) => next())
}));

const app = express();

app.use(express.json());
app.use('/classrooms', classroomRouter);

let transaction: any;

beforeEach(async () => {
  transaction = await sequelize.transaction();
});

afterEach(async () => {
  await transaction.rollback();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Classroom Routes', () => {
  it('should not create a classroom with missing fields', async () => {
    const res = await request(app).post('/classrooms').send({ name: 'Math' }).set('transaction', transaction);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });

  it('should return 404 when removing a non-existing classroom', async () => {
    const res = await request(app).delete('/classrooms/999').set('transaction', transaction);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Classroom not found');
  });

  it('should return 404 when updating a non-existing classroom', async () => {
    const res = await request(app)
      .put('/classrooms/999')
      .send({ name: 'Science', capacity: 40 })
      .set('transaction', transaction);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Classroom not found');
  });
});
