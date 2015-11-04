// Copyright (c) 2015 The Regents of the University of California.
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

/**
 * This accessor collects map data from its input and aggregates
 * the results in a map repository in local memory. 
 * When it receives a trigger input it sends the contents of its 
 * repository on its output port. When it receives a 
 * clear input it empties its repository.
 * 
 * @accessor localization/mapRepo
 * 
 * @input report Input that triggers a report of the map repo contents.
 * @input clear Input that triggers a reset of the repository's data.
 * @input {JSON} mapData MapSchema structured map data.
 * @output {JSON} repoData MapSchema structured map data from the repository.
 * 
 * @author Matt Weber
 */

mapManager = require("mapManager");

var reportHandle = null;
var clearHandle = null;
var mapDataHandle = null;

exports.setup = function(){
	input('report');
	input('clear');
	input('mapData', {'type' : 'JSON'});
	output('repoData', {'type' : 'JSON'} );
};

exports.initialize = function(){
	reportHandle = addInputHandler('report', this.reportInputHandler); 
	clearHandle = addInputHandler('clearHandle', this.clearInputHandler);
	mapDataHandle = addInputHandler('mapData', this.mapDataInputHandler);
};


exports.reportInputHandler = function(){
	send("repoData", mapManager.localRepoToJSONString());
};


exports.clearInputHandler = function(){
	mapManager.clearRepo();
};

//Todo: What happens if mapData comes the same time as a clearRepo signal?
exports.mapDataInputHandler = function(){
	mapManager.replaceRepo(get("mapData"));
};



exports.wrapup = function(){
	if(reportHandle !==null){
		removeInputHandler(reportHandle);
		reportHandle = null;
	}
	if(clearHandle !==null){
		removeInputHandler(clearHandle);
		clearHandle = null;
	}
	if(mapDataHandle !==null){
		removeInputHandler(mapDataHandle);
		mapDataHandle = null;
	}
}