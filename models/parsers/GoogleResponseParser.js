"use strict";
const RoutingRequest = require('../RoutingRequest');
const GoogleRoute = require('../routes/GoogleRoute');
const ResponseParser = require('../parsers/ResponseParser');
class GoogleResponseParser extends ResponseParser {
    constructor (response, requestParser) {
        super('Google', requestParser);
        for (let i=0; i<response.length; i++) {
            if (response[i]['res']['status'] === 'OK') {
                const googleRoutes = response[i]['res']['routes'];
                for (let route = 0; route < googleRoutes.length; route++) {
                    this.addRoute(new GoogleRoute(googleRoutes[route], this, response[i]['req']));
                }
            } else {
                logger.logger_unimodal_route_aggregator.log('error',`Google API response error. Error:${response[i]['res']['status']}`);
            }
        }
    }
}
module.exports = GoogleResponseParser;