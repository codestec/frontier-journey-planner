"use strict";
const _ = require('underscore');
const config = require('config');
const moment = require('moment');
const rp = require('request-promise');
const HereRoute = require('../../models/routes/HereRoute');
module.exports = {
    name: "here",
    settings: {
        ptHost: config.get("routing_apis.here.ptHost"),
        prHost: config.get("routing_apis.here.prHost"),
        getRequest: {
            timeout: config.get("routing_apis.routing_apis_request_timeout"),
            json: true
        },
        request_qs: {
            apikey: config.get("routing_apis.here.apikey")
        }
    },
    actions: {
        plan: {
            async handler(ctx) {
                const routingRequest = ctx.params.request;
                if (ctx.params.request.mode[0] === "PUBLIC TRANSPORT") {
                    return this.plan_pt(routingRequest);
                } else if (ctx.params.request.mode[0] === "PARK AND RIDE") {
                    return this.plan_pr(routingRequest);
                } else {
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
                    const hereRoutingPromises = _.map(config.get("routing_apis.here.modes"), function (mode) {
                        return ctx.call("here.plan", { request: JSONrequest });
                    });
                    let hereHarmonisedRoutes = [];
                    const hereResponses = await Promise.all(hereRoutingPromises);
                    _.each(hereResponses, function (hereResponse) {
                        hereHarmonisedRoutes = hereHarmonisedRoutes.concat(_.map(hereResponse.routes, function (route) {
                            return (new HereRoute(route, null, routingRequest)).toJSON();
                        }));
                    });
                    return hereHarmonisedRoutes;
                } catch (err) {
                    self.logger.error(`[here.harmonise]:${err.message}`);
                    return null;
                }
            }
        }
    },
    methods: {
        plan_pt(routingRequest) {
            try {
                console.log('in plan_pt routingRequest');
                console.log('routingRequest=',routingRequest);
                console.log('this.settings.request_qs=', this.settings.request_qs);
                const request_qs = this.settings.request_qs;
                console.log('request_qs=',request_qs);
                request_qs['origin'] = routingRequest.origin.lat + ',' + routingRequest.origin.lon;
                request_qs['destination'] = routingRequest.destination.lat + ',' + routingRequest.destination.lon;
                request_qs['max'] = 6;
                if (routingRequest.timeConstraint['constraint'] === "ARRIVAL") {
                    request_qs['arrival'] = 1;
                }
                request_qs['time'] = moment(routingRequest.localTime).tz(routingRequest.timeZone).format("YYYY-MM-DDTHH:mm:ss");
                request_qs['unixTime'] = new Date(routingRequest.timeConstraint.time).getTime() / 1000;
                request_qs['walk'] = '6000,100';
                const getRequest = this.settings.getRequest;
                getRequest['uri'] = this.settings.ptHost;
                getRequest['qs'] = request_qs;
                return this.request(getRequest);
            }
            catch (err) {
                this.logger.error(`[here.plan_pt]:${err.message}`);
            }
        },
        plan_pr(routingRequest) {
            try {
                const request_qs = this.settings.request_qs;
                request_qs['profile'] = 'parkandride';
                request_qs['origin'] = routingRequest.origin.lat + ',' + routingRequest.origin.lon;
                request_qs['destination'] = routingRequest.destination.lat + ',' + routingRequest.destination.lon;
                request_qs['details'] = 1;
                request_qs['graph'] = 1;
                request_qs['intermodal_max'] = 6;
                request_qs['time'] = moment(routingRequest.localTime).tz(routingRequest.timeZone).format("YYYY-MM-DDTHH:mm:ss");
                const getRequest = this.settings.getRequest;
                getRequest['uri'] = this.settings.prHost;
                getRequest['qs'] = request_qs;
                return this.request(getRequest);
            }
            catch (err) {
                this.logger.error(`[here.plan_pr]:${err.message}`);
            }
        },
        request(getRequest) {
            try {
                return rp(getRequest);
            } catch (err) {
                this.logger.error(`[here.request]:${err.message}`);
                return null;
            }
        }
    }
}