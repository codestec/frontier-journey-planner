"use strict";
const _ = require('underscore');
const moment = require('moment');
const tz = require('moment-timezone');
const geoTz = require('geo-tz');
const Route = require('./Route');
const Leg = require('./RouteLeg');
const ActionLeg = require('./ActionLeg');
const Step = require('./RouteStep');
const PublicTransportLine = require('./PublicTransportLine');
const PublicTransportStop = require('./PublicTransportStop');
const TransportModes = require('../../lib/routing-helpers').TransportModes;
class HereRoute extends Route {
    constructor(route, operators, request) {
        super(request);
        this.api = 'Here';
        const self = this;
        this.PT_Route = true;
        this.startTime = moment.tz(route.sections[0].departure.time, request.timeZone).unix();
        let routeTravelTime = 0;
        _.each(route.sections, function (leg, index) {
            const currentMode = HereRoute.harmoniseMode(leg.mode);
            if (currentMode === TransportModes.WALKING || currentMode === TransportModes.CAR) {
                const harmonisedStep = new Step();
                harmonisedStep.travelTime = ((Math.abs(new Date(leg.arrival.time) - new Date(leg.departure.time))) / 1000);
                harmonisedStep.distance = leg.Journey.distance;
                let departurePoint = undefined;
                let arrivalPoint = undefined;
                if (leg.departure.hasOwnProperty('address'))
                    departurePoint = [leg.departure.address.location.lat, leg.departure.address.location.lng];
                else
                    departurePoint = [leg.departure.place.location.lat, leg.departure.place.location.lng];
                if (leg.arrival.hasOwnProperty('address'))
                    arrivalPoint = [leg.arrival.address.location.lat, leg.arrival.address.location.lng];
                else
                    arrivalPoint = [leg.arrival.place.location.lat, leg.arrival.place.location.lng];
                harmonisedStep.points = [departurePoint, arrivalPoint];
                harmonisedStep.startTime = self.startTime + routeTravelTime;
                const currentLeg = new Leg(harmonisedStep.travelTime, harmonisedStep.distance, currentMode, harmonisedStep.startTime);
                currentLeg.addStep(harmonisedStep);
                currentLeg.isIncomplete = true;
                self.addLeg(currentLeg);
                routeTravelTime = routeTravelTime + harmonisedStep.travelTime;
                if (currentMode === TransportModes.CAR) {
                    const parkingTime = ((Math.abs(new Date(route.sections[index + 1].departure.time) - new Date(leg.arrival.time))) / 1000);
                    const parkingLeg = new ActionLeg(parkingTime, 'Park', arrivalPoint);
                    self.addLeg(parkingLeg);
                    routeTravelTime = routeTravelTime + parkingTime;
                }
            } else {
                const currentLeg = new Leg(undefined, undefined, currentMode, self.startTime + routeTravelTime);
                currentLeg.waitingTime = moment.tz(leg.departure.time, request.timeZone).unix() - currentLeg.startTime;
                currentLeg.transitTime = ((Math.abs(new Date(leg.arrival.time) - new Date(leg.departure.time))) / 1000);
                currentLeg.travelTime = currentLeg.waitingTime + currentLeg.transitTime;
                currentLeg.transitDetails = HereRoute.setTransportLineDetails(leg, operators);
                routeTravelTime = routeTravelTime + currentLeg.travelTime;
                self.addLeg(currentLeg);
            }
        });
        this.travelTime = this.getTotalValue('travelTime');
        this.distance = this.getTotalValue('distance');
        this.setModesFromLegs();
    }
    static setTransportLineDetails(transitLeg, agencies) {
        const transitLine = new PublicTransportLine();
        const arrivalStop = new PublicTransportStop();
        arrivalStop.name = transitLeg.arrival.place.name;
        arrivalStop.location = [transitLeg.arrival.place.location.lat, transitLeg.arrival.place.location.lng];
        arrivalStop.arrivalTime = moment.tz(transitLeg.arrival.time, geoTz(arrivalStop.location[1], arrivalStop.location[0])[0]).unix();
        const departureStop = new PublicTransportStop();
        departureStop.name = transitLeg.departure.place.name;
        departureStop.location = [transitLeg.departure.place.location.lat, transitLeg.departure.place.location.lng];
        departureStop.departureTime = moment.tz(transitLeg.departure.time, geoTz(departureStop.location[1], departureStop.location[0])[0]).unix();
        if (transitLeg.hasOwnProperty('Journey')) {
            _.each(transitLeg.Journey.Stop, function (intermediateStop, index) {
                if (index !== 0 && index !== transitLeg.Journey.Stop.length - 1) {
                    const interStop = new PublicTransportStop();
                    interStop.name = intermediateStop.place.name;
                    interStop.stopID = intermediateStop.place.id;
                    interStop.location = [ intermediateStop.place.location.lat, intermediateStop.place.location.lng ];
                    interStop.departureTime = moment.tz(intermediateStop.departure, geoTz(interStop.location[1], interStop.location[0])[0]).unix();
                    transitLine.addIntermediateStop(interStop.toJSON());
                }
            });
        }
        if (transitLeg.departure.hasOwnProperty('Transport')) {
            console.log('In if (transitLeg.departure.hasOwnProperty(Transport)) ');
            transitLine.lineName = transitLeg.departure.Transport.name;
            transitLine.lineShortName = transitLine.lineName;
            transitLine.destination = transitLeg.departure.Transport.dir;
            transitLine.agencyID = transitLeg.departure.Transport.At.operator;
            transitLine.agencyName = _.findWhere(agencies.Op, { 'code': transitLine.agencyID }).name;
        }
        transitLine.arrivalStop = arrivalStop;
        transitLine.departureStop = departureStop;
        transitLine.departureTime = departureStop.departureTime;
        transitLine.arrivalTime = arrivalStop.arrivalTime;
        return transitLine;
    }
    static harmoniseMode(hereMode) {
        switch (hereMode) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                return TransportModes.PUBLIC_TRANSPORT.TRAIN;
            case 5:
            case 12:
                return TransportModes.PUBLIC_TRANSPORT.BUS;
            case 7:
                return TransportModes.PUBLIC_TRANSPORT.METRO;
            case 8:
                return TransportModes.PUBLIC_TRANSPORT.TRAM;
            case 20:
                return TransportModes.WALKING;
            case 21:
                return TransportModes.CAR;
            default:
                return TransportModes.PUBLIC_TRANSPORT.GENERIC;
        }
    }
}
console.log('module.exports = HereRoute');
module.exports = HereRoute;