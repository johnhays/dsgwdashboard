# Configuration and Management

I have localized all of the configuration files in **/usr/local/etc**:

**dashboard.ini**  - configuration for the dashboard (with some values also take from dstargateway.cfg)<br/>
**dgwremotecontrol.cfg**  - configure remote control port and password<br/>
**dgwtimeserver.cfg** - this controls time announcements and other parameters<br/>
**dstargateway.cfg** - configure the gateway itself<br/>

The program **systemctl** is how your manage these services (as root using sudo) there are five functions which you will typically control

**enable** - turning on automatic startup when you reboot the system<br/>
**status** - tells you the current status of the service<br/>
**start** - start up a service that is currently inactive<br/>
**stop** - stop an active service<br/>
**restart** - issues a stop followed by a start<br/>
**disable** - turning off automatic startup when reboot<br/>

for example:

 **sudo systemctl status dsgwdashboard<br/>
 sudo systemctl enable dsgwdashboard<br/>
 sudo systemctl start dsgwdashboard<br/>
 sudo systemctl stop dsgwdashboard<br/>
 sudo systemctl restart dsgwdashboard<br/>
 sudo systemctl disable dsgwdashboard<br/>
<br/>
 sudo systemctl status dgwtimeserver<br/>
 sudo systemctl enable dgwtimeserver<br/>
 sudo systemctl start dgwtimeserver<br/>
 sudo systemctl stop dgwtimeserver<br/>
 sudo systemctl restart dgwtimeserver<br/>
 sudo systemctl disable dgwtimeserver**

and so forth.

To view the systemctl manual - type<br/>
**man systemctl**

Also spend some time with [DStarGateway README](https://github.com/F4FXL/DStarGateway/blob/develop/README.md) (and the README.md in each subdirectory)

# Firewall

If using [ufw](https://wiki.ubuntu.com/UncomplicatedFirewall), [dstar](dstar) rules are aavailable. 
```
cd util
sudo cp dstar /etc/ufw/applications.d
sudo ufw reload
sudo ufw status verbose
```

