const { config } = require('./protractor.conf'); // <- your Protractor config

exports.config = {
    ...config,
    async beforeLaunch() {
        if (config.beforeLaunch) {
            await config.beforeLaunch();
        }
        try {
            require('ts-node').register();
            const { generatePageObjects } = require(`./e2e/page-objects/hvstr/main.hvstr`); // <- require your methode to generate page-objects
            await generatePageObjects();
            process.exit(0);
        } catch (err) {
            console.error(err);
        }
    }
};
