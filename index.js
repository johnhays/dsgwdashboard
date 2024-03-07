const https = require("https");
const fs = require("fs");
const ini = require("ini");
const lineReader = require('line-reader');
const express = require("express");
const socketio = require('socket.io');
const path = require('path');
const Tail = require('tail-file');
const CircularBuffer = require("circular-buffer");

const inifile = ini.parse(fs.readFileSync('/usr/local/etc/dashboard.ini', 'utf-8'));
const host = inifile.config.host;
const port = inifile.config.port;
const links = inifile.logs.links;
const redirecthttp = inifile.config.redirecthttp;
const httpport = inifile.config.httpport;
const linkqueue = parseInt(inifile.params.linkqueue);
const heardqueue = parseInt(inifile.params.heardqueue);
const headers = inifile.logs.headers;
const dgwconfig = ini.parse(fs.readFileSync(inifile.config.dgwconfig, 'utf-8'));

const app = express();
const buf = new CircularBuffer(heardqueue);
const linklist = new CircularBuffer(linkqueue);

const urls = inifile.urls;

var repeaterlist = [];

linklist.push({'timestamp':'0000-00-00 00:00:00' , 'protocol': 'none' , 'device':'none',
                        'repeater': 'none', 'reflector': 'none' , 'direction' : '' });

updatelinks();

let serverPort = inifile.config.port;

const server = https
	.createServer(
		{
			key: fs.readFileSync("key.pem"),
			cert: fs.readFileSync("cert.pem"),
		},
		app
	)
	.listen(serverPort, ()=>{
			console.log('server is running at port ' + serverPort)
	});

app.get('/', (req,res)=>{
	    res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

app.use(express.static(path.resolve(__dirname, 'client')));

const io = socketio(server);

function senddata(dest,data,socket) {
	socket.emit(dest,data);
}


function buildrepeaters(){
	repeaterlist = [];
	for (i=1;i < 5;i++) {
		let rptr = eval("dgwconfig.Repeater_"+i);
		if (rptr.enabled) {
			let callsign = dgwconfig.Gateway.callsign;
			if (rptr.callsign !== ""){
				callsign = rptr.callsign;
			}
			callsign += " " + rptr.band;
			repeaterlist.push({'callsign':callsign,'frequency':rptr.frequency,
				'offset':rptr.offset,'type':rptr.type,'description1' :rptr.description1,
				'description2':rptr.description2,'latitude':rptr.latitude, 'longitude': rptr.longitude});
		}
	}
}

function updatelinks() {
	const linksregex = /(.*) (.*) (.*) - Type: (.*) Rptr: (.*) Refl: (.*) Dir: (.*)/;
	const linkfile = fs.readFileSync(links).toString();
	const lines = linkfile.split(/\n|\r\n/);
	while (linklist.size() > 0) {
		linklist.deq();
	}; 
	let i = 0;
	while (i < lines.length) {
		if(lines[i] != "") {
			var mylinks = lines[i].match(linksregex);
			// console.log(JSON.stringify(lines[i]));
			var linkrec = {'timestamp':mylinks[1].substr(0,19)+'Z' , 'protocol':mylinks[2] , 'device':mylinks[4],
				'repeater':mylinks[5] , 'reflector':mylinks[6] , 'direction' : mylinks[7] };
			linklist.push(linkrec);
		}
		i++;
	}
}



io.on('connection', (socket) => {
	// console.log('WS New connection');
	buildrepeaters();
	senddata("info",JSON.stringify(urls),socket);
	senddata("lastheard",buf.toarray(),socket);
	senddata("links",linklist.toarray(),socket);
	senddata("title",host + " Dashboard",socket);
	senddata("repeaters",repeaterlist,socket);
	// console.log("leaving connection");
});

fs.watch(headers, (curr, prev)=>{
	senddata("lastheard",buf.toarray().reverse(),io);
});

fs.watch(links, (curr, prev)=>{
	updatelinks();
	senddata("links",linklist.toarray(),io);
});



const tailheaders = new Tail(headers, {startPos : 'end'}, line => {
	const headerregex = /(.*) (.*) header.*My: (.*)  Your: (.*) *Rpt1: (.*) *Rpt2: (.*) Flags.*\((.*)\)/;
	const groups = line.match(headerregex);
	if (groups) {
		var ipport = groups[7].split(':');
		var my = groups[3].split('/');
		var [dstamp,tstamp] = groups[1].split(" ");
		var record = {'date':dstamp,'time':tstamp.substr(0,8),
			'source':groups[2].trim(),'mycall':my[0].trim(),'msg1':my[1].trim(),
			'urcall':groups[4].trim(),'rpt1':groups[5].trim(),'rpt2':groups[6].trim(),
			'srcip':ipport[0],'srcport':ipport[1]};
		buf.push(record);
		senddata("lastheard",buf.toarray().reverse(),io);
	}
});

tailheaders.start();
// See dashboard.ini in /usr/local/etc
if (redirecthttp){
var http = require("http");

http
	.createServer(function (req, res) {
		res.writeHead(301, { Location: "https:"+host });
		res.end();
	})
	.listen(httpport);
}
