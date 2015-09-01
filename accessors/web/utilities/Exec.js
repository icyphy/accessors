
/** Exec starts a shell command and connects to the process' stdin and stdout.
 * This accessor implements an interface to the shell of the host. It takes a
 * command and starts it as a process. It connects the process' stdin and 
 * stdout to the accessor ports with the same name.
 * FIXME: Provide a selection of shells (e.g., bash, awk, etc)
 *
 *  @accessor util/Exec
 *  @author Armin Wasicek (arminw@berkeley.edu)
 *  @input {string} stdin The stdin of the executing process. A token received on this
 *        port is interpreted as a line entered in stdin of the process.
 *  @output {string} stdout The stdout of the executing process. Each line read from the 
 *        executing process is sent out as a token from this port.
 *  @parameter {string} command The command to be executed.
 *  @version $$Id$$
 */

// This accessor requires the 'shell' module, which may or may
// not be provided by an accessor host. As this is a very powerful 
// module, not all host may provide this module for security reasons.
var shell = require('shell/shell');

/** Global object to the shell module provided by the host. */
var sh = null;

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
	input('stdin', {
		'type': 'string'
	});
	output('stdout', {
		'type': 'string'
	});
    input('command', {
        'value': 'ls',
        'type':'string'
    });
}

/** Initialize the accessor and start the process subsequently.
 */
exports.initialize = function() {	
	sh = new shell.Shell({'cmd' : get('command')});
	
	addInputHandler('stdin', function() {
	    var data = get('stdin');
	    if (data) {
		  sh.write(data);
	    }
	});

	sh.on('message', function(data) {
		if(data)  {
			send('stdout', data.toString());
		}		
	});

	sh.start();
}
	
/** Wrap up the execution of the accessor by stopping the process.
 */
exports.wrapup = function() {
	if(sh)  {
		sh.wrapup();
	}
}
