

I have localized all of the configuration files in **/usr/local/etc:

**dashboard.ini**  - configuration for the dashboard (with some values also take from dstargateway.cfg)
**dgwremotecontrol.cfg**  - configure remote control port and password
**dgwtimeserver.cfg** - this controls time announcements and other parameters
**dstargateway.cfg** - configure the gateway itself**

The program **systemctl** is how your manage these services (as root using sudo) there are five functions which you will typically control

**enable** - turning on automatic startup when you reboot the system
**status** - tells you the current status of the service
**start** - start up a service that is currently inactive
**stop** - stop an active service
**restart** - issues a stop followed by a start
**disable** - turning off automatic startup when reboot

for example:
 **sudo systemctl status dsgwdashboard
 sudo systemctl enable dsgwdashboard
 sudo systemctl start dsgwdashboard
 sudo systemctl stop dsgwdashboard
 sudo systemctl restart dsgwdashboard
 sudo systemctl disable dsgwdashboard**

 sudo systemctl status dgwtimeserver
 **sudo systemctl enable dgwtimeserver
 sudo systemctl start dgwtimeserver
 sudo systemctl stop dgwtimeserver
 sudo systemctl restart dgwtimeserver
 sudo systemctl disable dgwtimeserver**

and so forth.

To view the systemctl manual - type
**man systemctl**

Also spend some time with https://github.com/F4FXL/DStarGateway/README.md (and the README.md in each subdirectory)
