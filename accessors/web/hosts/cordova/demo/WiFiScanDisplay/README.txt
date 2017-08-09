This demo has several signficiant quirks.

First, it is only compatible with the Android platform because it uses Android specific plugins
com.pylonproducts.wifiwizard and cordova-plugin-android-permissions. It is much harder to do
WiFi scanning on iOS.

Second, after running $ ant build as in the generic execution instructions:

$cordova plugin add wifiwizard

This change is reflected in the instructions below

Most plugins will automatially add themselves from src/config.xml but only if they are available
through npm. wifiwizard is not available through npm.

Third, this demo generates an android permission request for location services. The demo will
fail if you reject this request.

Fourth, you must have both WiFi and Location enabled on your phone. Otherwise, it will be impossible to complete the scans.

To build:

$ ant build
$ cordova plugin add wifiwizard

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
