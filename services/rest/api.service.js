"use strict";
const ApiGateway = require("moleculer-web");
module.exports = {
    name: "api",
    mixins: [ApiGateway],
    settings: {
        port: process.env.PORT || 15520,
        ip: "0.0.0.0",
        routes: [
            {
                path: "/",
                authentication: false,
                authorization: false,
                aliases: {
                    "POST routing": "routing.main.plan"
                },
                callingOptions: {
                    timeout: 10000,
                    retries: 3
                },
                bodyParsers: {
                    json: {
                        strict: false
                    },
                    urlencoded: {
                        extended: true,
                        limit: "1MB"
                    }
                },
                logging: true
            }
        ],
        logRequestParams: null,
        logResponseData: null,
        cors: {
            origin: "*"
        }
    }
}