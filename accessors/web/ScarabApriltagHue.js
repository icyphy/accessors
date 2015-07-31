var moveResultHandle, tagDetectionsMappedHandle, tfHandle, sendToTagHandle;
var cameraCoords;
var currentTag = {id: 0};

//vars to enumerate options for sendToTag function
var current = 0;
var next = 1;

var unreachableCount = 0;

exports.setup = function() {
   input('moveResult', {type: 'JSON', value: {}});
   input('pose', {type: 'JSON', value: {}});
   input('tagDetectionsMapped', {type: 'JSON', value: {}});
   input('tf', {type: 'JSON', value: {}});//frame transforms
   output('waypoint', {type: 'JSON'});//pose msg to publish to /goal topic
   output('cancelWaypoint', {type: 'JSON'});//abort msg to publish to /move/cancel topic
   output('lightID', {type: 'int'});
   output('hue', {type: 'int'});//hue of a Hue bulb
   output('on', {type: 'boolean'});
   output('trigger');
   parameter('stopAtTagDuration', {type: 'number', value: 1000}); //time to spend at each tag before moving in ms
   parameter('robotDistanceFromTag', {type: 'number', value: 0.1}); //distance from robot to tag in m 
   parameter('goalTolerance', {type: 'number', value: 0.2}); //the tolerance in distance (m) to conclude a robot has reached a tag
   parameter('mapFrame', {type: 'string', value: 'map_hokuyo'});
   parameter('cameraFrame', {type: 'string', value: 'foscam'});
}


exports.initialize = function() {
   tfHandle = addInputHandler('tf', tfHandler);
   tagDetectionsMappedHandle = addInputHandler('tagDetectionsMapped', 
         tagDetectionsMappedHandler);
   moveResultHandle = addInputHandler('moveResult', moveResultHandler);
}
/** search transfroms for camera coords. Removes input handler after set */
function tfHandler() {
   console.log('looking for camera to  map transform');
   //check transforms for camera pose
   var transforms = get('tf').msg.transforms;
   var map_frame = getParameter('mapFrame');
   var camera_frame = getParameter('cameraFrame');
   for (var i = 0; i < transforms.length; i++) {
      if (transforms[i].header.frame_id == map_frame && 
         transforms[i].child_frame_id == camera_frame) {
         cameraCoords = {"x": transforms[i].transform.translation.x,
                         "y": transforms[i].transform.translation.y};
         console.log("set camera coords");
         //only need to set this once
         removeInputHandler(tfHandle);
      }
   }

}
/**
 Only need a handle once. sendToTag is called next by the MoveStatusHandler
*/
function tagDetectionsMappedHandler() {
   if (!cameraCoords) {
      console.log('received tag detections but not camera coords yet. Will wait.');
      return;
   }
   sendToTag(next, getParameter('robotDistanceFromTag'));
   removeInputHandler(tagDetectionsMappedHandle);
}
  
/** Checks the move status of the hfn goal/status topic. The status is 
  defined by the ROS actionlib and the ROS message at scarab_msgs/action/Move.action
  If hfn goal is reached, check that tag is really within tolerance of the robot. 
  If not, resend to robot to current tag.
*/
  
function moveResultHandler() {
   var moveResult = get('moveResult').msg;
   console.log(moveResult);
   var moveStatus = get('moveResult').msg.result.final_status;
   var goalID  = moveResult.goal_id;//id of goal
   var finalStatus = moveResult.result.final_status//integer reporting status
   var robotDistanceFromTag = getParameter('robotDistanceFromTag');
   //moveStatus mapping: 0=FINISHED, 1=TIMEOUT, 2=STUCK, 3=NOTREADY, 4=UNREACHABLE
   if (moveStatus == 0) {
   //success
      flashLight(currentTag.id);
      unreachableCount = 0;
      sendToTag(next);
      sendToTagHandle = setTimeout(sendToTag, getParameter('stopAtTagDuration'), next, robotDistanceFromTag);
      console.log('robot reached waypoint successfully. sending to next tag');
   } else if (finalStatus == 4) {
   //waypoint is unreachable. tag localization may not be accurate, resulting in a tag location deep in occupied space.  
   //abort current waypoint and send new one with increased distance between waypoint and tag
      cancelWaypoint();
      unreachableCount++;
      sendToTag(current, unreachableCount * robotDistanceFromTag);
      console.log('waypoint cannot be reached. sending new one with increased distance betweeen waypoint and tag');
    } else {
     //problem encountered. abort previous goals and  send to current tag again. 
      cancelWaypoint();
      sendToTag(current, robotDistanceFromTag);
      console.log('robot is either stuck, not ready or too slow. sending waypoint again');
   }
}

