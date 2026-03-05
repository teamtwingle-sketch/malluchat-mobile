import WebSocket from 'ws';
const ws = new WebSocket('wss://free.blr2.piesocket.com/v3/1?api_key=VCXCEuvhGcBDP7XhiJJILwybgY9EnnXglRfcxTzY&notify_self=1');
ws.on('open', () => console.log('OPEN'));
ws.on('error', e => console.log('ERR', e.message));
