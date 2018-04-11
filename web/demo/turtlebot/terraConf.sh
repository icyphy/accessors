#! /bin/bash -x
source /opt/ros/kinetic/setup.bash
source ~/catkin_ws/devel/setup.bash
export ROS_MASTER_URI=http://192.168.1.201:11311
export ROS_HOSTNAME=192.168.1.201
export TURTLEBOT3_MODEL=waffle
#export ROSCONSOLE_STDOUT_LINE_BUFFERED=1
echo `date`
echo $PATH
env
# Sleep because at reboot, we don't have network connectivity.
sleep 10
rightIP=`ifconfig | grep "192.168.1.201"`
if [ ! -z "$rightIP" ]; then
    echo "then" >> /home/lutz/cronWorks2.txt  
    /opt/ros/kinetic/bin/roscore > /home/lutz/roscore2.txt  &
    sleep 5
    /opt/ros/kinetic/bin/roslaunch turtlebot3_bringup turtlebot3_robot.launch  > /home/lutz/bringup2.txt &
    sleep 5
    /opt/ros/kinetic/bin/roslaunch rosbridge_server rosbridge_websocket.launch > /home/lutz/rosbridge2.txt &
    sleep 5
    /opt/ros/kinetic/bin/roslaunch turtlebot3_finite turtlebot3_finite.launch > /home/lutz/finite2.txt &
else
    echo "ifconfig did not find 192.168.1.201, so we are not starting up the Accessors demo." >> /home/lutz/cronWorks2.txt    
    echo "`ifconfig`" >> /home/lutz/cronWorks2.txt
fi

