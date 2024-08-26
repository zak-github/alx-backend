import { expect } from 'chai';
import kue from 'kue';

import createPushNotificationsJobs from './8-job.js';

const queue = kue.createQueue();

const list = [
    {
        phoneNumber: '4153518780',
        message: 'This is the code 1234 to verify your account',
    },
];
createPushNotificationsJobs(list, queue);

describe('createPushNotificationsJobs', () => {
    let queue;

    beforeEach(() => {
        queue = kue.createQueue();
        queue.testMode.enter();
    });

    afterEach(() => {
        queue.testMode.clear();
        queue.testMode.exit();
    });

    it('should display an error message if jobs is not an array', () => {
        expect(() => {
            createPushNotificationsJobs(null, queue);
        }).to.throw('Jobs is not an array');
    });

    it('should create a job', () => {
        const jobs = [
            {
                phoneNumber: '+1234567890',
                message: 'This is the code 1234 to verify your account',
            },
        ];

        createPushNotificationsJobs(jobs, queue);

        setTimeout(() => {
            expect(queue.testMode.jobs.length).to.equal(1);
            expect(queue.testMode.jobs[0].type).to.equal(
                'push_notification_code_3'
            );
            expect(queue.testMode.jobs[0].data).to.equal(jobs[0]);
            expect(queue.testMode.jobs[0].state).to.equal('complete');
        }, 1000);
    });
});
