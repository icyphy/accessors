// Copyright (c) 2016-2017 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//

/** Retrieve an address given a location.
 *  The location is given as an object with two numeric fields,
 *  "latitude" and "longitude". For example,
 *  `{"latitude": 37.85, "longitude": -122.26}` is
 *  the location of Berkeley, California.
 *
 *  This accessor requires a "key" for the Google Geocoding API, which you can
 *  obtain for free at https://developers.google.com/maps/documentation/geocoding/intro .
 *
 *  This accessor looks for a key in $KEYSTORE/geoCoderKey, which
 *  resolves to $HOME/.ptKeystore/geoCoderKey (GeoCoding uses the same key as ReverseGeoCoding). 
 *
 *  This accessor does not block waiting for the response, but if any additional
 *  *address* input is received before a pending request has received a response
 *  or timed out, then the new request will be queued and sent out only after
 *  the pending request has completed. This strategy ensures that outputs are
 *  produced in the same order as the input requests.
 *
 *  If multiple addresses are returned from the google reverse geocoding service,
 *  this accessor outputs the first one on address. The full response is available
 *  at the response output.
 *  
 *  The accuracy property of the location input is used to filter the returned results.
 *  If for example, location is given at a very low accuracy and the given coordinates are
 *  intended to represent an entire city or district, it would be overly specific to return
 *  the street address. Instead the name of the city should be the output.
 *
 *  @accessor services/ReverseGeoCoder
 *  @input location The location, as an object with a 'latitude' and 'longitude'
 *   property.
 *  @output {string} address The first returned address, for example "Berkeley, CA".
 *  @output response An object containing the full address information.
 *  @author Matt Weber
 *  @version $$Id: GeoCoder.js 1804 2017-06-02 19:23:00Z cxh $$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, get, getParameter, getResource, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/REST');
    this.input('location',{
        "type": 'JSON'
    });
    this.output('address',{
        "type": 'string'
    });

    // Change default values of the base class inputs.
    // Also, hide base class inputs, except trigger.
    // Note the need for quotation marks on the options parameter.
    this.input('options', {
        'visibility': 'expert',
        'value': '{"url": "https://maps.googleapis.com"}'
    });
    this.input('command', {
        'visibility': 'expert',
        'value': 'maps/api/geocode/json'
    });

    this.input('arguments', {
        'visibility': 'expert'
    });
    this.input('body', {
        'visibility': 'expert'
    });
    this.input('trigger', {
        'visibility': 'expert'
    });
    this.output('headers', {
        'visibility': 'expert'
    });
    this.output('status', {
        'visibility': 'expert'
    });
    this.parameter('outputCompleteResponseOnly', {
        'visibility': 'expert'
    });
};

exports.initialize = function () {
    // Be sure to call the superclass so that the trigger input handler gets registered.
    exports.ssuper.initialize.call(this);

    var self = this;

    // Handle location information.
    this.addInputHandler('location', function () {
        var location = this.get('location');
        if (location) {
            // The key from https://developers.google.com/maps/documentation/geocoding/intro
            var key = '';

            // See the accessor comment for how to get the key.
            var keyFile = '$KEYSTORE/geoCoderKey';
            try {
                key = getResource(keyFile, 1000).trim();
            } catch (e) {
                console.log('GeoCoder.js: Could not get ' + keyFile + ":  " + e +
                            '\nThe key is not public, so this accessor is only useful ' +
                            'If you have the key.  See ' +
                            'https://www.icyphy.org/accessors/library/index.html?accessor=services.GeoCoder');
                key = 'ThisIsNotAPipeNorIsItAWorkingKeySeeTheReverseGeoCoderAccessorDocs';
            }

            // console.log('GeoCoder: address: ' + address + ' key: ' + key);

            // arguments is a reserved word, so we use args.
            var args = {
                'latlng': location.latitude + ',' + location.longitude,
                'key': key
            };

            //Set a filter for the reverse geocoding request based on the accuracy of the
            //location object. Default to no filter if accuracy is not specified or set to high.
            //The list of results from google is ordered by accuracy. 
            if(location.accuracy && location.accuracy == "low"){
                args.result_type = "locality";
                //according to the google API https://developers.google.com/maps/documentation/geocoding/intro#Types
                //"locality indicates an incorporated city or town political entity."
                //I need to do more experimenting, but it seems ip based location is accurate
                //up to this level but no further. 

            }
            self.send('arguments', args);
            self.send('trigger', true);
        } else {
            throw 'ReverseGeoCoder: No location.';
        }
    });
};


/** Filter the response, extracting the addresses 
 */
exports.filterResponse = function (response) {
    if (response) {
        // Note that for some hosts, the response is a string, needing to parsed,
        // and for some, its already been parsed.
        var parsed = response;
        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(response);
            } catch (err) {
                error('ReverseGeoCoder: Unable to parse response: ' + err.message +
                    '\nResponse was: ' + response);
                // So that downstream actors don't just a previous location, send null.
                this.send('address', null);
            }
        }
        // NOTE: All of the following should be replaced with a generic
        // schema transformation utility.
        // FIXME: Just taking the first result if there are multiple matches.
        if (parsed.results &&
            parsed.results[0] &&
            parsed.results[0].formatted_address)  {
            this.send('address', parsed.results[0].formatted_address);
        } else {
            error('ReverseGeoCoder: No matching address.');
            // So that downstream actors don't just a previous location, send null.
            this.send('address', null);
        }
    }
    return response;
};
