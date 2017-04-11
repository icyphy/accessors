// Copyright (c) 2016 The Regents of the University of California.
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
// Author: Victor Nouvellet (victor.nouvellet@berkeley.edu)

var fs = require('fs');
var path = require('path');

Mobile('log').call("Running accessor on iOS!");

var commonHost = require('./common/commonHost');
var accessorPath = [path.join(__dirname)];
var accessors;

function getAccessorCode(name) {
    var code;
    // Append a '.js' to the name, if needed.
    if (name.indexOf('.js') !== name.length - 3) {
        name += '.js';
    }
    
    // Look for the accessor as a regular file.
    // See https://www.terraswarm.org/accessors/wiki/Main/DeploymentNotes#SSHScript
    try {
        code = fs.readFileSync(name, 'utf8');
        return code;
    } catch (error) {
        // Ignore, we will look search the accessorPath.
    }
    
    for (var i = 0; i < accessorPath.length; i++) {
        var location = path.join(accessorPath[i], name);
        try {
            code = fs.readFileSync(location, 'utf8');
            //console.log('Reading accessor at: ' + location);
            break;
        } catch (error) {
            console.log(error);
            continue;
        }
    }
    if (!code) {
        throw new Error('Accessor ' + name + ' not found on path: ' + accessorPath);
    }
    return code;
};

/** Get a resource.
 *  Below are the types of resources that are handled
 *  all other resources will cause an error.
 *
 *  * $KEYSTORE is replaced with $HOME/.ptKeystore
 *
 *  @param uri A specification for the resource.
 */
getResource = function(uri) {
    
    // We might want the Node host (and in fact all hosts) to allow access to
    // resources that are given with relative paths. By default, these would
    // get resolved relative to the location of the file defining the swarmlet.
    // This might even work in the Browser host with the same source
    // policy.
    
    // TODO: Use different sandboxed path ($KEYSTORE not defined on iOS)
    if (uri.startsWith('$KEYSTORE') === true) {
        var home = process.env.HOME;
        if (home === undefined) {
            throw new Error('Could not get $HOME from the environment to expand ' + uri);
        } else {
            uri = uri.replace('$KEYSTORE', home + path.sep + '.ptKeystore')
            code = fs.readFileSync(uri, 'utf8');
            return code
        }
    }
    throw new Error('getResource(' + uri + ', ' + timeout + ') only supports $KEYSTORE, not ' +
                    uri);
}

instantiate = function (accessorName, accessorClass, accessorCode) {
    // The instantiate() function must be defined in
    // web/hosts/nodeHost/nodeHost.js so that require() knows to look
    // in the web/hosts/nodeHost/node_modules.
    
    // FIXME: The bindings should be a bindings object where require == a requireLocal
    // function that searches first for local modules.
    var bindings = {
        'getResource': getResource,
        'require': require,
    };
    
    var instance = null;
    if (accessorCode !== undefined) {
        console.log("Accessor code defined");
        instance = new Accessor(accessorName, accessorCode, null, bindings);
    } else {
        console.log("No Accessor code defined");
        instance = commonHost.instantiateAccessor(
                                                  accessorName, accessorClass, getAccessorCode, bindings);
    }
    
    //console.log('Instantiated accessor ' + accessorName + ' with class ' + accessorClass);
    return instance;
};


instantiateAndInitialize = function (accessorNames) {
    var accessors = [];
    var length = accessorNames.length;
    for (index = 0; index < length; ++index) {
        // The name of the accessor is basename of the accessorClass.
        var accessorClass = accessorNames[index];
        // For example, if the accessorClass is
        // test/TestComposite, then the accessorName will be
        // TestComposite.
        
        var startIndex = (accessorClass.indexOf('\\') >= 0 ? accessorClass.lastIndexOf('\\') : accessorClass.lastIndexOf('/'));
        var accessorName = accessorClass.substring(startIndex);
        if (accessorName.indexOf('\\') === 0 || accessorName.indexOf('/') === 0) {
            accessorName = accessorName.substring(1);
        }
        // If the same accessorClass appears more than once in the
        // list of arguments, then use different names.
        // To replicate: node nodeHostInvoke.js test/TestComposite test/TestComposite
        if (index > 0) {
            accessorName += "_" + (index - 1);
        }
        var accessor = instantiate(accessorName, accessorClass);
        // Push the top level accessor so that we can call wrapup later.
        accessors.push(accessor);
        accessor.initialize();
    }
    return accessors;
};


stop = function () {
    console.log("nodeHost.js: stop() invoked");
    process.exit();
}

Accessor = commonHost.Accessor;

provideInput = commonHost.provideInput;
setParameter = commonHost.setParameter;

// In case this gets used a module, create an exports object.
exports = {
    'Accessor': Accessor,
    'getAccessorCode': getAccessorCode,
    'instantiate': instantiate,
    'instantiateAndInitialize': instantiateAndInitialize,
    'provideInput': commonHost.provideInput,
    'setParameter': commonHost.setParameter,
};


///////////////// Launch accessor/////////////////////////////////////////////////////

var a = null
function instantiateAccessor(accessor_code) {
    Mobile('log').call('Instantiating/initializing accessor');
    a = instantiate('accessor', null, accessor_code);
    a.initialize();
    Mobile('log').call('Input ports: ' + a.inputList);
};

function runSwarmlet(swarmletCode) {
    Mobile('log').call('Running Swarmlet');
    eval(swarmletCode);
};

// Register Instantiate method so we can call it from native side
Mobile('RunSwarmlet').register(runSwarmlet);

Mobile('InstantiateAccessor').register(instantiateAccessor);

///////////////// Launch accessor/////////////////////////////////////////////////////
