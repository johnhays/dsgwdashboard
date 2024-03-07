# dsgwdashboard 

This is a realtime Dashboard for F4FXL's [DStarGateway](https://github.com/F4FXL/DStarGateway)

It is written in JavaScript.  The server side is a [NodeJS](https://nodejs.org/) application using the [Express](https://expressjs.com/) framework and runs over [HTTPS](https://wikipedia.org/wiki/HTTPS) using secure [WebSockets (WSS)](https://javascript.info/websocket) to pass data over the Internet to the web browser. WSS requires encryption which is why it is implemented using HTTPS.

Installing this will require some familiarity with Linux/Unix command line and system.

You will need to have a domain name for the site and current certificates tied to that domain. The index.js file, which defines the HTTPS server, is looking for 
**key.pem** and **cert.pem** in the same directory as index.js. 
If you don't have the certs, use [Certbot](https://certbot.eff.org/) to obtain free signed certificates that all major browsers recognize
as legitimate.  Use the --standalone flag or run Apache with plugin. The certificates will 
typically reside in /etc/letsencrypt/live/**your domain name**/ (replace **your domain name** with your actual domain name) 
and simply soft link (ln -s) them from the dsgwdashboard directory:  
```
ln -s /etc/letsencrypt/live/**your domain name**/cert.pem cert.pen
ln -s /etc/letsencrypt/live/**your domain name**/privkey.pem key.pen
```

Before starting up the dsgwdashboard you will want to have DStarGateway running, to **prepopulate** the log files. Alternatively, if your gateway isn't
ready:
```
sudo touch /var/log/dstargateway/Headers.log
sudo touch /var/log/dstargateway/Links.log
sudo chown dstar:dstar /var/log/dsgateway/Headers.log
sudo chown dstar:dstar /var/log/dsgateway/Links.log
```

Your first task will be to edit [util/dashboard.ini](util/dashboard.ini) to put in your hostname and to ensure file paths match your install of DStarGateway.  The dashboard parses those log files in realtime to update the dashboard. Then copy the file to /usr/local/etc
```
sudo cp util/dashboard.ini /usr/local/etc
```

This dashboard runs under a current version of NodeJS.  Your distribution may install an older version, so use the methods documented at [nodesource](https://github.com/nodesource/distributions). Make sure it returns the version you installed.
```
node -v
```

Your next task is to install the modules used with the command 
```
npm install -save
```
within the dsgwdashboard directory.

You can start the dsgwdashboard server on the command line by entering the install directory for dsgwdashboard and typing
```
sudo node index.js
```
Kill this with **^C** before running it as service.

It should also run under the newer/faster [Bun Runtime](https://bun.sh/)

If it comes up successfully, go to a browser and put in a HTTPS request to your domain name.  If you get a dashboard, you have done everything correctly.

The install will redirect http to https, if you don't want the redirect, see the end of [index.js](index.js)

I have included a systemd service file in the util subdirectory which can be copied to /lib/systemd/system 
```
sudo cp util/dsgwdashboard.service /lib/systemd/system
```
and manage it with the **systemctl** commands:
```
sudo systemctl status dsgwdashboard
sudo systemctl enable dsgwdashboard
sudo systemctl start dsgwdashboard
```

Please read this [note](util/NOTE.md) for some additional operational detail.

Some routine maintenance can be automated by copying [reloadhosts](util/reloadhosts) into */usr/local/bin*
```
cp util/reloadhosts /usr/local/bin
```
then modify your crontab
```
sudo crontab -e
```
and adding the lines
```
0 0 * * * : > /var/log/dstargateway/Headers.log
0 0 * * * /usr/local/bin/reloadhosts
```

What this does is, at midnight every night, it truncates the /var/log/dstargateway/Headers.log, which will grow very long overtime and slow down the initial population of the dashboard.  Then reloadhosts, will pull down current updated files for  reflectors and their associated addresses, and restart the gateway so that the new addresses are cached.

This program is still under development, but you are welcome to try it out. Consider it alpha code and refresh it periodically by going into the dsgwdashboard directory and
```
git status
git pull
sudo systemctl restart dsgwdashboard
```

