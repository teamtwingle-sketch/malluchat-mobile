const https = require('https');
const req = https.request('https://ntfy.sh/malluchat_test_room', { method: 'POST' }, (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', d => console.log(d.toString()));
});
req.write('test');
req.end();
