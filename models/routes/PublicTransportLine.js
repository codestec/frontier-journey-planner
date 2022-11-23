"use strict";

class PublicTransportLine {
    //This is the base class for a public transport line
    constructor (timezone) {
        this._departureTime = undefined;
        this._arrivalTime = undefined;
        this._lineName = undefined;
        this._lineShortName = undefined;
        this._agencyName = undefined;
        this._agencyID = undefined;
        this._tripID = undefined;
        this._routeID = undefined;
        this._destination = undefined;
        this._arrivalStop = undefined;
        this._departureStop = undefined;
        this._intermediateStops = [];
    }

    get routeID() {
        return this._routeID;
    }

    set routeID(value) {
        this._routeID = value;
    }

    set departureTimeISO(value) {
        this._departureTimeISO = value;
    }

    set arrivalTimeISO(value) {
        this._arrivalTimeISO = value;
    }

    get arrivalStop() {
        return this._arrivalStop;
    }

    set arrivalStop(value) {
        this._arrivalStop = value;
    }

    get departureStop() {
        return this._departureStop;
    }

    set departureStop(value) {
        this._departureStop = value;
    }

    get intermediateStops() {
        return this._intermediateStops;
    }

    set intermediateStops(value) {
        this._intermediateStops = value;
    }

    addIntermediateStop(stop) {
        this._intermediateStops.push(stop);
    }

    get departureTime() {
        return this._departureTime;
    }

    get arrivalTime() {
        return this._arrivalTime;
    }

    get lineName() {
        return this._lineName;
    }

    set departureTime(value) {
        this._departureTime = value;
    }

    set arrivalTime(value) {
        this._arrivalTime = value;
    }

    set lineName(value) {
        this._lineName = value;
    }

    set lineShortName(value) {
        this._lineShortName = value;
    }

    set agencyName(value) {
        this._agencyName = value;
    }

    set agencyID(value) {
        this._agencyID = value;
    }

    set tripID(value) {
        this._tripID = value;
    }

    set destination(value) {
        this._destination = value;
    }

    get lineShortName() {
        return this._lineShortName;
    }

    get agencyName() {
        return this._agencyName;
    }

    get agencyID() {
        return this._agencyID;
    }

    get destination() {
        return this._destination;
    }

    get localArrivalTime() {
        return this._arrivalStop.localArrivalTime;
    }

    get localDepartureTime() {
        return this._departureStop.localDepartureTime;
    }

    toJSON() {
        return {
            "arrivalTime": this._arrivalTime,
            "departureTime": this._departureTime,
            "linename": this._lineName,
            "lineShortName": this._lineShortName,
            "agencyName": this._agencyName,
            "agencyID": this._agencyID,
            "destination": this._destination,
            "tripID": this._tripID,
            "arrivalStop": this._arrivalStop !== undefined ? this._arrivalStop.toJSON() : undefined,
            "departureStop": this._departureStop !== undefined ? this._departureStop.toJSON() : undefined,
            "localDepartureTime": this.localDepartureTime,
            "localArrivalTime": this.localArrivalTime,
            "intermediateStops": this._intermediateStops
        };
    }
}

module.exports = PublicTransportLine;