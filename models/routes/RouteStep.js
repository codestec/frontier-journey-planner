"use strict";
class RouteStep {
    constructor() {
        this._points = undefined;
        this._distance = undefined; // distance (in meters) of the step
        this._travelTime = undefined; //estimated time (in sec) for the step taking into account traffic conditions when available
        this._startTime = undefined; //the start time of the step in UNIX timestamp
        this._pilotSite = undefined; //the pilot site that the request is for
    }

    get pilotSite() {
        return this._pilotSite;
    }

    set pilotSite(value) {
        this._pilotSite = value;
    }

    get points() {
        return this._points;
    }

    set points(value) {
        this._points = value;
    }

    set startTime(timestamp) {
        this._startTime = timestamp;
    }

    get startTime() {
        return this._startTime;
    }

    get distance() {
        return this._distance;
    }

    set distance(distance) {
        this._distance = distance;
    }

    get travelTime() {
        return this._travelTime;
    }

    set travelTime(travelTime) {
        this._travelTime = travelTime;
    }

    toJSON() {
        return {
            "distance": this._distance,
            "travelTime": this._travelTime,
            "points": this._points
        }
    }
}

module.exports = RouteStep;