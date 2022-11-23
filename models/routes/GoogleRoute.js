"use strict";
const _ = require('underscore');
const Route = require('./Route');
const Leg = require('./RouteLeg');
const Step = require('./RouteStep');
const TransportModes = require('../../lib/routing-helpers').TransportModes;
const Point = require('../geometry/Point');
const polyline = require('@mapbox/polyline');

class GoogleRoute extends Route {
    constructor(route, request) {
        super(request);
        this.api = "Google";
        const self = this;
        //将第一步使用的模式设置为当前模式
        //set the mode used for the first step as the current mode
        let lastMode = GoogleRoute.harmoniseMode(route.legs[0].steps[0].travel_mode);
        //初始化路由的第一段
        //initialise the first leg of the route
        let currentLeg = new Leg(0, 0, lastMode, self.startTime);
        _.each(route.legs, function(leg){
            //得到leg的旅行时间
            //get the travel time of the leg
            let currentLegDuration;
            if (leg.hasOwnProperty('duration_in_traffic'))
                currentLegDuration = leg.duration_in_traffic.value;
            else
                currentLegDuration = leg.duration.value;
            const currentLegBaseDuration = leg.duration.value;
            //在每条leg上增加台阶
            //add steps in each leg
            _.each(leg.steps, function(step) {
                let currentMode;
                currentMode = GoogleRoute.harmoniseMode(step.travel_mode);
                //如果currentMode与last mode不相同，则必须创建一个新的分支
                //if the currentMode is not the same as last mode a new leg must be created
                if (currentMode !== lastMode) {
                    //set the new mode as the last mode
                    lastMode = currentMode;
                    //add the current leg to the route
                    self.addLeg(currentLeg);
                    //create a new leg
                    currentLeg = new Leg(0, 0, lastMode, currentLeg.startTime + currentLeg.travelTime);
                }
                const harmonisedStep = new Step();
                //set the properties of the step
                //calculate the travelTime for the step. If car step the step travel time must be based on the travel time in traffic of the leg
                harmonisedStep.travelTime = Math.round((step.duration.value / currentLegBaseDuration) * currentLegDuration);
                harmonisedStep.distance = step.distance.value;
                harmonisedStep.startTime = currentLeg.startTime + currentLeg.travelTime;
                harmonisedStep.points = GoogleRoute.getPoints(step.polyline);
                //add the step to the leg
                currentLeg.addStep(harmonisedStep);
                //increase the travel time and distance of the leg
                currentLeg.travelTime = currentLeg.travelTime + harmonisedStep.travelTime;
                currentLeg.distance = currentLeg.distance + harmonisedStep.distance;
            });
        });
        //add the last leg of the route
        this.addLeg(currentLeg);

        // set the total travel time and distances for the route
        this.travelTime = this.getTotalValue('travelTime');
        this.distance = this.getTotalValue('distance');

        //set the modes of the route from its legs
        this.setModesFromLegs();
    }

    static getPoints(pLine) {
        const points = [];
        const googleStepPoints = polyline.decode(pLine.points);
        _.each(googleStepPoints, function(point) {
            const newPoint = new Point(point, 1);
            points.push(newPoint.toHarmonised());
        });
        return points;
    }

    static harmoniseMode(googleMode) {
        switch (googleMode) {
            case 'BICYCLING':
                return TransportModes.BICYCLE;
            case 'DRIVING':
                return TransportModes.CAR;
            default:
                return TransportModes.UNKNOWN;
        }
    }
}

module.exports = GoogleRoute;