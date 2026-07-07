const http = require('http');

const data = JSON.stringify({
  email: 'agent@test.com',
  password: 'agentpassword'
});

const options = {
  hostname: 'localhost',
  port: 5283,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Login Response:', res.statusCode, body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
