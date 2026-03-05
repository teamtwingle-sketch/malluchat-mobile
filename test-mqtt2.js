import mqtt from 'mqtt';
const client = mqtt.connect('wss://broker.hivemq.com:8000/mqtt');
client.on('connect', () => {
    console.log("MQTT connected!");
    client.end();
});
client.on('error', (err) => console.log("ERR", err));
