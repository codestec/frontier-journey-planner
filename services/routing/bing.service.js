"use strict";
const _ = require('underscore');
const config = require('config');
const moment = require('moment');
const rp = require('request-promise');
const BingRoute = require('../../models/routes/BingRoute');
module.exports = {
    name: "bing",
    settings: {
        host: config.get("routing_apis.bing.host"),
        app_id: config.get("routing_apis.bing.app_id")
    },
    actions: {
        plan: {
            async handler(ctx) {
                try {
                    const routingRequest = ctx.params.request;
                    const getRequest = {
                        uri: `${this.settings.host}/${this.getRoutingMode(ctx.params.request.mode[0])}`,
                        json: true
                    };
                    const request_qs = {
                        key: this.settings.app_id,
                        ra: 'routePath'
                    };
                    // Traffic based time if mode is car
                    if (ctx.params.request.mode[0] === "CAR")
                        request_qs['optmz'] = 'timeWithTraffic';
                    let i;
                    i = 0;
                    request_qs['wp.' + i.toString()] = routingRequest.origin.lat + ',' + routingRequest.origin.lon;
                    i = 1;
                    request_qs['wp.' + i.toString()] = routingRequest.destination.lat + ',' + routingRequest.destination.lon;
                    request_qs['dateTime'] = moment(routingRequest.localTime).tz(routingRequest.timeZone).format("MM/DD/YYYY HH:mm:SS");
                    if (routingRequest.alternatives > 1) {
                        request_qs['maxSolutions'] = routingRequest.alternatives;
                    }
                    getRequest['qs'] = request_qs;
                    return rp(getRequest);
                } catch (err) {
                    this.logger.error(`[bing.plan]:${err.message}`);
                    return null;
                }
            }
        },
        harmonise: {
            async handler(ctx) {
                const self = this;
                try {
                    const routingRequest = ctx.params.request;
                    const JSONrequest = ctx.params.request;
                    const bingRoutingPromises = _.map(config.get("routing_apis.bing.modes"), function (mode) {
                        return ctx.call("bing.plan", { request: JSONrequest });
                    });
                    let bingHarmonisedRoutes = [];
                    const bingResponses = await Promise.all(bingRoutingPromises);
                    _.each(bingResponses, function(bingResponse) {
                        if (bingResponse.statusCode === 200) {
                            _.each(bingResponse.resourceSets, function(resourceSets) {
                                bingHarmonisedRoutes = bingHarmonisedRoutes.concat(
                                    _.map(resourceSets.resources, function (route) {
                                        return (new BingRoute(route, routingRequest)).toJSON();
                                    })
                                );
                            });
                        }
                        else {
                            throw new Error(`[bing.harmonise]: Error harmonising the response. Response status code:${bingResponse.statusCode}`);
                        }
                    })
                    return bingHarmonisedRoutes;

                } catch (err) {
                    self.logger.error(`[bing.harmonise]:${err.message}`);
                }
            }
        }
    },
    methods: {
        getRoutingMode(requestMode) {
            switch (requestMode) {
                case 'CAR':
                    return 'Driving';
                case 'FOOT':
                    return 'Walking';
                case 'PUBLIC TRANSPORT':
                    return 'Transit';
                default:
                    return null;
            }
        }
    }
}