"use strict";
const _ = require('underscore');
const moment = require('moment');
const geoTz = require('geo-tz');
const routingHelpers = require('../lib/routing-helpers');
class RoutingRequest {
    constructor(request) {
        this._coordinates = _.map(request.coordinates, function (location) {
            return [routingHelpers.roundFloat(location[0], 5), routingHelpers.roundFloat(location[1], 5)];
        });
        this._type = request.properties.routeType;
        this._alternatives = request.properties.alternatives;
        this._includeVendingMachine = request.properties.hasOwnProperty('include_ticket_vending_machine') ? request.properties.include_ticket_vending_machine : false;
        this._avoid = request.properties.hasOwnProperty('avoid') ? request.properties.avoid : [];
        const timeZone = geoTz(this.origin[1], this.origin[0])[0];
        let unixTime;
        if (request.properties.timeConstraint.hasOwnProperty('unixTime')) {
            unixTime = request.properties.timeConstraint.unixTime;
        } else {
            if (request.properties.timeConstraint.time === 'NOW') {
                unixTime = moment().unix();
            } else {
                unixTime = moment.utc(request.properties.timeConstraint.time).unix();
            }
        }
        const localTime = moment.unix(unixTime).tz(timeZone).format('YYYY-MM-DDTHH:mm:ssZZ');
        this._timeConstraint = {
            'constraint': request.properties.timeConstraint.constraint,
            'unixTime': unixTime,
            'localTime': localTime,
            'time': `${moment(localTime).utc().format("YYYY-MM-DDTHH:mm:ss")}Z`,
            'timeZone': timeZone
        };
        this._cities = request.hasOwnProperty('cities') ? request.cities : undefined;
        this._initiator = request.hasOwnProperty('initiator') ? request['initiator'] : null;
        this._userID = request.hasOwnProperty('userID') ? request['userID'] : routingHelpers.randomID();
        this._id = request.hasOwnProperty('requestID') ? request['requestID'] : routingHelpers.randomID();
    }
    toJSON() {
        return {
            type: "MultiPoint",
            userID: this._userID,
            initiator: this._initiator,
            requestID: this._id,
            properties: {
                routeType: this._type,
                alternatives: this._alternatives,
                timeConstraint: this._timeConstraint,
                include_ticket_vending_machine: this._includeVendingMachine,
                avoid: this._avoid
            },
            coordinates: this._coordinates
        }
    }

    get city() {
        return this._cities[0] === this._cities[1] ? this._cities[0] : 'Global';
    }

    get timeZone() {
        return this._timeConstraint.timeZone;
    }

    get unixTime() {
        return this._timeConstraint.unixTime;
    }

    get localTime() {
        return this._timeConstraint.localTime;
    }

    get UTCtime() {
        return this._timeConstraint.time;
    }

    get includeVendingMachine() {
        return this._includeVendingMachine === "true";
    }

    set includeVendingMachine(value) {
        this._includeVendingMachine = value;
    }

    get id() {
        return this._id;
    }

    get waypoints() {
        return this._coordinates;
    }

    get origin() {
        return this.waypoints[0];
    }

    set origin(value) {
        this.waypoints[0] = [routingHelpers.roundFloat(value[0], 5), routingHelpers.roundFloat(value[1], 5)];
    }

    get destination() {
        return this.waypoints[this.waypoints.length - 1];
    }

    set destination(value) {
        this.waypoints[this.waypoints.length - 1] = [routingHelpers.roundFloat(value[0], 5), routingHelpers.roundFloat(value[1], 5)];
    }

    get userID() {
        return this._userID;
    }

    get type() {
        return this._type;
    }

    get avoid() {
        return this._avoid;
    }

    get alternatives() {
        return this._alternatives;
    }

    get timeConstraint() {
        return this._timeConstraint;
    }

    get numberOfWaypoints() {
        return this._coordinates.length;
    }
}
module.exports = RoutingRequest;