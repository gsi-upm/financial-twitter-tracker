<?php

// connect to Mongo
$m = new MongoClient("mongodb://localhost", array("username"=>"mtorres", "password"=>"marcoGSImongo");

// select Sefarad DataBase
$db = $m->ftt;

// select Configuration collection
$collection = $db->configuration;

// delete old saved configuration
$collection->remove(array( 'name' => 'saved_configuration' ));

?>