/** Utility functions to flash lights */
function flashLight(id) {
   send('lightID', id);
   send('hue', 62580 * id/3);
   send('on', true);
   send('trigger', true);
   setTimeout(offLight, 2000, id);
}

function offLight(id) {
   send('lightID', id);
   send('on', false);
   send('trigger', true);
}

   
/** Assume currentTag is still in the frame and get nextTag by ascending ID.
    If stayOnCurrentTag is defined and true, nextTag is the current tag.
    If can't get currentTag, set nextTag to the first tag. 
    Send to nextTag's position. 
    tag0 is on the robot. 
*/ 
function sendToTag(currentOrNext, distanceFromTag) {
   var input = get('tagDetectionsMapped');  
   console.log(input);
   if (!input.msg) {
      console.log('No detections received yet. Will check again');
      setTimeout('sendToTag', 1000);
      return;
   }
   if (!cameraCoords) {
      console.log('No camera coords yet.  Will check again');
      setTimeout('sendToTag', 1000);
      return;
   }

   var detections = input.msg.detections;
   detections.sort(function(a, b) {return a.id > b.id});
   console.log('got detections');

   for (var i = 0; i < detections.length; i++) {
      if (detections[i].id == currentTag.id) {
         if (currentOrNext == current) { 
            currentTag = detections[i];
         } else {
            currentTag = detections[(i+1) % detections.length];
         }
         break;
      }
      //current tag no longer exists. set to tag with smallest id.
      //don't send to tag0 (on the robot)
      if (i == detections.length - 1) {
         currentTag = detections[1];
      }
   } 
   //tag frame: facing tag, x->right, y->up, z->toward you
   //robot frame: facing robot, x->toward you, y->right, z->up
   //send robot to face tag with separation specified by parameter, in the line from the camera to the tag
   //format data accoding to ROS pose datatype, (cartesian position and quaternion orientation)
   tagX = currentTag.pose.pose.position.x;
   tagY = currentTag.pose.pose.position.y;
   cameraX = cameraCoords.x;
   cameraY = cameraCoords.y;

   //get unit vector of direction from tag to camera
   deltaX = cameraX - tagX;
   deltaY = cameraY - tagY;
   deltaLength = distance(deltaX, 0, deltaY, 0);

   theta = Math.atan2(deltaY, deltaX) + Math.PI;

   goal = {
      pose: {
         position: {
            x: tagX + (distanceFromTag * deltaX / deltaLength), 
            y: tagY + (distanceFromTag * deltaY / deltaLength),
            z: 0
         },
         orientation: {
            x: 0,
            y: 0,
            z: Math.sin(0.5*theta),  
            w: Math.cos(0.5*theta)
         }
      }
   }
   console.log('waypoint sent to tag ' + currentTag.id);
   send('waypoint', goal); 

}

function cancelWaypoint() {
   //blank info aborts all goals for all time. This is fine, since we only send one goal at a time.
   msg = {
      stamp: {
         secs: 0,
         nsecs: 0
      },
      id: ''
   }
   send('cancelWaypoint', msg);
}

exports.wrapup = function() {
   //abort all goals
   cancelWaypoint();
   //remove input handlers
   if (moveResultHandle) {
     removeInputHandler(moveResultHandle);
   } 
   if (tagDetectionsMappedHandle) {
     removeInputHandler(tagDetectionsMappedHandle);
   } 
   if (tfHandle) {
     removeInputHandler(tfHandle);
   } 
   if (sendToTagHandle) {
     removeInputHandler(sendToTagHandle);
   } 
}

/** utlity function to return distance between two points */
function distance(x1, x2, y1, y2) {
   return Math.sqrt(
      Math.pow(x2 - x1, 2) + Math.pow(y2 -y1, 2)
   );
}
