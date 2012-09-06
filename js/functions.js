// some globals
var ctx;
var d;
var MAX_SECOND_RADIUS = 100;
var MAX_MINUTE_RADIUS = 10;
var MAX_HOUR_RADIUS = 50;

window.onresize = function(event) {
	$('#clock_canvas')[0].width = window.innerWidth;
	$('#clock_canvas')[0].height = window.innerHeight;
}

function init() {
	// detect screen size on mobile
	//alert('w: '+screen.width+' h: '+screen.height);

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
	
	drawSeconds();
	drawMinutes();
	drawHours();
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
	}
}

function drawHours() {
	var min = d.getHours()%12;	// 12-hr clock
	for(var i=1; i<=min; i++) {
		drawCircle(window.innerWidth/2+Math.sin(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS),(10*(1000-d.getMilliseconds())/1000)+MAX_HOUR_RADIUS,"rgba(230,219,116,1)", true, false); // #E6DB74
		//drawBlurCircle(window.innerWidth/2+Math.sin(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS), window.innerHeight/2-Math.cos(i*Math.PI/6)*(2*MAX_SECOND_RADIUS+3*MAX_MINUTE_RADIUS+2*MAX_HOUR_RADIUS),(10*(1000-d.getMilliseconds())/1000)+MAX_HOUR_RADIUS,"rgba(230,219,116,1)","rgba(230,219,116,0)", true, false); // #E6DB74
	}

}

// TODO: Implement buffered canvas for offscreen drawing
// TODO: adjust the linear proportionality of the growth, i.e. pulse at 20% vs 20 flat