import https from 'https';

const req = https.request('https://ntfy.sh/malluchat_global_room_v3', { method: 'POST' }, (res) => {
  console.log('STATUS:', res.statusCode);
});
req.write('test3');
req.end();
