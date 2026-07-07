const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../src/server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('AssetTrack API', () => {
  let token;

  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'IT_ADMIN',
        department: 'IT'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('admin@example.com');
    token = res.body.token;
  });

  it('logs in an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('creates an asset with auth', async () => {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        assetTag: 'ASSET-001',
        name: 'Dell Latitude 7440',
        type: 'LAPTOP',
        category: 'Laptop',
        department: 'Engineering'
      });

    expect(res.status).toBe(201);
    expect(res.body.assetTag).toBe('ASSET-001');
  });

  it('lists assets for the registry view', async () => {
    const res = await request(app)
      .get('/api/assets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('updates an asset status with a partial payload', async () => {
    const createRes = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        assetTag: 'ASSET-002',
        name: 'HP EliteBook',
        type: 'LAPTOP',
        category: 'Laptop',
        department: 'Operations'
      });

    const res = await request(app)
      .put(`/api/assets/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ASSIGNED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ASSIGNED');
  });

  it('creates a maintenance ticket', async () => {
    const assetRes = await request(app)
      .get('/api/assets')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Screen replacement',
        description: 'Screen flickering',
        asset: assetRes.body[0]._id,
        priority: 'HIGH'
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Screen replacement');
  });

  it('creates a software license', async () => {
    const res = await request(app)
      .post('/api/licenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Microsoft 365 E5',
        vendor: 'Microsoft',
        seats: 10,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Microsoft 365 E5');
  });

  it('lists software licenses for the inventory view', async () => {
    const res = await request(app)
      .get('/api/licenses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns dashboard statistics for an authenticated user', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalAssets).toBeGreaterThanOrEqual(1);
  });
});
