<?php


global $_GET;
$user = $_GET['user'];

$username = substr($user , 23);

$xml = simplexml_load_file("http://twitter.com/users/".$username.".xml");
echo $xml->profile_image_url;  // <-- No $xml->user here!
?> 