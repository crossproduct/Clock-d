<?php
	/* This is a proxy service for connecting to WeatherBug APIs, gets the weather for a given LAT,LONG */
	$url = 'http://i.wxbug.net/REST/Direct/GetObs.ashx?la='.$_GET['LAT'].'&lo='.$_GET['LONG'].'&&ic=1&api_key=jwp2wjpfnuku7u64csy5x827';
	$data = file_get_contents($url);
    echo $_GET['callback'] . '({url:' . $data . '})';
?>