/**
 * Author; Chris Ross
 * crossproduct iNc.
 *
 * A minimal but beautiful, soothing rhythmic clock with daily weather updates. 
 */

// some globals
var ctx;
var d;
var weather;
var MAX_SECOND_RADIUS = 100;
var MAX_MINUTE_RADIUS = 10;
var MAX_HOUR_RADIUS = 50;
var SUNRISE = "6:23";
var SUNSET = "8:23";
var isStaleWeather = true;
var LAT = "40.71417";	// default NYC
var LONG = "-74.00639";	// default NYC
var bgIsAnimating = false;

// minified jquery color plugin since there are bugs in animating backgroundColor css prop
(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);

window.onresize = function(event) {
	$('#clock_canvas')[0].width = window.innerWidth;
	$('#clock_canvas')[0].height = window.innerHeight;
	//document.getElementById('canvas_container').requestFullScreen();

	console.log(''+window.innerWidth+' '+window.innerHeight);
}

// application initialization
function init() {
	// set default data
	$('#sunrise_text').html(SUNRISE);
    $('#sunset_text').html(SUNSET);

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

// boot
$(document).ready(function() {
    init();
});

function draw() {
	ctx.clearRect(0,0,$('#clock_canvas')[0].width,$('#clock_canvas')[0].height);
	
	// resolve the time
	d = new Date();
	if(d.getMinutes() == 0 && isStaleWeather == true) {
		// request the days sunrise and sunset. set a semaphore so we only do this once every hour
		isStaleWeather = false;
		getWeather();
	}else if(d.getMinutes() != 0) isStaleWeather = true;
	
	drawSeconds();
	drawMinutes();
	drawHours();
	drawSecondsAnnotation();
	updateBackground();

	return d;
}

function setHandlers() {
	$('body').click(revealInfomatics);
}

function revealInfomatics() {
	$('#infomatics').stop();
	$('#infomatics').animate({opacity:1.0},500);
	$('#infomatics').animate({opacity:1.0},2500);
	$('#infomatics').animate({opacity:0},2000);
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

// draws a blurred style circle
function drawBlurCircle(x,y,r,color0,color1,fill,stroke) {
	var radgrad = ctx.createRadialGradient(x,y,r-r/4,x,y,r);
  	radgrad.addColorStop(0, color0);
  	radgrad.addColorStop(1, color1);

  	ctx.fillStyle = radgrad;
  	ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
}

// draw the layout for seconds
function drawSeconds() {
	drawCircle(window.innerWidth/2, window.innerHeight/2,(20*(1000-d.getMilliseconds())/1000)+((MAX_SECOND_RADIUS*d.getSeconds())/60),"rgba(227,0,83,1)", true, false); //#E30053
	//drawBlurCircle(window.innerWidth/2, window.innerHeight/2,(20*(1000-d.getMilliseconds())/1000)+((MAX_SECOND_RADIUS*d.getSeconds())/60),"rgba(227,0,83,1)", "rgba(227,0,83,0)", true, false); //#E30053

	// draw a reference guide to the seconds unit
	drawCircle(window.innerWidth/2, window.innerHeight/2,(20*(1000-d.getMilliseconds())/1000)+MAX_SECOND_RADIUS,"rgba(227,0,83,1)", false, true); //#E30053
}

// draw the layout for minutes
function drawMinutes() {
	var min = d.getMinutes();
	for(var i=1; i<=min; i++) {
		drawCircle(window.innerWidth/2+Math.sin(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS),(4*(1000-d.getMilliseconds())/1000)+MAX_MINUTE_RADIUS,"rgba(23,193,190,0.8)", true, false); //#17C1BE
		//drawBlurCircle(window.innerWidth/2+Math.sin(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/30)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS),(4*(1000-d.getMilliseconds())/1000)+MAX_MINUTE_RADIUS,"rgba(23,193,190,1)","rgba(23,193,190,0)", true, false); //#17C1BE
	}
}

// draw the layout for hours
function drawHours() {
	var hours = d.getHours()%12;	// 12-hr clock
	for(var i=1; i<=hours; i++) {
		var alpha = 1.2 - (hours - i)/12;
		drawCircle(window.innerWidth/2+Math.sin(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS),(10*(1000-d.getMilliseconds())/1000)+MAX_HOUR_RADIUS,"rgba(230,219,116,"+alpha+")", true, false); // #E6DB74
		//drawBlurCircle(window.innerWidth/2+Math.sin(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS),(10*(1000-d.getMilliseconds())/1000)+MAX_HOUR_RADIUS,"rgba(230,219,116,1)","rgba(230,219,116,0)", true, false); // #E6DB74
	}

}

// draw the annotions on the second layout
function drawSecondsAnnotation() {

}

// updates background-color based on day as well as the sunrise and sunset animation
function updateBackground() {
	// check if we are at sunrise/sunset time and animate bg across 5 minutes
	var currTime = (d.getHours() < 12 ? d.getHours() : d.getHours()-12 )+':'+(d.getMinutes() < 10 ? ('0'+d.getMinutes()) : d.getMinutes());
	
	//console.log(currTime);
	if(currTime == SUNRISE) {
		
		if(bgIsAnimating == false) {
			bgIsAnimating = true;
			$('body').animate({'backgroundColor':'#010D65'}, (1000*60)); // dark blue #010D65
			$('body').animate({'backgroundColor':'#931A6D'}, (1000*60)); // purple #931A6D
			$('body').animate({'backgroundColor':'#FD5A5C'}, (1000*60)); // red #FD5A5C
			$('body').animate({'backgroundColor':'#F49F10'}, (1000*60)); // orange #F49F10
			$('body').animate({'backgroundColor':'#FEFED4'}, (1000*60), function() {bgIsAnimating = false});
		}
	} else if(currTime == SUNSET) {
		if(bgIsAnimating == false) {
			bgIsAnimating = true;
			$('body').animate({'backgroundColor':'#F49F10'}, (1000*60)); // orange #F49F10
			$('body').animate({'backgroundColor':'#FD5A5C'}, (1000*60)); // red #FD5A5C
			$('body').animate({'backgroundColor':'#931A6D'}, (1000*60)); // purple #931A6D
			$('body').animate({'backgroundColor':'#010D65'}, (1000*60)); // dark blue #010D65
			$('body').animate({'backgroundColor':'#121212'}, (1000*60), function() {bgIsAnimating = false}); // black
			// #F49F10 orange
		}
	}else {
		
		if(bgIsAnimating == true) return;

		currTime = d.getHours()+':'+(d.getMinutes() < 10 ? ('0'+d.getMinutes()) : d.getMinutes());
		var sunriseInt = parseInt(SUNRISE.replace(':',''));
		var sunsetInt = parseInt(SUNSET.replace(':',''));
		var currTimeInt = parseInt(currTime.replace(':',''));
		//console.log(sunriseInt+' '+(1200+sunsetInt)+' '+currTimeInt);
		if(currTimeInt > sunriseInt && currTimeInt < (1200+sunsetInt)){
			$('body').css('background-color', '#FEFED4');
		} else {
			$('body').css('background-color', '#121212');
		}
	}
}

// retrieve the weater object for the given location
function getWeather() {
	$.getJSON('http://www.crossproduct.org/serviceProxies/weather.php?callback=?',{LAT:LAT,LONG:LONG},function(data){
    	console.log(data);
    	weather = data;
    	var sunriseDate = new Date(weather.data.sunriseDateTime);
    	var sunsetDate = new Date(weather.data.sunsetDateTime);

    	SUNRISE = sunriseDate.getUTCHours()+':'+sunriseDate.getUTCMinutes();
    	SUNSET = (sunsetDate.getUTCHours()-12)+':'+sunsetDate.getUTCMinutes();

    	$('#sunrise_text').html(SUNRISE);
    	$('#sunset_text').html(SUNSET);
    	$('#temperatureHigh_text').html(weather.data.temperatureHigh+'&deg;');
    	$('#temperatureCurrent_text').html(weather.data.temperature+'&deg;');
    	$('#temperatureLow_text').html(weather.data.temperatureLow+'&deg;');
    	$('#humidity_text').html(weather.data.humidity);
    	$('#humidityUnits_text').html(weather.data.humidityUnits);

		revealInfomatics();

    	console.log(SUNRISE+'am '+SUNSET+'pm');
	});
}
// TODO: Implement buffered canvas for offscreen drawing
// TODO: adjust the linear proportionality of the growth, i.e. pulse at 20% vs 20 flat
// TODO: normalize sizes so that UI is liquid-scaling. (do after design/layout is more solidified)