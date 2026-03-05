import WebSocket from 'ws';
const ws = new WebSocket('wss://relay.damus.io');
ws.on('open', () => {
   console.log('OPEN');
   ws.send(JSON.stringify(["REQ", "1", { "kinds": [1], "limit": 1 }]));
});
ws.on('message', m => console.log('RCV', m.toString().substring(0, 100)));
