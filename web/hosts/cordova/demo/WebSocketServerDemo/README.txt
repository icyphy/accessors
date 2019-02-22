This demo starts a web server on the phone, which will respond to all messages by echoing it back.

Unless your phone has a fixed IP address, you must connect to your phone on the same network and determine it’s current IP address. To determine what your (android) phone’s IP address is while it’s connected to your computer via USB, run

$adb shell ifconfig

When the app starts, it is arbitrarily assigned a free port. This is printed to the phone’s console.

With the port and IP address information you can test the web socket server by connecting to it via a shell command like

$wscat -c <IP Address>:<Port>

According to plugin documentation at https://github.com/becvert/cordova-plugin-websocket-server, “This is not a background service. When the cordova view is destroyed/terminated, the server is stopped.”

The web server plugin will not work in the browser, so I don’t recommend running it that way.


To build:

$ ant build

To run in the browser:

$ cordova run browser

To run in the Android simulator:

$ cordova emulate android

To refresh (without rebuilding, which is time-consuming):

$ ant refresh

IMPORTANT: 
1) Do not edit the files that are generated, they will be overwritten. Any code should go into src/*.
2) Before you check in a new demo, run:
$ ant clean
This will remove all the generated files, so you don't check in garbage.
3) If you would like to check in a new version of your project files (package.json, config.xml), run:
$ ant save
