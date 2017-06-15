To build:

$ ant build

To run in the browser:

$ cordova run browser

To run in the Android simulator:

$ cordova simulate android

To refresh (without rebuilding, which is time-consuming):

$ ant refresh

IMPORTANT: 
1) Do not edit the files that are generated, they will be overwritten. Any code should go into src/*.
2) Before you check in a new demo, run:
$ ant clean
This will remove all the generated files, so you don't check in garbage.
3) If you would like to check in a new version of your project files (package.json, config.xml), run:
$ ant save

# Common issues:
## iOS
• When I try to `ant build; cordova run ios`, I get an error even if my iOS device is connected.
-> It can be a code signing issue of the app (error 65). In this case, use `open platforms/ios/<name of your app>.xcworkspace` to open the generated Xcode project. Select your project at the top of the left Project navigator panel. Then select your target in the Targes list and go to the General tab. Finally, in the Signing part of the window, choose a Team that will be used to sign the app you want to install on your iOS device. You can now try to run `ant build; cordova run ios` again.
-> The maximum number of apps for free development profiles may have been reached (error 253). You might want to delete one of the app signed with the development profile used for the project.