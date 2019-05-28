Author: Matt Weber (matt.weber@berkeley.edu) 1/4/19

This directory contains a React project for building a user interface. The same files are used to build a browser project and a cordova project. Build the browser project via $webpack --config browserWebpack.config.js and the cordova project via $webpack --config cordovaWebpack.config.js

There are also  several other non-React files used for testing the interface and interacting with it. These other files include:

-dashboard/src/graphElement.jsx, odometerElement.jsx, parkingElement, restaurantElement.js, speedometer.jsx, and video.jsx. These are all web components (built with React but separate from the main project). Compile them into component bundles with the command $webpack —entry <componentName.jsx> —output <bundleName.js>.
-dashboard/componentSender.xml, a Cape Code swarmlet that runs a websocket server for the user interface to interact with
-dashboard/dist/index.html, the main React project is compiled into a bundle.js file which has to be loaded by something. This is it, and I'm listing it here because this file isn't built by the main React project.
-dashboard/dist/lib, this directory contains other webcomponent libraries used by the main React project. For now, relevant files are loaded by dist/index.html.

The main React template used here is a fork of CreativeTim black-dashboard-react from https://github.com/creativetimofficial/black-dashboard-react/tree/master/src. This template is available under the MIT License.

Most of the changes to the main template so far have been made within dashboard/src/views/Dashboard.jsx


How to build and run the user interface:
1)From dashboard directory run $npm install. It will take a while to download the 500mb of modules needed for this project.
2)From dashboard directory run $webpack. This will essentially compile the main react project into dist/bundle.js file and other associated media files in the dist directory (note, this doesn't include dasbhoard/dist/index.html or dasbhoard/dist/lib). Also, if you change anything in the main React project, but sure to rerun $webpack to compile the changes into the new version.
3)Start a webserver in dashboard/dist. I use this simple web server (https://www.npmjs.com/package/local-web-server, you can install it with $npm i local-web-server and run it with the command $ws
4)Start the websocket server in dashboard/componentSender.xml. If the server isn't running before the app starts you'll get an error in the app.
5)Open http://127.0.0.1:8000/ in a browser, I used chrome, (assuming you used the default port 8000 for ws above). Note, you will be redirected to http://127.0.0.1:8000/admin/dashboard when the page loads, but to refresh it you will have to go back to http://127.0.0.1:8000/

How to run the user interface when everything is already built:
1)Start the webserver in dashboard/dist (step 3 above).
2)Start the websocket server (step 4 above).
3)Go to http://127.0.0.1:8000/ in chrome

How to build a React webcomponent and send it to the user interface app:
1)Write a custom webcomponent using React and put it in the dashboard/src directory. Take dashboard/src/graphElement.jsx as an example.
2)From dashboard directory run $webpack --entry parkingElement.jsx  --output parkingBundle.js --config browserWebpack.config.js. (or replace browserWebpack.config.js with cordovWebpack.config.js as desired.)
3)Escape the text of graphElementBundle.js. I've been doing this (inefficiently) by opening it in a text editor and copying the text to https://www.freeformatter.com/javascript-escape.html.
4)Take the text string and separate it into two parts around the name of the webcomponent. You can find it by doing a ctrl-f on the name, because it will only appear it once in the escaped  graphElementBundle.js. The User Interface has to be able to give the component a name of its choosing.
5)On the swarmlet managing the websocket server, write a script that waits until the server has received a JSON message from the interface app with these attributes
        "id" : "system",
        "msg" : "dashboard"
Then send a JSON message to the interface with these attributes
        id: "system",
        component: <webComponentWith ‘__componentName__’ written as its name,
Note that in cape code at least you'll have to first wrap this JSON inside the message attributes of an object
        socketID: <CorrectResponseSocketGoesHere, likely 0>,
        message: <MessageFromAboveGoesHere>
and send it to the WebsocketSever accessor as a string via JSON.stringify().
6)A custom webcomponent is allowed (encouraged) to open its own websocket back to the websocket server when it's instantiated in the user interface. If you write it to do this, make sure your websocket server swarmlet is prepared to interact with it over a new websocket. And don't use the reserved "id" : "system" attribute in your communication.