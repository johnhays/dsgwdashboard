const socket = io();

socket.addEventListener("connect", () => {
  socket.emit("Hello from script.js");
});

socket.addEventListener("message", data => {
	console.log(data[0]);
	$("#intro").text(data);
});

socket.addEventListener("title", data => {
	console.log(data);
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
		$("#linktable").append("<tr><td>" + val.repeater + "</td><td>" + val.reflector + 
			"</td><td>" + val.protocol + "</td><td>" + val.device + "</td><td>" +
			val.direction + "</td><td>" + val.timestamp + "</td></tr>");
		// console.log(index, val);
	});
});

socket.addEventListener("repeaters", data => {
	$("#repeaters").empty();
	$("#repeaters").append("<table id=\"rptrtable\"><caption>Repeaters</caption>");
	$("#rptrtable").append("<tr><th>Callsign</th><th>Frequency</th><th>Offset</th></tr>");
	$.each(data, function(index,val){
		$("#rptrtable").append("<tr><td>" + val.callsign + "</td><td>" + val.frequency + 
			" Mhz.</td><td>" + val.offset + " Mhz.</td></tr>");
	});
});

socket.addEventListener("lastheard", data => {
//	console.log("lastheard " + data);
	$("#lastheard").empty();
	$("#lastheard").append("<table id=\"lhtable\"><caption>Last Heard</caption>");
	$("#lhtable").append("<tr><th>MYcall</th><th>URcall</th><th>Rpt1</th><th>Rpt2</th><th>Source</th><th>Date</th><th>Time</th></tr>");
	$.each(data, function(index,val){
		// console.log(index, val);
		var mcall = val.mycall;
		if (val.msg1 != "") mcall += " / " + val.msg1;
		$("#lhtable").append("<tr><td>" + mcall + "</td><td>"+ val.urcall + 
			"</td><td>" + val.rpt1 + "</td><td>" + val.rpt2 + 
			"</td><td>" + val.source + "</td><td>" + val.date + "</td><td>" + val.time + "</td></tr>");
	})
});
