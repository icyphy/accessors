This directory contains an implementation of a Node.js swarmlet host.
Prerequisite modules that must be installed in Node using npm:
 * fs: file system access

Start node, requiring the host.js file:

> node -e testNodeHost.js

You will receive a reply "undefined", which is normal.

Set a search path for accessors:

> host.setAccessorSearchPath('

Comments and suggestions to eal@eecs.berkeley.edu.