// Copyright (c) 2014-2015 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** Retrieve weather information for a given location using
 *  http://openweathermap.org .
 *  The location input is given as an object with two numeric fields,
 *  "latitude" and "longitude". The default is
 *  `{"latitude": 37.85, "longitude": -122.26}`, which is
 *  the location of Berkeley, California.
 *
 *  This accessor requires a "key" for the API, which you can
 *  obtain for free at http://openweathermap.org/appid .
 *
 *  This accessor does not block waiting for the response, but if any additional
 *  *location* input is received before a pending request has received a response
 *  or timed out, then the new request will be queued and sent out only after
 *  the pending request has completed. This strategy ensures that outputs are
 *  produced in the same order as the input requests.
 *
 *  @accessor services/Weather
 *  @author Edward A. Lee
 *  @version $$Id$$
 *  @input location The location, an object with two fields (default is Berkeley).
 *  @output response An object containing current weather data.
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, addInputParameter, error, exports, extend, input, get, getParameter, output, parameter, send */
/*jshint globalstrict: true*/
'use strict';

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    this.extend('net/REST');
    this.input('location', {'value': {"latitude": 37.85, "longitude": -122.26}});
    this.output('weather');
    this.parameter('temperature', {
        'type':'string',
        'options':['Fahrenheit', 'Celsius', 'Kelvin'],
        'value':'Fahrenheit'
    });
    this.parameter('key', {'type':'string', 'value':'Enter Key Here'});

    // Change default values of the base class inputs.
    // Also, hide base class inputs, except trigger.
    this.input('options', {'visibility':'expert', 'value':'"http://api.openweathermap.org"'});
    this.input('command', {'visibility':'expert', 'value':'/data/2.5/weather'});
    this.input('arguments', {'visibility':'expert', 'value':'{"lat":37.85, "lon":-122.26}'});
    this.input('body', {'visibility':'expert'});
    this.input('trigger', {'visibility':'expert'});
    this.output('headers', {'visibility':'expert'});
    this.output('status', {'visibility':'expert'});
    this.parameter('outputCompleteResponsesOnly', {'visibility':'expert'});
};

exports.initialize = function() {
    // Be sure to call the superclass so that the trigger input handler gets registered.
    this.ssuper.initialize();
    
    var key = this.getParameter('key');
    if (key == "Enter Key Here") {
        throw "Weather:  You need a key, which you can obtain at http://openweathermap.org/appid.";
    }

    // Handle location information.
    this.addInputHandler('location', function() {
        var location = this.get('location');
        if (location &&
                typeof location.latitude === 'number' &&
                typeof location.longitude === 'number') {
            var reformatted = {
                'lat' : location.latitude,
                'lon' : location.longitude,
                'APPID' : key
            };
            this.send('arguments', reformatted);
            this.send('trigger', true);
        } else {
            if (location ==- null) {
                error('Weather: No location information.');
            } else {
                error('Weather: Malformed location: ' + location +
                      '\nExpecting {"latitude":number, "longitude":number}');
            }
            this.send('weather', null);
        }
    });
};

/** Filter the response, extracting the weather information and
 *  outputting it on the weather output. The full response is produced
 *  on the 'response' output.
 */
exports.filterResponse = function(response) {
    if (response) {
        try {
            // NOTE: All of the following should be replaced with a generic
            // schema transformation utility.
            var parsed = JSON.parse(response);
            var weather = {};
            // Look for a description field.
            if (parsed.weather &&
                    Array.isArray(parsed.weather) &&
                    parsed.weather[0] &&
                    parsed.weather[0].description) {
                weather.description = parsed.weather[0].description;
            }
            if (parsed.main) {
                if (parsed.main.temp) {
                    weather.temperature = convertTemperature(parsed.main.temp);
                }
                if (parsed.main.pressure) {
                    weather['pressure (hPa)'] = parsed.main.pressure;
                }
                if (parsed.main.humidity) {
                    weather['humidity (percent)'] = parsed.main.humidity;
                }
                if (parsed.main.temp_min) {
                    weather['minimum temperature'] = convertTemperature(parsed.main.temp_min);
                }
                if (parsed.main.temp_max) {
                    weather['maximum temperature'] = convertTemperature(parsed.main.temp_max);
                }
                if (parsed.main.wind) {
                    if (parsed.main.wind.speed) {
                        weather['wind speed (meters/second)'] = parsed.main.wind.speed;
                    }
                    if (parsed.main.wind.deg) {
                        var deg = parsed.main.wind.deg;
                        var directions = [
                            "North",
                            "North Northeast",
                            "Northeast",
                            "East Northeast",
                            "East",
                            "East Southeast",
                            "Southeast",
                            "South Southeast",
                            "South",
                            "South Southwest",
                            "Southwest",
                            "West Southwest",
                            "West",
                            "West Northwest",
                            "Northwest",
                            "North Northwest"
                        ];
                        var index = Math.floor(((deg + 11.25) % 360)/22.5);
                        weather['wind direction'] = directions[index];
                    }
                }
            }
            if (parsed.name) {
                weather['place name'] = parsed.name;
            }
            this.send('weather', weather);
        } catch (err) {
            error('Weather: Unable to parse response: ' + err.message);
            this.send('weather', null);
        }
    } else {
        this.send('price', null);
    }
    return response;
};

/** Convert the temperature in kelvins to the units specified in the
 *  temperature parameter. Also, round the result to a precision of
 *  0.01 degrees.
 *  @param kelvin The temperature in degrees Kelvin.
 *  @return The temperature in the desired units.
 */
function convertTemperature(kelvin) {
    var units = this.getParameter('temperature');
    var result = kelvin;
    if (units == 'Fahrenheit') {
        result = (kelvin - 273.15) * 1.8 + 32.00;
    } else if (units == 'Celsius') {
        result = kelvin - 273.15;
    }
    return (Math.round(result * 100)/100);
}

