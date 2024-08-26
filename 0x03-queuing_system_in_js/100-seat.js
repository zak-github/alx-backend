import express from 'express';
import Kue from 'kue';

import { createClient } from 'redis';
import { promisify } from 'util';

const redisClient = createClient();
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

const queue = Kue.createQueue();

let reservationEnabled = true;

/**
 * Reserves a seat by updating the number of available seats.
 *
 * @param {number} number - the new number of available seats
 * @return {Promise<void>} a promise that resolves when the update is complete
 */
async function reserveSeat(number) {
    await setAsync(`available_seats`, number);
}

/**
 * Asynchronously retrieves the current available seats.
 *
 * @return {Promise} A Promise resolving to the available seats.
 */
async function getCurrentAvailableSeats() {
    return await getAsync(`available_seats`);
}

const app = express();

app.get('/available_seats', async (req, res) => {
    await res.send({
        numberOfAvailableSeats: await getCurrentAvailableSeats(),
    });
});

app.get('/reserve_seat', async (req, res) => {
    if (!reservationEnabled)
        return res.status(403).send({ status: 'Reservation are blocked' });

    const job = queue.createJob('reserve_seat', {});

    job.on('complete', () => {
        console.log(`Seat reservation job ${job.id} completed`);
    });

    job.on('failed', (error) => {
        console.log(`Seat reservation job ${job.id} failed: ${error}`);
    });

    job.save((err) => {
        if (err) res.send({ status: 'Reservation failed' });
        return res.send({ status: 'Reservation in process' });
    });
});

app.get('/process', async (req, res) => {
    queue.process('reserve_seat', async (job, done) => {
        const availableSeats = await getCurrentAvailableSeats();
        if (availableSeats == 0) {
            reservationEnabled = false;
            job.failed();
            done(new Error('Not enough seats available'));
        } else {
            await reserveSeat(availableSeats - 1);
            done();
        }
    });
    res.send({ status: 'Queue processing' });
});

app.listen(1245, async () => {
    await reserveSeat(5);
});
