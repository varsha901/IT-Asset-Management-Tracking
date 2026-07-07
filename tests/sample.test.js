describe('AssetTrack scaffold', () => {
  it('loads the health endpoint', async () => {
    const { app } = require('../src/server');
    const request = require('supertest');
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('AssetTrack');
  });
});
