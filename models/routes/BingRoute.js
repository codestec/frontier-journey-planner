"use strict";

const _ = require('underscore');
const Route = require('./Route');
const Leg = require('./RouteLeg');
const Step = require('./RouteStep');
const TransportModes = require('../../lib/routing-helpers').TransportModes;
const Point = require('../geometry/Point');

class BingRoute extends Route {
    constructor(route, request) {
        super(request);
        this.api = "Bing";
        const self = this;
        //set the route path as an array of points
        this._routePath = [ ];
        _.each(route.routePath.line.coordinates, function(point) {
            self._routePath.push((new Point(point,1)).toHarmonised());
        });
        //set the mode used for the first step as the current mode
        let lastMode = BingRoute.harmonisedMode(route.routeLegs[0].itineraryItems[0].details[0].mode, route.routeLegs[0].itineraryItems[0].instruction.text);
        let shiftPathIndex = 0;
        //initialise the first leg of the route
        let currentLeg = new Leg(0, 0, lastMode, this.startTime);
        _.each(route.routeLegs, function (leg) {
            //add steps in each leg
            _.each(leg.itineraryItems, function (step) {
                let currentMode = BingRoute.harmonisedMode(step.details[0].mode, step.instruction.text);
                //if mode has changed
                if (currentMode !== lastMode) {
                    //set the new mode as the last mode
                    lastMode = currentMode;
                    //add the current leg to the route
                    self.addLeg(currentLeg);
                    //create a new leg
                    currentLeg = new Leg(0, 0, lastMode, currentLeg.startTime + currentLeg.travelTime);
                }
                const harmonisedStep = new Step();
                //set the times and distances related to the step
                harmonisedStep.distance = step.travelDistance * 1000;
                harmonisedStep.startTime = currentLeg.startTime + currentLeg.travelTime;
                harmonisedStep.travelTime = step.travelDuration;
                //get the coordinates that makeup the step
                const startPathIndex = step.details[0].startPathIndices[0] + shiftPathIndex;
                const endPathIndex = step.details[0].endPathIndices[0] + shiftPathIndex;
                harmonisedStep.points = self._routePath.slice(startPathIndex, endPathIndex + 1);
                if (step.details[0].startPathIndices[0] !== step.details[0].endPathIndices[0]) {
                //add the step to the leg if it is not the final one
                    currentLeg.addStep(harmonisedStep);
                }
                //increment the travel time and distance of the leg
                currentLeg.distance = currentLeg.distance + step.travelDistance * 1000;
                currentLeg.travelTime = currentLeg.travelTime + harmonisedStep.travelTime;
            });
            shiftPathIndex = leg.itineraryItems[leg.itineraryItems.length - 1].details[0].endPathIndices[0] + shiftPathIndex;
        });
        //add the last leg of the route
        this.addLeg(currentLeg);
        // set the total travel time and distances for the route
        this.travelTime = this.getTotalValue('travelTime');
        this.distance = this.getTotalValue('distance');
        //set the modes of the route from its legs
        this.setModesFromLegs();
    }

    static harmonisedMode(bingMode) {
        switch(bingMode) {
            case 'Driving':
                return TransportModes.CAR;
            case 'Walking':
                return TransportModes.WALKING;
        }
    }
}

module.exports = BingRoute;