"use strict";
const config = require('config');
const _ = require('underscore');
let startedServices = [];
module.exports = {
    name: "djpMiddleware",
    async serviceStarted(service) {
        const self = this;
        startedServices.push(service.name);
        _.each(startedServices, function(service) {
            self.logger.info(service);
        });
    },
    async stopping(broker) {
        await broker.cacher.clean();
    },
    started(broker) {
    }
}