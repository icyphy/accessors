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

/** Retrieve a location given an address.
 *  The location is given as an object with two numeric fields,
 *  "latitude" and "longitude". For example,
 *  `{"latitude": 37.85, "longitude": -122.26}` is
 *  the location of Berkeley, California.
 *
 *  This accessor requires a "key" for the Google Geocoding API, which you can
 *  obtain for free at https://developers.google.com/maps/documentation/geocoding/intro .
 *
 *  @accessor services/GeoCoder
 *  @author Edward A. Lee
 *  @version $Id$
 *  @input {string} address The address, which defaults to "Berkeley, CA".
 *  @parameter {string} key The key for the Google geocoding API.
 *  @output response An object containing the location information.
 */

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    extend('net/REST');
    input('address');
    output('location');
    parameter('key', {'type':'string', 'value':'Enter Key Here'});
    
    // Change default values of the base class inputs.
    // Also, hide base class inputs, except trigger.
    // Note the need for quotation marks on the options parameter.
    input('options', {'visibility':'expert', 'value':'"https://maps.googleapis.com"'});
    input('command', {'visibility':'expert', 'value':'maps/api/geocode/json'});
    // NOTE: The value can be given as a JSON string or a JavaScript object.
    input('arguments', {'visibility':'expert', 'value':{"address":"Berkeley, CA", "key":"Enter Key Here"}});
    input('body', {'visibility':'expert'});
    input('trigger', {'visibility':'expert'});
    parameter('outputCompleteResponsesOnly', {'visibility':'expert'});
};

exports.initialize = function() {
    // Be sure to call the superclass so that the trigger input handler gets registered.
    this.ssuper.initialize();
    
    var key = getParameter('key');
    if (key == "Enter Key Here") {
        throw "GeoCoder:  You need a key, which you can obtain at https://developers.google.com/maps/documentation/geocoding/intro.";
    }
    // Handle location information.
    addInputHandler('address', function() {
        var address = get('address');
        if (address) {
            var arguments = {
                'address' : address,
                'key' : key
            };
            send('arguments', arguments);
            send('trigger', true);
        } else {
            error('GeoCoder: No address.');
            send('location', null);
        }
    });
};

/** Filter the response, extracting the latitude and longitude and
 *  formatting.
 */
exports.filterResponse = function(response) {
    if (response) {
        try {
            // NOTE: All of the following should be replaced with a generic
            // schema transformation utility.
            var parsed = JSON.parse(response);
            // FIXME: Just taking the first result if there are multiple matches.
            if (parsed.results
                    && parsed.results[0]
                    && parsed.results[0].geometry
                    && parsed.results[0].geometry.location
                    && parsed.results[0].geometry.location.lat
                    && parsed.results[0].geometry.location.lng) {
                send('location', {
                        "latitude": parsed.results[0].geometry.location.lat,
                        "longitude": parsed.results[0].geometry.location.lng
                });
            } else {
                error('GeoCoder: No matching location.');
                send('location', null);
            }
        } catch (err) {
            error('GeoCoder: Unable to parse response: ' + err.message);
        }
    }
    return response;
};
