<?php

?>

<html>
<head>
<title>Clock'd</title>
	<meta name="viewport" content="width=device-width" />
	<meta name="mobile-web-app-capable" content="yes" />
	<link rel="shortcut icon" sizes="196x196" href="clockd_128.png" />
	<link rel="stylesheet" href="css/style.css" />
	<script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/jquery.easing.1.3.js"></script>
    <script type="text/javascript" src="js/functions.js"></script>
</head>
<body>
	<div id="canvas_container" align="center"><canvas id="clock_canvas"/></div>
	<div id="infomatics">
		<div id="temperatureInfo">
			<span id="temperature_label"></span><br/>
			<span id="temperatureHigh_text">0&deg;</span><span style="font-size:16px">High</span><br/>
			<span id="temperatureCurrent_text">0&deg;</span><span style="font-size:25px">Current</span><br/>
			<span id="temperatureLow_text">0&deg;</span><span style="font-size:16px">Low</span>
		</div>
		<div id="humidityInfo">
			<span id="humidity_label"><b>Humidity</b></span><br/>
			<span id="humidity_text">0</span><span id="humidity_units" style="font-size:20px">%</span>
		</div>

		<div id="sunriseInfo">
			<span id="sunrise_label"><b>Sunrise</b></span><br/>
			<span id="sunrise_text">&nbsp;</span><span style="font-size:20px">am</span>
		</div>
		<div id="sunsetInfo">
			<span id="sunset_label"><b>Sunset</b></span><br/>
			<span id="sunset_text">&nbsp;</span><span style="font-size:20px">pm</span>
		</div>
	</div>
</body>
</html>	
