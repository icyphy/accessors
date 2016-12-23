// Interactive shell for Node.js swarmlet host.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Instantiate a Node.js host and start an interactive shell using stdin
 *  and stdout to execute commands. To start this shell, on a command line, do
 *  
 *    node nodeHostShell.js
 *
 *  This shell may be started from any directory as long as the path to
 *  to this nodeHostShell.js file is provided.
 *  
 *  See <a href="https://www.terraswarm.org/accessors/wiki/Main/NodeHost">Node Host wiki page</a>.
 *
 *  @author Edward A. Lee, Chris Shaver, Christopher Brooks
 *  @version $$Id$$
 */
// __dirname is the path of the directory in which this file is defined.
var nodeHost = require(__dirname + '/nodeHost.js');

// Invoke startHost on nodeHost so that that the context of execution (this) is nodeHost.
var shell = nodeHost.startHostShell();
