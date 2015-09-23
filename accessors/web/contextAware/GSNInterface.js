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

/** This is the interface specification of a global sensor network service (GSN)
 *  
 * 
 *  @accessor contextAware
 *  @author Anne H. Ngu (angu@btxstate.edu)
 *  @parameter {string} ipAddress is the host url
 *  @parameter {port} port is the port of host url
 *  @parameter {string} username is the login account name for the service
 *  @parameter {string} password  is the password for the login account
 *  @version $$Id$$ 
 */

exports.setup = function () {
    parameter('ipAddress', {'type': 'string', 'value': 'http://localhost'});
    parameter('port', {'type': 'string', 'value': '80'});
    parameter('username', {'type': 'string', 'value': 'admin'});
    parameter('password', {'type': 'string', 'value': ''});
}
