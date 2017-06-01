
var app = {
    // Register an event handler that is invoked when the device is ready.
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // Start swarmlet when the device is ready.
    onDeviceReady: function() {
        var topLevel = instantiateAccessor('MyTopLevel', 'Sesame', getAccessorCode);
        topLevel.initialize();
        this.updateStatus('Executing'); // FIXME: handle wrap up
    },

    // Update Status
    updateStatus: function(id) {
        document.getElementById('status').querySelector(".msg").innerHTML = id;
    }
};

app.initialize();
