import WebSocket from 'ws';
const ws = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');
ws.on('open', () => console.log('OPEN'));
ws.on('error', e => console.log('ERR', e.message));
