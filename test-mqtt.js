import mqtt from 'mqtt';
const client = mqtt.connect('wss://test.mosquitto.org:8081');
client.on('connect', () => {
    console.log("MQTT connected!");
    client.end();
});
client.on('error', (err) => console.log(err));
