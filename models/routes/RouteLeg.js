"use strict";
const _ = require('underscore');
const moment = require('moment');
const geoTz = require('geo-tz');
const routingHelpers = require('../../lib/routing-helpers');
class RouteLeg {
    constructor(travelTime, distance, mode, startTime) {
        this._steps = [ ]; //property for storing the steps of a leg. A step represents a part of the leg to allow for a better decomposition of a route
        this._distance = distance; // distance (in meters) of the leg
        this._travelTime = travelTime; //estimated time (in sec) for the leg taking into account traffic conditions when available
        this._mode = mode; //the mode used to travel the leg
        this._startTime = startTime; //the start time of the leg in UNIX timestamp
        this._waitingTime = 0; //the waiting time before the commencement of the leg in sec
        this._transitTime = undefined; //the in-vehicle time for a public transport leg
        this._transitDetails = undefined;
        this._localStartTime = undefined;
        this._id = routingHelpers.randomID();
        this._actionType = undefined;
        this._msp = undefined;
        this._location = undefined;
        this._details = undefined;
        this._isIncomplete = false;
        this._origin = undefined;
        this._destination = undefined;
    }
    set origin(value) {
        this._origin = value;
    }

    set destination(value) {
        this._destination = value;
    }

    set isIncomplete(value) {
        this._isIncomplete = value;
    }

    get isIncomplete() {
        return this._isIncomplete;
    }

    set details(value) {
        this._details = value;
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    get msp() {
        return this._msp;
    }

    set msp(value) {
        this._msp = value;
    }

    get actionType() {
        return this._actionType;
    }

    set actionType(value) {
        this._actionType = value;
    }

    get transitTime() {
        return this._transitTime;
    }

    set transitTime(value) {
        this._transitTime = value;
    }

    set id(value) {
        this._id = value;
    }

    set transitDetails(value) {
        this._transitDetails = value;
    }

    get isPT() {
        return routingHelpers.isPublicTransportMode(this._mode);
    }

    get transitDetails() {
        return this._transitDetails;
    }

    set waitingTime(value) {
        this._waitingTime = value;
    }

    get waitingTime() {
        return this._waitingTime;
    }

    set startTime(value) {
        this._startTime = value;
    }

    get startTime() {
        return this._startTime;
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

    set steps(value) {
        this._steps = value;
    }

    get steps() {
        return this._steps;
    }

    addStep(step) {
        this._steps.push(step);
    }

    set mode(value) {
        this._mode = value;
    }

    get mode() {
        return this._mode;
    }

    get hasMode() {
        return (_.has(this, '_mode') && this._mode !== undefined) 
    }

    get origin() {
        if (this.isPT) {
            return this.transitDetails.departureStop.location;
        } else {
            if (!this.hasOwnProperty('actionType')) {
                if (this.steps[0] !== undefined)
                    return this.steps[0].points[0];
                else
                    return this._origin;
            } else {
                return this.location;
            }
        }
    }

    get destination() {
        if (this.isPT) {
            return this.transitDetails.arrivalStop.location;
        } else {
            if (!this.hasOwnProperty('actionType')) {
                if (this.steps[0] !== undefined)
                    return this.steps[this.steps.length-1].points[this.steps[this.steps.length-1].points.length-1];
                else
                    return this._destination;
            } else {
                return this.location;
            }
        }
    }

    get localStartTime() {
        const org = this._origin === undefined ? this.origin : this._origin;
        const timeZone = geoTz(org[1], org[0])[0];
        return moment.unix(this._startTime).tz(timeZone).format('YYYY-MM-DDTHH:mm:ssZZ');
    }

    toJSON() {
        const steps = [ ];
        _.each(this._steps, function(step){
             steps.push(step.toJSON());
        });
        const JSON = {
            "isPT": this.isPT,
            "id": this._id,
            "distance": this._distance,
            "travelTime": this._travelTime,
            "mode": this._mode,
            "startTime": this._startTime,
            "waitingTime": this._waitingTime,
            "transitTime": this._transitTime,
            "steps": steps.length > 0 ? steps : undefined,
            "transitDetails": this._transitDetails !== undefined ? this._transitDetails.toJSON() : undefined,
            "actionType": this._actionType !== undefined ? this._actionType : undefined,
            "msp": this._msp !== undefined ? this._msp : undefined,
            "location": this._location !== undefined ? this._location : undefined,
            "localStartTime": this.localStartTime !== undefined ? this.localStartTime : undefined,
            "origin": this.origin,
            "destination": this.destination,
            "details": this._details !== undefined ? this._details : undefined,
            "isIncomplete": this._isIncomplete
        }
        return JSON;
    }
}

module.exports = RouteLeg;