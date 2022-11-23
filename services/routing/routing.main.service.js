"use strict";
const _ = require('underscore');
module.exports = {
    name: "routing.main",
    settings: {
    },
    actions: {
        plan: {
            async handler(ctx) {
                try {
                    const JSONrequest = ctx.params;
                    const aggregatedPromises = [
                        // ctx.call("google.harmonise", { request: JSONrequest })
                        // ctx.call("here.harmonise", { request: JSONrequest })
                        ctx.call("bing.harmonise", { request: JSONrequest })
                    ];
                    const unimodalRoutes = _.compact(_.flatten(await Promise.all(aggregatedPromises)));
                    return (unimodalRoutes);
                } catch (err) {
                    this.logger.error(`[routing.main.plan]:${err.message}`);
                    ctx.meta.$statusCode = 500;
                    ctx.meta.$statusMessage = err.message;
                }
            }
        }
    }
}