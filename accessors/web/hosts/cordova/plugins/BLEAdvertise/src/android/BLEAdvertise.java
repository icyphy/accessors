package cordova-plugin-ble-advertise;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.uriio.beacons.Beacons;
import java.util.HashMap;



/**
 * This class echoes a string called from JavaScript.
 */
public class BLEAdvertise extends CordovaPlugin {

    private HashMap<Integer, Beacon> activeBeacons = new HashMap<Integer, Beacon>();
    private counter = 0;

    @Override
    public boolean execute(String action, JSONArray args, 
        CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "initialize":
                this.initialize();
                break;
            case "startEddystoneURLBeacon":
                String url = args.getString(0);
                this.startEddystoneURLBeacon();
                break;
            default:
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
        // Don't initialize twice.
        try {
            Beacons.getInstance();
        } catch(RuntimeException e) {
            Beacons.initialize(this);    
        }
    }

     /**
     * Initialize the BLE beacon advertising library.
     */
    private void startEddystoneURLBeacon(String url, CallbackContext callbackContext) {
        // FIXME: perhaps just do initialize here, and remove it from the interface.
        Beacon beacon = new EddystoneURL(url).start();
        int handle = this.counter++;
        this.activeBeacons.add(handle, beacon);
        callbackContext.success(handle);
    }
}
