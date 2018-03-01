import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.uriio.beacons.Beacons;
import com.uriio.beacons.model.Beacon;
import com.uriio.beacons.model.EddystoneURL;

import java.util.HashMap;
import java.util.Map;

/**
 * This class echoes a string called from JavaScript.
 */
public class BLEAdvertise extends CordovaPlugin {

    private HashMap<Integer, Beacon> activeBeacons = new HashMap<Integer, Beacon>();
    private int counter = 0;

    @Override
    public boolean execute(String action, JSONArray args, 
        CallbackContext callbackContext) throws JSONException {
        if (action == "initialize") {
            this.initialize();
        }
        else if (action == "startEddystoneURLBeacon") {
            String url = args.getString(0);
            this.startEddystoneURLBeacon(url, callbackContext);
        } else {
            throw new IllegalArgumentException("No such method: " + action);
        }
        
        // FIXME: example code, remove.
        if (action.equals("coolMethod")) {
            String message = args.getString(0);
            this.coolMethod(message, callbackContext);
            return true;
        }
        return false;
    }

    private void coolMethod(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            callbackContext.success(message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

    /**
     * Initialize the BLE beacon advertising library.
     */
    private void initialize() {
        if (!Beacons.isInitialized()) {
            Beacons.initialize(this.cordova.getActivity().getApplicationContext());
        }
    }

    /**
     * Initialize the BLE beacon advertising library.
     */
    private void startEddystoneURLBeacon(String url, CallbackContext callbackContext) {
        // FIXME: perhaps just do initialize here, and remove it from the interface.
        Beacon beacon = new EddystoneURL(url);
        int handle = this.counter++;
        this.activeBeacons.put(handle, beacon);
        if (beacon.start()) {
            callbackContext.success(handle);    
        } else {
            callbackContext.success("Unable to start advertisement.");
        }
        
    }

    /**
     * Stop advertisement of particular beacon.
     */
    private void stop(String handle, CallbackContext callbackContext) {
        Beacon beacon = this.activeBeacons.get(handle);
        if (beacon != null) {
            beacon.stop();
            this.activeBeacons.remove(handle);
        } else {
            callbackContext.error("No beacon associated with handle: " + handle);
        }
    }

    /**
     * Stop advertisement of all beacons.
     */
    private void stop(CallbackContext callbackContext) {
        for (Map.Entry<Integer, Beacon> entry : this.activeBeacons.entrySet()) {
            entry.getValue().stop();
        }
    }
}
