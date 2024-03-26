const socket = io();

socket.addEventListener("connect", () => {
  socket.emit("Hello from script.js");
});

socket.addEventListener("info", indata => {
//	console.log(indata);
	const data = JSON.parse(indata);
	$("#instruct").empty();
	$("#instruct").append("<table id=\"urltable\"><caption>Helpful Sites</caption>");
	$("#urltable").append("<tr><th>Sponsor</th><th>Live</th><th>Utilities</th></tr>");
	$("#urltable").append("<tr><td><a target=\"sponsor\" href=\"" + data.sponsor + "\">" +
		data.sponsorname + "</a></td><td><a target=\"live\" href=\"" + data.live_1 + "\">" +
		data.livename_1 + "</a></td><td><a target=\"register\" href=\"" + data.registration +
		"\">" + data.registersite + "</a></td></tr>");
	$("#urltable").append("<tr><td><a target=\"sponsor\" href=\"" + data.cosponsor + "\">" +
		data.cosponsorname + "</a></td><td><a target=\"live\" href=\"" + data.live_2 + "\">" +
		data.livename_2 + "</a></td><td></td></tr>");

});

socket.addEventListener("title", data => {
//	console.log(data);
	$("title").text(data);
	$("#intro").text(data);
});

socket.addEventListener("links", data => {
//	console.log("links " + data);

	$("#links").empty();
	$("#links").append("<table id=\"linktable\"><caption>Links</caption>");
	$("#linktable").append("<tr><th>Repeater</th><th>Reflector</th><th>Protocol</th>" +
			"<th>Device</th><th>Direction</th><th>Timestamp</th></tr>");
	$.each(data, function(index,val){
		const utcDate = new Date(val.timestamp);
		var reflector = val.reflector.substring(0,8).trim();
		if (reflector.substring(0,3) == "REF") reflector = "<a href=\"http://" + reflector.substring(0,6).trim() + ".dstargateway.org\" target=\"reflector\">" + val.reflector + "</a>";
		$("#linktable").append("<tr><td>" + val.repeater + "</td><td>" + reflector + 
			"</td><td>" + val.protocol + "</td><td>" + val.device + "</td><td>" +
			val.direction + "</td><td>" + utcDate.toLocaleString() + "</td></tr>");
		// console.log(index, val);
	});
});

socket.addEventListener("repeaters", data => {
	$("#repeaters").empty();
	$("#repeaters").append("<table id=\"rptrtable\"><caption>Repeaters</caption>");
	$("#rptrtable").append("<tr><th>Callsign</th><th>Frequency</th><th>Offset</th><th>Description</th>" +
		"<th>Location</th></tr>");
	$.each(data, function(index,val){
		$("#rptrtable").append("<tr><td>" + 
			val.callsign + 
			"</td><td>" + 
			val.frequency + 
			" Mhz.</td><td>" + 
			val.offset + 
			" Mhz.</td><td>" + 
			val.description1 + 
			" - " +
			val.description2 + 
			"</td><td><a title=\"" +
			val.latitude +
			" " + 
			val.longitude + 
			"\" target=\"location\" href=\"https://aprs.fi/#!mt=roadmap&z=11&call=a%2F" +
			val.callsign +
			"\" >aprs.fi</a></td></tr>");
	});
});

socket.addEventListener("lastheard", data => {
//	console.log("lastheard " + data);
	$("#lastheard").empty();
	$("#lastheard").append("<table id=\"lhtable\"><caption>Last Heard</caption>");
	$("#lhtable").append("<tr><th>MYcall</th><th>URcall</th><th>Rpt1</th><th>Rpt2</th><th>Source</th><th>Date GMT</th><th>Time GMT</th><th>Local</th></tr>");
	$.each(data, function(index,val){
		// console.log(index, val);
		const utcDate = val.date.trim() + 'T' + val.time.trim() + 'Z';
		const udate = new Date(utcDate);
		const ldate = udate.toLocaleString();
		var mcall = "<a href=\"https://qrz.com/db/" + val.mycall + "\" target=\"qrz\">" + val.mycall + "</a>";
		if (val.msg1 != "") mcall += " / " + val.msg1;
		var rpt1 = val.rpt1.substring(0,7).trim();
		if (rpt1.substring(0,3) == "REF") { 
			rpt1 = "<a href=\"http://" + rpt1 + ".dstargateway.org\" target=\"reflector\">" + val.rpt1 + "</a>"}
		else {
			rpt1 = val.rpt1
		}
		var rpt2 = val.rpt2.substring(0,7).trim();
		if (rpt2.substring(0,3) == "REF") {
			rpt2 = "<a href=\"http://" + rpt2 + ".dstargateway.org\" target=\"reflector\">" + val.rpt2 + "</a>" }
		else {
			rpt2 = val.rpt2
		}
		$("#lhtable").append("<tr><td>" + mcall + "</td><td>"+ val.urcall + 
			"</td><td>" + rpt1 + "</td><td>" + rpt2 + 
			"</td><td>" + val.source + "</td><td>" + val.date + "</td><td>" + val.time + "</td>" +
			"<td>" + ldate +"</td></tr>");
	})
});
