DEV=${1-/dev/ttyUSB0}
echo Using $DEV
stty -F $DEV 115200 raw 
stty -a -F $DEV
echo -e "\nRobot.DebugEnable\n" > $DEV
