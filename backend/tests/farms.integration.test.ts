import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { randomUUID } from 'node:crypto';

// Integration uses only an explicitly supplied test database. Never drop databases or collections.
const testUri = process.env.TEST_MONGODB_URI;
const integration = describe.skipIf(!testUri);
integration('Farm API with MongoDB and real authentication', () => {
  let app: ReturnType<typeof import('../src/app').createApp>;
  let ownerToken: string;
  let otherToken: string;
  let ownerId: string;
  let otherId: string;
  let farmId: string;
  const createdUserIds: string[] = [];
  const createdFarmIds: string[] = [];
  const createdResourceIds: string[] = [];
  const password = 'FarmTest!pass1234';
  const suffix = randomUUID();
  const ownerEmail = `owner-${suffix}@example.com`;
  const otherEmail = `other-${suffix}@example.com`;
  const input = { farmName: 'Verification Valley', location: 'Kandy', farmSizeHectares: 12.5, cropTypes: ['Rice', 'Tea'] };

  beforeAll(async () => {
    process.env.MONGODB_URI = testUri;
    process.env.JWT_SECRET = 'local-integration-test-secret-at-least-32-characters';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.FRONTEND_URL = 'http://localhost:5174';
    process.env.PORT = '3099';
    process.env.NODE_ENV = 'test';
    const { createApp } = await import('../src/app');
    app = createApp();
    await mongoose.connect(testUri!, { serverSelectionTimeoutMS: 5000 });
    for (const [name, email] of [['Owner Test', ownerEmail], ['Other Test', otherEmail]]) {
      const response = await request(app).post('/auth/register').send({ name, email, password, farmName: 'Default Farm' });
      expect(response.status).toBe(201);
      const user = await mongoose.connection.collection('users').findOne({ email });
      expect(user).toBeTruthy();
      createdUserIds.push(String(user!._id));
    }
    const owner = await request(app).post('/auth/login').send({ email: ownerEmail, password });
    expect(owner.status).toBe(200);
    ownerToken = owner.body.access_token;
    ownerId = owner.body.user.id;
    const other = await request(app).post('/auth/login').send({ email: otherEmail, password });
    otherToken = other.body.access_token;
    otherId = other.body.user.id;
  }, 20000);

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      for (const [collection, ids] of [['farms', createdFarmIds], ['resourceentries', createdResourceIds], ['users', createdUserIds]] as const) {
        if (ids.length) await mongoose.connection.collection(collection).deleteMany({ _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } });
      }
    }
    await mongoose.disconnect();
  });

  it('keeps health and authenticated profile endpoints working', async () => {
    expect((await request(app).get('/health')).status).toBe(200);
    const profile = await request(app).get('/users/me').auth(ownerToken, { type: 'bearer' });
    expect(profile.status).toBe(200);
    expect(profile.body.farmName).toBe('Default Farm');
    expect(profile.body).not.toHaveProperty('passwordHash');
  });
  it('rejects unauthenticated requests on every farm operation', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    for (const response of await Promise.all([
      request(app).get('/farms'), request(app).post('/farms').send(input),
      request(app).get(`/farms/${id}`), request(app).patch(`/farms/${id}`).send({ location: 'Matale' }), request(app).delete(`/farms/${id}`),
    ])) expect(response.status).toBe(401);
    expect((await request(app).get('/farms').auth('invalid', { type: 'bearer' })).status).toBe(401);
  });
  it('creates a farm owned by the authenticated user and reads persisted data', async () => {
    const response = await request(app).post('/farms').auth(ownerToken, { type: 'bearer' }).send(input);
    expect(response.status).toBe(201);
    farmId = response.body.id;
    createdFarmIds.push(farmId);
    expect(response.body).toMatchObject(input);
    expect(response.body).not.toHaveProperty('userId');
    const stored = await mongoose.connection.collection('farms').findOne({ _id: new mongoose.Types.ObjectId(farmId) });
    expect(String(stored!.userId)).toBe(ownerId);
    expect((await request(app).get(`/farms/${farmId}`).auth(ownerToken, { type: 'bearer' })).body).toMatchObject(input);
    const list = await request(app).get('/farms').auth(ownerToken, { type: 'bearer' });
    expect(list.body.map((farm: { id: string }) => farm.id)).toContain(farmId);
  });
  it('never lists or exposes another owner\'s farm and prevents editing or deleting it', async () => {
    const list = await request(app).get('/farms').auth(otherToken, { type: 'bearer' });
    expect(list.status).toBe(200);
    expect(list.body).toEqual([]);
    for (const response of await Promise.all([
      request(app).get(`/farms/${farmId}`).auth(otherToken, { type: 'bearer' }),
      request(app).patch(`/farms/${farmId}`).auth(otherToken, { type: 'bearer' }).send({ farmName: 'Stolen farm' }),
      request(app).delete(`/farms/${farmId}`).auth(otherToken, { type: 'bearer' }),
    ])) expect(response.status).toBe(404);
    const stored = await mongoose.connection.collection('farms').findOne({ _id: new mongoose.Types.ObjectId(farmId) });
    expect(stored!.farmName).toBe(input.farmName);
    expect(String(stored!.userId)).not.toBe(otherId);
  });
  it('rejects invalid input, mass assignment, malformed IDs and missing records', async () => {
    const bad = await request(app).post('/farms').auth(ownerToken, { type: 'bearer' }).send({ ...input, farmSizeHectares: -1 });
    expect(bad.status).toBe(400);
    expect(bad.body.errors[0].field).toBe('farmSizeHectares');
    expect((await request(app).post('/farms').auth(ownerToken, { type: 'bearer' }).send({ ...input, userId: otherId })).status).toBe(400);
    expect((await request(app).patch(`/farms/${farmId}`).auth(ownerToken, { type: 'bearer' }).send({})).status).toBe(400);
    expect((await request(app).get('/farms/invalid').auth(ownerToken, { type: 'bearer' })).status).toBe(400);
    expect((await request(app).get(`/farms/${new mongoose.Types.ObjectId()}`).auth(ownerToken, { type: 'bearer' })).status).toBe(404);
  });
  it('persists partial updates without clearing crops or modifying the default profile', async () => {
    const update = await request(app).patch(`/farms/${farmId}`).auth(ownerToken, { type: 'bearer' }).send({ farmName: 'Updated Valley', farmSizeHectares: 14 });
    expect(update.status).toBe(200);
    expect(update.body.cropTypes).toEqual(input.cropTypes);
    const fresh = await request(app).get(`/farms/${farmId}`).auth(ownerToken, { type: 'bearer' });
    expect(fresh.body.farmName).toBe('Updated Valley');
    const profile = await request(app).get('/users/me').auth(ownerToken, { type: 'bearer' });
    expect(profile.body.farmName).toBe('Default Farm');
  });
  it('preserves resource tracking and ownership while deleting a farm', async () => {
    const resource = await request(app).post('/resources').auth(ownerToken, { type: 'bearer' }).send({ resourceType: 'FUEL', quantity: 10, unit: 'L', date: '2026-10-01' });
    expect(resource.status).toBe(201);
    createdResourceIds.push(resource.body.id);
    expect((await request(app).get('/resources/summary').auth(ownerToken, { type: 'bearer' })).body.FUEL).toBe(10);
    expect((await request(app).delete(`/farms/${farmId}`).auth(ownerToken, { type: 'bearer' })).status).toBe(204);
    expect((await request(app).get(`/farms/${farmId}`).auth(ownerToken, { type: 'bearer' })).status).toBe(404);
    expect((await request(app).get('/resources').auth(ownerToken, { type: 'bearer' })).body).toHaveLength(1);
    expect((await request(app).get('/resources').auth(otherToken, { type: 'bearer' })).body).toEqual([]);
    expect((await request(app).get('/users/me').auth(ownerToken, { type: 'bearer' })).body.farmName).toBe('Default Farm');
  });
});
