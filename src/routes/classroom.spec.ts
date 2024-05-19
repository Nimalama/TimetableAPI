/* eslint-disable indent */
import express from 'express';
import request from 'supertest';

import { sequelize } from '../../sequelize';
import { Classroom } from '../models/classroom.model';

import classroomRouter from './classroomRoutes';

jest.mock('../../src/middleware/validation', () => ({
    // eslint-disable-next-line indent
    validateAdminToken: jest.fn((req, res, next) => next()),
    validateToken: jest.fn((req, res, next) => next())
}));

const app = express();

app.use(express.json());
app.use('/classrooms', classroomRouter);

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Classroom Routes', () => {
    beforeEach(async () => {
        await Classroom.destroy({ where: { name: 'Math' } });
    });

    it('should create a new classroom', async () => {
        const res = await request(app)
            .post('/classrooms')
            .send({ name: 'Math', capacity: 30 });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.name).toBe('Math');
        expect(res.body.data.capacity).toBe(30);
    });

    it('should not create a classroom with missing fields', async () => {
        const res = await request(app)
            .post('/classrooms')
            .send({ name: 'Math' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing required fields');
    });

    it('should fetch all classrooms', async () => {
        await Classroom.create({ name: 'Math', capacity: 30 });
        const res = await request(app).get('/classrooms');

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe('Math');
    });

    it('should remove a classroom', async () => {
        const classroom = await Classroom.create({ name: 'Math', capacity: 30 });
        const res = await request(app).delete(`/classrooms/${classroom.id as number}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toBe(true);
    });

    it('should return 404 when removing a non-existing classroom', async () => {
        const res = await request(app).delete('/classrooms/999');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Classroom not found');
    });

    it('should update a classroom', async () => {
        const classroom = await Classroom.create({ name: 'Math', capacity: 30 });
        const res = await request(app)
            .put(`/classrooms/${classroom.id as number}`)
            .send({ name: 'Science', capacity: 40 });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Science');
        expect(res.body.data.capacity).toBe(40);
    });

    it('should return 404 when updating a non-existing classroom', async () => {
        const res = await request(app)
            .put('/classrooms/999')
            .send({ name: 'Science', capacity: 40 });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Classroom not found');
    });
});
