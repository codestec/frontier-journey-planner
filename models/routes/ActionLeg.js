"use strict";
const routingHelpers = require('../../lib/routing-helpers');
class ActionLeg {
    constructor (travelTime, type, location) {
        this._travelTime = travelTime;
        this._type = type;
        this._location = location;
        this._id = routingHelpers.randomID();
        this._properties = { };
        this._isIncomplete = false;
    }

    toJSON () {
        return {
            travelTime: this._travelTime,
            distance: 0,
            actionType: this._type,
            location: this._location,
            id: this._id,
            details: this._properties,
            isIncomplete: this._isIncomplete
        }
    }

    addProperty (key, value) {
        this._properties[key] = value;
    }
}

module.exports = ActionLeg;