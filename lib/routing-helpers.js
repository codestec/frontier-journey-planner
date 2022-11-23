"use strict";

const _ = require('underscore');
const whichPolygon = require('which-polygon');
const geolib = require('geolib');
const date_functions = require('date-fns');
const turf = require('@turf/turf');
const path = require('path');
const fs = require('fs');
// const geoTz = require('geo-tz');
const moment = require('moment');
const momentTz = require('moment-timezone');

//an enum for transport modes
const TransportModes = {
    PUBLIC_TRANSPORT: {
        GENERIC: "public_transport_generic",
        BUS: "public_transport_bus",
        TRAIN: "public_transport_train",
        METRO: "public_transport_metro",
        UNDERGROUND: "public_transport_underground",
        TRAM: "public_transport_tram",
        WAITING: "public_transport_waiting"
    },
    CAR: "private_car",
    BICYCLE: "bicycle",
    WALKING: "walking",
    UNKNOWN: "unknown"
};

//an enum for transport mode speed
const TransportModesSpeeds = {
    public_transport_bus: 1,
    public_transport_train: 3,
    public_transport_metro: 2,
    public_transport_underground: 3,
    public_transport_tram: 2
};

//Check if a location is in array of locations
exports.locationInArray = (locations, location) => {
    const found = (_.findIndex(locations, function(loc) {
        return _.difference(location, loc).length === 0;
    }) !== -1);
    return found;
}

//Return the index of a location in an array of locations
exports.indexOfLocationInArray = (locations, location) => {
    return _.findIndex(locations, function(loc) {
        return _.difference(location, loc).length === 0;
    });
}

//Returns the float pricise to specific decimal places
exports.roundFloat = (value, precision) => {
    if (Number.isInteger(precision)) {
        const shift = Math.pow(10, precision);
        return Math.round(value * shift) / shift;
    } else {
        return Math.round(value);
    }
}

//Checks if a mode is a public transport mode
exports.isPublicTransportMode = (mode) => {
    return Object.keys(TransportModes.PUBLIC_TRANSPORT).some(function (key) {
        return TransportModes.PUBLIC_TRANSPORT[key] === mode;
    });
};

//Generates a random string of characters to be used as ID for different objects
exports.randomID = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

//Compares if two points have the same coordinates
exports.matchedCoordinates = (point1, point2, precision) => {
    return (
        roundFloat(point1[0], precision) === roundFloat(point2[0], precision) &&
        roundFloat(point1[1], precision) === roundFloat(point2[1], precision)
    )
};

exports.TransportModes = TransportModes;
exports.TransportModesSpeeds = TransportModesSpeeds;