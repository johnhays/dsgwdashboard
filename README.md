# dsgwdashboard 

This is a realtime Dashboard for F4FXL's [DStarGateway](https://github.com/F4FXL/DStarGateway)

It is written in JavaScript.  The server side is a NodeJS application using the Express framework that runs over HTTPS and uses secure WebSockets (WSS) to
pass data over the Internet to the web browser. WSS requires encryption which is why it is implemented with that feature.

Installing this will require some familiarity with Linux/Unix command line and system.

You will need to have a domain name for the site and current certificates tied to that domain. The index.js file, which defines the HTTPS server, is looking for 
**key.pem** and **cert.pem**
in the same directory as index.js. I suggest using (Certbot)[https://certbot.eff.org/] to obtain free signed certificates that all major browsers recognize
as legitimate.  I typically run Apache2 or another webserver to allow Certbot to authenticate the site to create the certificates. The certificates will 
typically reside in /etc/live/**your domain name** and I simply soft link (ln -s) them from the dsgwdashboard directory.  You can disable the webserver, 
such as Apache2 or NGNIX once you have the certificates.

**Edit util/dashboard.ini and copy to /usr/local/etc/dashboard.ini**

Before starting up the dsgwdashboard you will want to have DStarGateway running, to prepopulate the log files.  Your first task
will be to edit dashboard.ini to put in your hostname and to ensure file paths match your install of DStarGateway.  The dashboard parses those log files
in realtime to update the dashboard.

This dashboard runs under a current version of NodeJS.  Your distribution may install an older version, so use the methods documented at (nodesource)[https://github.com/nodesource/distributions]. Make sure **node -v** returns the version you installed.

Your next task is to install the modules used with the command **npm install -save** within the dsgwdashboard directory.

You can start the dsgwdashboard server on the command line by entering the install directory for dsgwdashboard and typing
**sudo node index.js** It should also run under the newer/faster [Bun Runtime](https://bun.sh/)

If it comes up successfully, go to a browser put in a HTTPS request to your domain name.  If you get a dashboard, you have done everything correctly.

I have included a systemd service file in the util subdirectory which can be copied to /lib/systemd/system and managed with the **sudo systemctl** command.

This program is still under development, but you are welcome to try it out. Consider it alpha code.

