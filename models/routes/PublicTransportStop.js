"use strict";

const moment = require('moment');
const geoTz = require('geo-tz');
const tz = require('moment-timezone');

class PublicTransportStop {
    //This is the class describing a transit stop
    constructor() {
        this._location = undefined;
        this._departureTime = undefined;
        this._localDepartureTime = undefined;
        this._arrivalTime = undefined;
        this._localArrivalTime = undefined;
        this._name = undefined;
        this._stopID = undefined;
    }

    get stopID() {
        return this._stopID;
    }

    set stopID(value) {
        this._stopID = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get location() {
        return this._location;
    }

    get departureTime() {
        return this._departureTime;
    }

    get arrivalTime() {
        return this._arrivalTime;
    }

    set location(value) {
        this._location = value;
    }

    set departureTime(value) {
        this._departureTime = value;
    }

    set arrivalTime(value) {
        this._arrivalTime = value;
    }

    get localArrivalTime() {
        if (this.arrivalTime !== undefined) {
            const timeZone = geoTz(this.location[1], this.location[0])[0];
            return moment.unix(this.arrivalTime).tz(timeZone).format('YYYY-MM-DDTHH:mm:ssZZ');
        } else {
            return undefined;
        }
    }

    get localDepartureTime() {
        if (this.departureTime !== undefined) {
            const timeZone = geoTz(this.location[1], this.location[0])[0];
            return moment.unix(this.departureTime).tz(timeZone).format('YYYY-MM-DDTHH:mm:ssZZ');
        } else {
            return undefined;
        }
    }

    toJSON() {
        return {
            location: this.location,
            arrivalTime: this.arrivalTime,
            localArrivalTime: this.localArrivalTime,
            departureTime: this._departureTime,
            localDepartureTime: this.localDepartureTime,
            name: this.name,
            id: this.stopID
        }
    }
}

module.exports = PublicTransportStop;