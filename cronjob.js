const cron = require('node-cron');
const {startBot} = require("./webCrawler");

async function startSchedule(token) {
    cron.schedule('* * * * *', async () => {
        await startBot(token)
    });
}

module.exports = {
    startSchedule
}