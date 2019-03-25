//Helper function for debugging this file.
// log = function(txt) {
//     var x = document.getElementById("log");
//     if (txt) {
//         x.innerHTML += "<br/>" + "\> "  + txt;
//     }
// };

var topLevel;

var app = {
    // Register an event handler that is invoked when the device is ready.
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("pause", this.onPause.bind(this), false);
        document.addEventListener("resume", this.onResume.bind(this), false);
    },

    // Start swarmlet when the device is ready.
    onDeviceReady: function() {

        topLevel = instantiateAccessor('MyTopLevel', 'Swarmlet', getAccessorCode);
        topLevel.initialize();
        this.updateStatus('Executing');
    },

    onPause: function(){
        //FIXME: should save state here.
        //Whenever an android activity is paused, the OS might destroy it
        //if the OS is low on memory.
        //https://cordova.apache.org/docs/en/latest/guide/platforms/android/#lifecycle-guide 
        topLevel.wrapup();
    },

    onResume: function(){
        //FIXME: should load state here
        
        //It's possible for onResume to follow onDeviceReady or also
        //onPause (where it might have been destroyed).
        //So first check if the swarmlet has already been initialized.
        if(! topLevel.isInitialized()){
            topLevel.initialize();
        }
    },

    // Update Status
    updateStatus: function(id) {
        document.getElementById('status').querySelector(".msg").innerHTML = id;
    }
};

app.initialize();
