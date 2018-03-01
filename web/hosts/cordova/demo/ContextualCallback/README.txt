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
