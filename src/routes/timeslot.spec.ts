/* eslint-disable indent */
import express from 'express';
import request from 'supertest';

import { sequelize } from '../../sequelize';
import { TimeSlot } from '../models/timeslot.model';

import timeSlotRouter from './timeslotRoutes';

jest.mock('../middleware/validation', () => ({
  validateAdminToken: jest.fn((req, res, next) => next()),
  validateToken: jest.fn((req, res, next) => next())
}));

const app = express();

app.use(express.json());
app.use('/timeslots', timeSlotRouter);

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

describe('Time Slot Routes', () => {


  it('should return 500 if fetching time slots fails', async () => {
    jest.spyOn(TimeSlot, 'findAll').mockRejectedValue(new Error('Failed to fetch time slots'));

    const res = await request(app).get('/timeslots').set('transaction', transaction);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch time slots');
  });

  it('should return 500 if creating a time slot fails', async () => {
    jest.spyOn(TimeSlot, 'create').mockRejectedValue(new Error('Failed to create time slot'));

    const newSlot = { day: '2024-05-19', startTime: '10:00', endTime: '11:00' };
    const res = await request(app).post('/timeslots').send(newSlot).set('transaction', transaction);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to create time slot');
  });
});
