import EventSource from 'eventsource';
const source = new EventSource('https://smee.io/kGuyKEZnqAyhqovx');
source.onmessage = msg => {
  console.log('MSG:', msg.data);
};
source.onerror = err => console.log('ERR', err);
console.log('started');
