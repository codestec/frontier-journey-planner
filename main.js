"use strict";
const { ServiceBroker } = require("moleculer");
const { Middlewares } = require("moleculer");
const djpMiddleware = require("./djp.middleware");
const winston = require('winston');
Middlewares.djpMiddleware = djpMiddleware;
const broker = new ServiceBroker({
    namespace: "wolf-pack",
    nodeID: "journey-planner",
    middlewares: ["djpMiddleware"],
    logger: [
        {
            type: "Console",
            options: {
                level: "info",
                colors: true,
                moduleColors: false,
                formatter: "full",
                objectPrinter: null,
                autoPadding: false
            }
        },
        {
            type: "Winston",
            options: {
                level: "info",
                winston: {
                    transports: [
                        new winston.transports.File({
                            filename: "./logs/moleculer.log",
                            format: winston.format.combine(
                                winston.format.timestamp({
                                    format: 'YYYY-MM-DD hh:mm:ss A ZZ'
                                }),
                                winston.format.json()
                            )
                        })
                    ]
                }
            }
        }
    ],
    serializer: "JSON",
    requestTimeout: 20 * 1000
});
broker.loadServices("./services/", "**/*.service.js");
broker.start();