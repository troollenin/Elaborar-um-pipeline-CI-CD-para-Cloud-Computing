import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

test('GET / should return CI/CD message', async (t) => {
  // spin up server dynamically
  const { default: app } = await import('../src/index.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const body = await new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path: '/' }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

  assert.equal(body, 'CI/CD up and running!');
  server.close();
});
