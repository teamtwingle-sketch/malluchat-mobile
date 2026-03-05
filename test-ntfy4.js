import https from 'https';
const req = https.request('https://ntfy.sh/malluchat_v100', { method: 'POST' }, (res) => {
  res.on('data', d => console.log(d.toString()));
});
req.write('test100');
req.end();
