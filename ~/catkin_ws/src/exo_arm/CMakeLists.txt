cmake_minimum_required(VERSION 3.0.2)
project(exo_arm)

find_package(catkin REQUIRED COMPONENTS
  rospy
  std_msgs
  rosbridge_server
)

catkin_package(
  CATKIN_DEPENDS rospy std_msgs rosbridge_server
)

include_directories(
  ${catkin_INCLUDE_DIRS}
)

catkin_install_python(PROGRAMS
  scripts/ros_arm_bridge.py
  DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)

install(DIRECTORY launch/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/launch
  FILES_MATCHING PATTERN "*.launch"
) 