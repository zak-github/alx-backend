function createPushNotificationsJobs(jobs, queue) {
    if (!Array.isArray(jobs)) throw Error('Jobs is not an array');

    jobs.forEach((jobData) => {
        const job = queue.createJob('push_notification_code_3', jobData);

        job.on('enqueue', () => {
            console.log(`Notification job created: #${job.id}`);
        });

        job.on('complete', () => {
            console.log(`Notification job #${job.id} completed`);
        });

        job.on('failed', (error) => {
            console.log(`Notification job #${job.id} failed: ${error}`);
        });

        job.on('progress', (progress, _data) => {
            console.log(`Notification job #${job.id} ${progress}% complete`);
        });

        job.save();
    });
}

export default createPushNotificationsJobs;
