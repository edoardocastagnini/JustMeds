const request = require('supertest');
const app = require('./index');

describe('Test API endpoints', () => {
  it('should return 200 OK when accessing the home page', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('should return 404 Not Found when accessing an invalid route', async () => {
    const response = await request(app).get('/invalid-route');
    expect(response.status).toBe(404);
  });

  it('should return 500 Internal Server Error when there is an error in sign_up route', async () => {
    const response = await request(app).post('/sign_up').send({});
    expect(response.status).toBe(500);
  });

  it('should return 401 Unauthorized when providing invalid credentials in login route', async () => {
    const response = await request(app).post('/login').send({ email: 'invalid@example.com', password: 'invalid' });
    expect(response.status).toBe(401);
  });
});