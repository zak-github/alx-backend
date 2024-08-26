import { createClient } from 'redis';

const CHANEL = 'holberton school channel';
const redisClient = createClient();

redisClient.on('error', (err) => {
    console.log(`Redis client not connected to the server: ${err}`);
});

redisClient.on('connect', () => {
    console.log('Redis client connected to the server');
    redisClient.subscribe(CHANEL);
});

redisClient.on('message', (channel, message) => {
    console.log(message);
    if (message === 'KILL_SERVER') {
        redisClient.unsubscribe();
        redisClient.quit();
    }
});
