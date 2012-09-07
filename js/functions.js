// some globals
var ctx;
var d;
var weather;
var MAX_SECOND_RADIUS = 100;
var MAX_MINUTE_RADIUS = 10;
var MAX_HOUR_RADIUS = 50;
var SUNRISE = "6:23";
var SUNSET = "8:23";
var isStaleSun = true;
var LAT = "40.71417";	// default NYC
var LONG = "-74.00639";	// default NYC

window.onresize = function(event) {
	$('#clock_canvas')[0].width = window.innerWidth;
	$('#clock_canvas')[0].height = window.innerHeight;
	document.getElementById('canvas_container').requestFullScreen();
}

function init() {
	// set handlers
	setHandlers();

	// resolve the time
	d = new Date();

	// attempt gps
	navigator.geolocation.getCurrentPosition(GetLocation);
	function GetLocation(location) {
	    LAT = location.coords.latitude;
	    LONG = location.coords.longitude;
	    console.log('('+LAT+','+LONG+')');
	}

	// calculate our sunrise and sunset objects
	getWeather();

	// get the canvas context
	ctx = $('#clock_canvas')[0].getContext("2d");
	$('#clock_canvas')[0].width = window.innerWidth;
	$('#clock_canvas')[0].height = window.innerHeight;
	return setInterval(draw, 10); // approximately 60 fps
}

$(document).ready(function() {
    init();
});

function draw() {
	ctx.clearRect(0,0,$('#clock_canvas')[0].width,$('#clock_canvas')[0].height);
	
	// resolve the time
	d = new Date();
	if(d.getHours == 0 && isStaleSun == true) {
		// request the days sunrise and sunset. set a semaphore so we only do this once
		isStaleSun = false;
	}
	if(d.getHours > 0) isStaleSun = true;
	
	drawSeconds();
	drawMinutes();
	drawHours();
	drawSecondsAnnotation();
	updateBackground();

	return d;
}

function setHandlers() {

}

function onMouseMove() {
	console.log("mousemove");
}


// THA UNICORN MEAT //
function drawCircle(x,y,r,color,fill,stroke) {

	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x,y,r,0,Math.PI*2,true);
	ctx.closePath();
	if(fill == true) {
		ctx.fill();
	}
	if(stroke == true) {
		ctx.strokeStyle=color;
		ctx.stroke();
	}
}

function drawBlurCircle(x,y,r,color0,color1,fill,stroke) {
	var radgrad = ctx.createRadialGradient(x,y,r-r/4,x,y,r);
  	radgrad.addColorStop(0, color0);
  	radgrad.addColorStop(1, color1);

  	ctx.fillStyle = radgrad;
  	ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
}

function drawSeconds() {
	drawCircle(window.innerWidth/2, window.innerHeight/2,(20*(1000-d.getMilliseconds())/1000)+((MAX_SECOND_RADIUS*d.getSeconds())/60),"rgba(227,0,83,1)", true, false); //#E30053
	//drawBlurCircle(window.innerWidth/2, window.innerHeight/2,(20*(1000-d.getMilliseconds())/1000)+((MAX_SECOND_RADIUS*d.getSeconds())/60),"rgba(227,0,83,1)", "rgba(227,0,83,0)", true, false); //#E30053

	// draw a reference guide to the seconds unit
	drawCircle(window.innerWidth/2, window.innerHeight/2,(20*(1000-d.getMilliseconds())/1000)+MAX_SECOND_RADIUS,"rgba(227,0,83,1)", false, true); //#E30053
}

function drawMinutes() {
	var min = d.getMinutes();
	for(var i=1; i<=min; i++) {
		drawCircle(window.innerWidth/2+Math.sin(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS),(4*(1000-d.getMilliseconds())/1000)+MAX_MINUTE_RADIUS,"rgba(23,193,190,0.8)", true, false); //#17C1BE
		//drawBlurCircle(window.innerWidth/2+Math.sin(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS),(4*(1000-d.getMilliseconds())/1000)+MAX_MINUTE_RADIUS,"rgba(23,193,190,1)","rgba(23,193,190,0)", true, false); //#17C1BE
	}
}

function drawHours() {
	var hours = d.getHours()%12;	// 12-hr clock
	for(var i=1; i<=hours; i++) {
		var alpha = 1.2 - (hours - i)/12;
		drawCircle(window.innerWidth/2+Math.sin(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS),(10*(1000-d.getMilliseconds())/1000)+MAX_HOUR_RADIUS,"rgba(230,219,116,"+alpha+")", true, false); // #E6DB74
		//drawBlurCircle(window.innerWidth/2+Math.sin(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS),(10*(1000-d.getMilliseconds())/1000)+MAX_HOUR_RADIUS,"rgba(230,219,116,1)","rgba(230,219,116,0)", true, false); // #E6DB74
	}

}

function drawSecondsAnnotation() {

}

function updateBackground() {

}

function getWeather() {
	var url = 'http://i.wxbug.net/REST/Direct/GetObs.ashx?la='+LAT+'&lo='+LONG+'&&ic=1&api_key=jwp2wjpfnuku7u64csy5x827';
	$.getJSON('http://www.crossproduct.org/serviceProxies/weather.php?callback=?',{LAT:LAT,LONG:LONG},function(data){
    	weather = data;
    	console.log(data);
	});
}
// TODO: Implement buffered canvas for offscreen drawing
// TODO: adjust the linear proportionality of the growth, i.e. pulse at 20% vs 20 flat