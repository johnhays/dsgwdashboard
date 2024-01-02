const https = require("https");
const fs = require("fs");
const ini = require("ini");
const lineReader = require('line-reader');
const express = require("express");
const socketio = require('socket.io');
const path = require('path');
const Tail = require('tail-file');
const CircularBuffer = require("circular-buffer");

const inifile = ini.parse(fs.readFileSync('./dashboard.ini', 'utf-8'));
const host = inifile.config.host;
const port = inifile.config.port;
const links = inifile.logs.links;
const linkqueue = parseInt(inifile.params.linkqueue);
const heardqueue = parseInt(inifile.params.heardqueue);
const headers = inifile.logs.headers;
const dgwconfig = ini.parse(fs.readFileSync(inifile.config.dgwconfig, 'utf-8'));

const app = express();
const buf = new CircularBuffer(heardqueue);
const linklist = new CircularBuffer(linkqueue);

linklist.push({'timestamp':'0000-00-00 00:00:00' , 'protocol': 'none' , 'device':'none',
                        'repeater': 'none', 'reflector': 'none' , 'direction' : '' });

updatelinks();

const server = https
	.createServer(
		{
			key: fs.readFileSync("key.pem"),
			cert: fs.readFileSync("cert.pem"),
		},
		app
	)
	.listen(443, ()=>{
			console.log('server is running at port 443')
	});

app.get('/', (req,res)=>{
	    res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

app.use(express.static(path.resolve(__dirname, 'client')));

const io = socketio(server);

function senddata(dest,data,socket) {
	console.log("Enter Senddata -> " + dest);
	socket.emit(dest,data);
	// console.log(dest,JSON.stringify(data));
	console.log("Leave Senddata -> " + dest);
}

function updatelinks() {
	console.log("Entering updatelinks");
	const linksregex = /(.*) (.*) (.*) - Type: (.*) Rptr: (.*) Refl: (.*) Dir: (.*)/;
	const linkfile = fs.readFileSync(links).toString();
	const lines = linkfile.split(/\n|\r\n/);
	console.log("Queue Size in: " + linklist.size());
	while (linklist.size() > 0) {
		linklist.deq();
	}; 
	console.log("Queue Size out: " + linklist.size());
	console.log("File Length: " + lines.length);
	let i = 0;
	while (i < lines.length) {
		if(lines[i] != "") {
			var mylinks = lines[i].match(linksregex);
			console.log(JSON.stringify(lines[i]));
			var linkrec = {'timestamp':mylinks[1].substr(0,19) , 'protocol':mylinks[2] , 'device':mylinks[4],
				'repeater':mylinks[5] , 'reflector':mylinks[6] , 'direction' : mylinks[7] };
			linklist.push(linkrec);
		}
		i++;
	}
//	console.log("From updatelinks() " + JSON.stringify(linklist.toarray()));
//	senddata("links",linklist.toarray(),io);
	console.log("Leaving updatelinks");
}



io.on('connection', (socket) => {
	console.log('WS New connection');
	senddata("lastheard",buf.toarray(),socket);
	senddata("links",linklist.toarray(),socket);
	senddata("title",host + " Dashboard",socket);
	console.log("leaving connection");
});

// io.on('message', (socket) => {
//	console.log('New Message' + JSON.stringify(socket))
//});

fs.watch(headers, (curr, prev)=>{
	console.log(headers + ' file changed');
//	console.log("from fs.watch headers " + JSON.stringify(buf.toarray()));
	senddata("lastheard",buf.toarray(),io);
});

fs.watch(links, (curr, prev)=>{
	console.log(links + ' file changed');
//	console.log("from fs.watch links " + JSON.stringify(linklist.toarray())); 
	updatelinks();
	// console.log("from fs.watch links " + JSON.stringify(linklist.toarray())); 
	senddata("links",linklist.toarray(),io);
	console.log("Leaving links watch");
});

const tailheaders = new Tail(headers, {startPos : 'end'}, line => {
	const headerregex = /(.*) (.*) header.*My: (.*)  Your: (.*) *Rpt1: (.*) *Rpt2: (.*) Flags.*\((.*)\)/;
	const groups = line.match(headerregex);
//	console.log(JSON.stringify(groups));
	if (groups) {
		var ipport = groups[7].split(':');
		var my = groups[3].split('/');
		var [dstamp,tstamp] = groups[1].split(" ");
		var record = {'date':dstamp,'time':tstamp.substr(0,8),
			'source':groups[2].trim(),'mycall':my[0].trim(),'msg1':my[1].trim(),
			'urcall':groups[4].trim(),'rpt1':groups[5].trim(),'rpt2':groups[6].trim(),
			'srcip':ipport[0],'srcport':ipport[1]};
		buf.push(record);
		senddata("lastheard",buf.toarray(),io);
//		console.log(JSON.stringify(record));
	}
});

tailheaders.start();
