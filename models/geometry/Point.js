"use strict";
module.exports = class Point{
    constructor(point, order) {
        if (order === 0) {
            this._lon = point[0];
            this._lat = point[1];
        } else {
            this._lon = point[1];
            this._lat = point[0];
        }
    }

    get lon() {
        return this._lon;
    }

    get lat() {
        return this._lat;
    }

    toHarmonised() {
        return [this.lon, this.lat];
    }
}