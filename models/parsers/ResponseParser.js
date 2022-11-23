"use strict";
const _ = require('underscore');
const routingHelpers = require ('../../../lib/routing-helpers');
const ActionLeg = require('../../../scenarios-route-generator/workers/routing/ActionLeg');
class ResponseParser {
//This is the base class for a response from an external routing API.
    constructor(api, requestParser) {
        this._routes = []; //property for storing the routes returned from a response.
        this._api = api;
        this._requestParser = requestParser;
    }

    get response() {
        return this._response;
    }

    set response(value) {
        this._response = value;
    }

    get requestParser() {
        return this._requestParser;
    }

    get requestOrigin() {
        return this._requestParser.waypoints[0];
    }

    get requestDestination() {
        return this._requestParser.waypoints[this._requestParser.numberOfWaypoints - 1];
    }

    get api() {
        return this._api;
    }

    addRoute(route) {
        this._routes.push(route);
    }

    get routes() {
        return this._routes;
    }

    set routes(value) {
        this._routes = value;
    }

    getMaaSRoute() {
        const routes = [];
        const apiResponses = [];
        _.each(this.routes, function (route) {
            const legs = [];
            _.each(route.legs, function(leg) {
                if (leg.mode === 'parking') {
                    const parkingActionLeg = new ActionLeg(leg.travelTime, 'Park', leg.steps[0].points[0]);
                    legs.push(parkingActionLeg.toJSON());
                } else {
                    leg.id = routingHelpers.randomID();
                    legs.push(leg.toJSON());
                }
            });
            routes.push({
                "modes": route.modes,
                'travelTime': route.travelTime,
                'distance': route.distance,
                'api': route.api,
                'startTime-ISO': routingHelpers.UTCtoSite([route.origin], route.startTime * 1000),
                'startTime': route.startTime,
                'legs': legs,
                'origin': route.origin,
                'destination': route.destination,
                'ptRoute': route.PT_Route,
                'details': route.details !== undefined ? route.details : undefined,
                'id': routingHelpers.randomID()
            });
            apiResponses.push(route.apiResponse);
        });
        return {
            routes: routes,
            apiResponses: apiResponses
        };
    }
}

module.exports = ResponseParser;