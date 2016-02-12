# Robotics Accessors

## Scarab

Note: the IP addresses below are from the Scarab setup in DOP center.

### Architecture

    +----------+             +-----------+      +---------+       +--------+
    |          |  websocket  |           |      |         |       |        |
    | Accessor |<----------->| RosBridge |<---->| roscore |<----->| Scarab |
    |          |  port:9090  |           |      |         |       |        |
    +----------+             +-----------+      +---------+       +--------+

                             ------------------------------     -------------
                                ROS_MASTER 192.168.0.111        192.168.0.103

### Instructions

#### Swarmbox

Configure `ROS_IP` and `ROS_MASTER_URI` (see more at
[ROS Documentation](http://wiki.ros.org/ROS/EnvironmentVariables)).

For example, the Swarmbox has IP address 192.168.0.111.

```
$ export ROS_IP=192.168.0.111
$ export ROS_MASTER_URI=http://192.168.0.111:11311
```


Run `roscore` and `rosbridge`.

```
$ roscore
$ roslaunch rosbridge_server rosbridge_websocket.launch
```

#### Scarab

1. Power it up and turn on all switches (especially the RoboClaw switch).
2. ssh to it with username `terraswarm` with password.
3. Launch the robot tasks.
```
roslaunch scarab dop.launch robot:=lucy map_file:=dop.yaml
```

The `scarab` code on the robot is in sync with
[the repository](https://github.com/nebgnahz/scarab/tree/dop). More instructions
on setting up the robot are available on the accessor wiki:
[configuring the scarab robot](https://www.terraswarm.org/accessors/wiki/Main/ConfiguringTheScarabRobot).
