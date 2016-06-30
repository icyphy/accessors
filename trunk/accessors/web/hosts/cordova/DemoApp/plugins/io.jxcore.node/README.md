[Node.JS](https://nodejs.org) plugin for Apache Cordova (built on [JXcore](https://github.com/jxcore/jxcore))

# Goals
This project is intended to ;
 - create an easy to use node.js plugin for Apache Cordova (Android, iOS)
 - show JXcore's embedding interface in details.

# Installation

Below are the steps to be taken if you want to update JXcore binaries in your Cordova JXcore 
application. They all should be called prior to `cordova plugin add` command. This step is 
optional. We keep the core binaries are updated. 

1. [Rebuild JXcore binaries](https://github.com/jxcore/jxcore/blob/master/doc/Android_Compile.md) as a static library by embedding leveldown:

    ```bash
    $ git clone https://github.com/jxcore/jxcore.git
    $ cd jxcore
    $ build_scripts/android-configure.sh /path/to/android/ndk/
    $ build_scripts/android_compile.sh /path/to/android/ndk/ --embed-leveldown
    ```

2. Refresh `jxcore-cordova/src/android/jxcore-binaries` folder contents:

    ```bash
    $ cd /my/cordova/app
    $ git clone https://github.com/jxcore/jxcore-cordova.git
    $ rm -f ./jxcore-cordova/src/android/jxcore-binaries/*
    $ cp -f /jxcore/repo/out_android/android/bin/* jxcore-cordova/src/android/jxcore-binaries/
    ```

3. Recompile .so files

    ```bash
    $ cd jxcore-cordova/src/android/jni
    $ ~/android-ndk-path/ndk-build
    ```

4. Add/re-add the plugin/platform

    ```bash
    $ cd ../../../../
    $ cordova plugin add jxcore-cordova/
    $ cordova platforms add android
    ```

5. You may run the app now

    ```bash
    $ cordova run
    ```

# Usage

**JavaScript on UI side works on top of Cordova's webUI. JXcore's JavaScript is a separate instance.**

So you need an API to communicate between Cordova JS to JXcore JS.

#### Cordova to JXcore
These API methods are used on the side of Apache Cordova (for example, in the main `index.html` 
of your Cordova application).

##### Sharing a JavaScript function from Cordova to JXcore
```js
jxcore(name_of_the_function).register(a_function_to_register);
```
Example:
```js
jxcore('alert').register(function(msg){ alert(msg); });
```

##### Calling a JavaScript function (shared on JXcore side) from Cordova
```js
jxcore(name_of_the_function).call(params_to_send..., callback);
```
Example:
```js
jxcore('asyncPing').call('Hello', function(p1, p2, p3...){ });
```

#### JXcore to Cordova
These API methods are used on the side of JXcore (for example, in the main `app.js` of your 
application based on Node API).

##### Sharing a synchronous JavaScript function from JXcore to Cordova
```js
Mobile(name_of_the_function).registerSync(a_function_to_register);
```
This method expects the registered function to be synchronous (i.e. to immediately return a value). 

Example:
```js
Mobile('syncPing').registerSync(function(msg){ return msg + ' pong'; });
```

##### Sharing an asynchronous JavaScript function from JXcore to Cordova
```js
Mobile(name_of_the_function).registerAsync(a_function_to_register);
```
This method expects the registered function to be asynchronous (i.e. to return some value using a callback). 

Example:
```js
Mobile('asyncPing').registerAsync(function(msg, callback){ callback(msg + ' pong') });
```

##### Calling a JavaScript function (shared on Cordova side) from JXcore

```js
Mobile(name_of_the_function).call(params...);
```
Example:
```js
Mobile('log').call(msg);
```

#### JXcore to JAVA / Objective-C (vice versa)
You may also define JXcore JS side methods those you want to call from Java / Obj-C.

If you need a JS side method that you want to call multiple times use below approach instead 
depending on a method callback id.

#### How to Install Node Modules
Visit www/jxcore folder and install the node modules there. It's adviced to use 'jx install' 
command to install node modules from npm.

For example
```bash
// UNIX
www/jxcore > sudo jx install jxm --autoremove "*.gz" 

// Windows
www/jxcore > jx install jxm --autoremove "*.gz"
```

'--autoremove "*.gz"' will be removing the gz files from modules folder. Android APK doesn't 
allow you to put .gz files into application's assets.

#### Where To Save your Files (Write access on mobile targets) EROFS error ?
Consider using either `process.userPath` or `require('os').tmpdir()` to get the Documents 
(on ios) or a folder you have the write access. `process.cwd()` or `__dirname` may not 
target a folder that you have the write access!

If you are okay with using Mobile specific API see Mobile.GetDocumentsPath below;

#### Mobile.getDocumentsPath
Returns the location for Application (specific) writable folder.

```js
Mobile.getDocumentsPath(function(err, location) {
  if (err)
    console.error("Error", err);
  else
    console.log("Documents location", location);
});
```

Android and iOS file systems behave differently. Android OS supports external persistent 
storage. If you want to store a persistent information on Android OS, consider using sdcard 
location.

#### Mobile.getConnectionStatus
Returns device's connection status

```js
Mobile.getConnectionStatus(function(err, status) {
  if (status.NotConnected)
    console.log("No internet connection");
  else if (status.WiFi)
    console.log("WiFi");
  else if (status.WWAN)
    console.log("Mobile Connection");
});
```

#### Mobile.getDeviceName
Returns device's manufacturer and model name

```js
Mobile.getDeviceName(function(err, name) {
  if (err)
    console.error("Something bad has happened");
  else 
    console.log("Device name", name)
});
```

#### JXcore side events

* pause

Occurs whenever an application is paused on the device (e.g. goes to the background).

```js
process.on('pause', function() {
  console.log('pause');
});
```

* resume

Occurs whenever an application will start interacting with the user (e.g. comes back from the background).

```js
process.on('resume', function() {
  console.log('resume');
});
```

* connectionStatusChanged(status)

Occurs whenever network connection status has been changed on mobile device (e.g. WiFi has been turned on or Plane Mode has been enabled).

The `status` is a string containing one of the following: `WiFi`, `WWAN`, `NotConnected`.
See also [Mobile.getConnectionStatus](#mobilegetconnectionstatus).

```js
process.on('connectionStatusChanged', function(status) {
  console.log('new network status:', status);
});
```

#### JS Error Tracking
If you want to customize JS side errors, visit `JXMobile.java` for Android and `JXMobile.m` 
for iOS and update `OnError` behavior

#### Remarks
  - JXcore cordova interface doesn't keep the reference for a callback id once it's used.
  - JavaScript is a single threaded language. Don't call the referenced JS methods from 
  other threads. 

```js
  Mobile('fromJXcore').registerToNative(function(param1, param2){
    // this method is reachable from Java or ObjectiveC
    // OBJ-C : [JXcore callEventCallback:@"fromJXcore" withParams:arr_parms];
    // Java  : jxcore.CallJSMethod("fromJXcore", arr_params);
  });
```

See JXcoreExtension.java / JXcoreExtension.m / .h for sample Java/Obj-C definitions.

# Contribution
If you see a mistake / bug or you think there is a better way to do the things, feel free 
to contribute. All the contributions are considered under MIT license.
