
var app = {
    // Register an event handler that is invoked when the device is ready.
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        console.log("hi from initialize");
    },

    // Start swarmlet when the device is ready.
    onDeviceReady: function() {
        var topLevel = instantiateAccessor('MyTopLevel', 'Swarmlet', getAccessorCode);
        topLevel.initialize();
        this.updateStatus('Executing'); // FIXME: handle wrap up
        console.log("hi from onDeviceReady");
        document.getElementById('root').innerHTML += "hello world! via root selection"
    },

    // Update Status
    updateStatus: function(id) {
        document.getElementById('status').querySelector(".msg").innerHTML = id;
    }
};

app.initialize();
