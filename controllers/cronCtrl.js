
const { cronError } = require('../helpers/utils');
var cron = require('node-cron');
const recurringCtrl = require('./recurringCtrl');

cron.schedule('00 01 * * *', async () => {
    try {
        await recurringCtrl.recurringPlanCronJob();
        return true;
    } catch (error) {
        cronError(error);
    }
}, {
    scheduled: true,
});

