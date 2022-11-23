"use strict";
const _ = require('underscore');
const config = require('config');
const rp = require('request-promise');
const GoogleRoute = require('../../models/routes/GoogleRoute');
module.exports = {
    name: "google",
    settings: {
        host: config.get("routing_apis.google.host"),
        app_id: config.get("routing_apis.google.app_id")
    },
    actions: {
        plan: {
            async handler(ctx) {
                try {
                    const routingRequest = ctx.params.request;
                    const getRequest = {
                        uri: this.settings.host,
                        json: true
                    };
                    const request_qs = {
                        origin: routingRequest.origin.lat + ',' + routingRequest.origin.lon,
                        destination: routingRequest.destination.lat + ',' + routingRequest.destination.lon,
                        key: this.settings.app_id,
                        mode: this.getRoutingMode(routingRequest.mode),
                        units: 'metric'
                    };
                    let wpoints = " ";
                    if (routingRequest.numberOfWaypoints > 2) {
                        for (let i = 1; i < routingRequest.numberOfWaypoints - 1; i++) {
                            wpoints = wpoints + routingRequest.waypoints[i][1] + ',' + routingRequest.waypoints[i][0];
                            if (i !== routingRequest.numberOfWaypoints - 2) {
                                wpoints = wpoints + '|';
                            }
                        }
                        request_qs['waypoints'] = wpoints;
                    }
                    request_qs['departure_time'] = (new Date(routingRequest.timeConstraint.time)).getTime() / 1000;
                    if (routingRequest.alternatives > 1) {
                        request_qs['alternatives'] = true;
                    }
                    getRequest['qs'] = request_qs;
                    getRequest['timeout'] = config.get("routing_apis.routing_apis_request_timeout");
                    return rp(getRequest);
                } catch (err) {
                    this.logger.error(`[google.plan]:${err.message}`);
                    return null;
                }
            }
        },
        harmonise: {
            async handler(ctx) {
                const self = this;
                try {
                    let routingRequest;
                    const JSONrequest = ctx.params.request;
                    if (_.has(ctx.params, 'routingRequest')) {
                        routingRequest = ctx.params.request;
                    } else {
                        routingRequest = ctx.params.request;
                    }
                    const googleRoutingPromises = _.map(config.get("routing_apis.google.modes"), function (mode) {
                        return ctx.call("google.plan", { request: JSONrequest });
                    });
                    let googleHarmonisedRoutes = [];
                    const googleResponses = await Promise.all(googleRoutingPromises);
                    _.each(googleResponses, function(googleResponse) {
                        if (googleResponse.status === "OK") {
                            googleHarmonisedRoutes = googleHarmonisedRoutes.concat(_.map(googleResponse.routes, function (route) {
                                return (new GoogleRoute(route, routingRequest)).toJSON();
                            }));
                        } else {
                            if (googleResponse.hasOwnProperty('error_message')) {
                                self.logger.error(`[google.harmonise]:${googleResponse.error_message}`);
                            } else {
                                self.logger.error('[google.harmonise]:Google API response error');
                            }
                        }
                    });
                    return googleHarmonisedRoutes;
                } catch (err) {
                    self.logger.error(`[google.harmonise]:${err.message}`);
                }
            }
        }
    },
    methods: {
        getRoutingMode(requestMode) {
            var newModes = [];
            for (let i = 0; i < requestMode.length; i++) {
                if (requestMode[i]==='CAR') {
                    newModes.push('driving');
                } else if (requestMode[i]==='PUBLIC TRANSPORT') {
                    newModes.push('transit');
                } else if (requestMode[i]==='BICYCLE') {
                    newModes.push('bicycling');
                } else if (requestMode[i]==='FOOT') {
                    newModes.push('walking');
                } else{
                    newModes.push(null);
                }
            }
            return newModes;
        }
    }
}