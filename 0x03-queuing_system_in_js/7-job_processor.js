import kue from 'kue';

const blacklistedPhoneNumbers = ['4153518780', '4153518781'];

/**
 * Sends a notification to the specified phone number with the given message.
 * If the phone number is blacklisted, the job is marked as failed and an error is thrown.
 *
 * @param {string} phoneNumber - The phone number to send the notification to.
 * @param {string} message - The message to include in the notification.
 * @param {Object} job - The job to track the progress of the notification sending.
 * @param {Function} done - The callback function to call once the notification has been sent or an error has occurred.
 * @return {undefined}
 */
function sendNotification(phoneNumber, message, job, done) {
    let progress = 0;

    if (blacklistedPhoneNumbers.includes(phoneNumber)) {
        job.failed();
        done(new Error(`Phone number ${phoneNumber} is blacklisted`));
    } else {
        const progressInterval = setInterval(() => {
            if (progress === 100) {
                clearInterval(progressInterval);
                done();
            } else {
                job.progress(progress, 100);
                console.log(
                    `Sending notification to ${phoneNumber}, with message: ${message}`
                );
                progress += 50;
            }
        }, 1000);
    }
}

const queue = kue.createQueue();

queue.process('push_notification_code_2', 2, (job, done) => {
    sendNotification(job.data.phoneNumber, job.data.message, job, done);
});
