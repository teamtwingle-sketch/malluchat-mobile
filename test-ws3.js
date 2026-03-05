import WebSocket from 'ws';
const ws = new WebSocket('wss://free.blr2.piesocket.com/v3/1?api_key=VCXCEuvhGcBDP7XhiJJILwybgY9EnnXglRfcxTzY&notify_self=1');
ws.on('open', () => {
    console.log('OPEN');
    ws.send(JSON.stringify({text: "hello world"}));
});
ws.on('message', m => console.log('RCV', m.toString()));
ws.on('error', e => console.log('ERR', e.message));
setTimeout(() => process.exit(0), 2000);
