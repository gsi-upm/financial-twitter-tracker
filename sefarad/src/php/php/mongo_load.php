<?php

// conectar
$m = new MongoClient("mongodb://localhost", array("username"=>"mtorres", "password"=>"marcoGSImongo");

// select Sefarad Database
$db = $m->ftt;

// select Configuration collection
$collection = $db->configuration;

// search saved configuration
$query = array( 'name' => 'saved_configuration' );
$cursor = $collection->find(  );

// load configuration (saved or defatult)
if (($cursor->count()) > 0) {
	foreach ($cursor as $doc) {
	    echo (json_encode(($doc)));
	}
} else {
	$query = array( 'name' => 'default_configuration' );
	$cursor = $collection->find();

	foreach ($cursor as $doc) {
	    echo (json_encode(($doc)));
	}
}

?>