<?php

$ac = $_REQUEST['actual_configuration'];

// connect to Mongo
$m = new MongoClient("mongodb://localhost", array("username"=>"mtorres", "password"=>"marcoGSImongo");

// select Sefarad DataBase
$db = $m->ftt;

// select Configuration collection
$collection = $db->configuration;

// delete old saved configuration
$collection->remove(array( 'name' => 'saved_configuration' ));

// save new configuration
$document = json_decode($ac,true);

unset($document['_id']);

$collection->insert($document);	

echo (json_encode(array('my_message' => $ac)));

?>