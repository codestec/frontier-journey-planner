"use strict";

const _ = require('underscore');
const moment = require('moment');
const routingHelpers = require('../../lib/routing-helpers');
const ActionLeg = require('./ActionLeg');
const Leg = require('./RouteLeg');

class Route {
    constructor(request) {
        this._legs = []; //property for storing the legs of a route. A leg represents a part of the route between two waypoints
        this._distance = -1; //distance (in meters) of the route
        this._travelTime = -1; //estimated time (in sec) for the route taking into account traffic conditions
        this._modes = [];
        this._startTime = request !== null ? request.unixTime : undefined;
        this._localStartTime = request !== null ? request.localTime : undefined;
        this._isValidRoute = true;
        this._origin = request !== null ? request.origin : undefined;
        this._destination = request !== null ? request.destination : undefined;
        this._PT_Route = false;
        this._details = undefined;
        this._api = undefined;
        this._from_scenario = undefined;
        this._id = routingHelpers.randomID();
    }

    get id() {
        return this._id;
    }

    get from_scenario() {
        return this._from_scenario;
    }

    set from_scenario(value) {
        this._from_scenario = value;
    }

    get details() {
        return this._details;
    }

    set details(value) {
        this._details = value;
    }

    get origin() {
        return this._origin;
    }

    set origin(value) {
        this._origin = value;
    }

    set destination(value) {
        this._destination = value;
    }

    get PT_Route() {
        return this._PT_Route;
    }

    set PT_Route(value) {
        this._PT_Route = value;
    }

    get destination() {
        return this._destination;
    }

    get api() {
        return this._api;
    }

    set api(value) {
        this._api = value;
    }

    set isValidRoute(value) {
        this._isValidRoute = value;
    }

    get isValidRoute() {
        return this._isValidRoute;
    }

    get startTime() {
        return this._startTime;
    }

    set startTime(value) {
        this._startTime = value;
    }

    get distance() {
        return this._distance;
    }

    set distance(value) {
        this._distance = value;
    }

    get travelTime() {
        return this._travelTime;
    }

    set travelTime(value) {
        this._travelTime = value;
    }

    get localStartTime() {
        return this._localStartTime;
    }

    set localStartTime(value) {
        this._localStartTime = value;
    }

    addLeg(leg) {
        this._legs.push(leg)
    }

    set legs(value) {
        this._legs = value;
    }

    get legs() {
        return this._legs;
    }

    clearLegs() {
        this.legs.clear();
    }

    addMode(mode) {
        this._modes.push(mode);
    }

    get modes() {
        return this._modes;
    }

    getTotalValue(parameter) {
        let value = 0;
        _.each(this.legs, function (leg) {
            if (leg[parameter] === undefined)
                return undefined;
            else
                value = value + leg[parameter];
        });
        return value;
    }

    setModesFromLegs() {
        const self = this;
        this._modes = [];
        _.each(this._legs, function (leg) {
            if ((leg.hasMode) || _.has(leg, 'mode'))
                self.addMode(leg.mode);
        });
    }

    toJSON() {
        const JSONlegs = _.map(this.legs, function(leg) {
            if (leg instanceof Leg || leg instanceof ActionLeg) {
                return leg.toJSON();
            } else {
                return leg;
            }
        });
        return {
            'modes': this.modes,
            'travelTime': this.travelTime,
            'distance': this.distance,
            'api': this.api,
            'localStartTime': this.localStartTime,
            'startTime': this.startTime,
            'legs': JSONlegs,
            'origin': this.origin,
            'destination': this.destination,
            'ptRoute': this.PT_Route,
            'details': this.details !== undefined ? this.details : undefined,
            'id': this.id,
            'from_scenario': this.from_scenario !== undefined ? this.from_scenario : undefined
        }
    }
}

module.exports = Route;