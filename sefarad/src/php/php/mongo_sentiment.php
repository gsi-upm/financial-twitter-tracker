<?php

error_log("heeeey");

// conectar
$m = new MongoClient("mongodb://localhost", array("username"=>"mtorres", "password"=>"marcoGSImongo");

// select Sefarad Database
$db = $m->ftt;

for ($i = 1; $i <= $_GET['number']; $i++) {
	error_log($i);
	$comp = $_GET["company".$i];

	// error_log($comp);
	$collection = $db->$comp;
	$cursor = $collection->find();
	$cursor -> sort(array('date' => 1));

	// echo ($comp."\n");
	$comp = '{"'.$comp.'": [';
	if (($cursor->count()) > 0) {
		foreach ($cursor as $doc) {
			// echo (json_encode(($doc))), "\n";
			$comp = $comp.json_encode($doc);
			$comp = $comp.",";
		}
	}
	$comp = substr_replace($comp, "", -1);
	error_log($comp);
	$comp = $comp."]}\n";

	echo $comp;

}

// // select Configuration collection
// $collection = $db->$_GET['company1'];

// // search saved configuration
// $cursor = $collection->find();

// // load configuration (saved or defatult)
// if (($cursor->count()) > 0) {
// 	foreach ($cursor as $doc) {
// 	    echo (json_encode(($doc))), "\n";
// 	}
// } 


?>