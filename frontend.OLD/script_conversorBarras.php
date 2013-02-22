<?php
header('Content-type: application/json');


global $_GET;
$filtro = $_GET['filter'];
if (!isset($filtro)) $filtro="";

//END POINT LMF
$endpoint = "http://shannon.gsi.dit.upm.es/episteme/lmf/sparql/select"; 

//QUERY PARA SELECCIONAR DATOS
if($filtro == ""){
	$query = "SELECT%20*%20WHERE%20%7B%5B%5D%20%3Chttp%3A//purl.org/marl/polarityValue%3E%20%3Fpolarity%3B%7D";
}else{
	$query = "SELECT%20*%20WHERE%20%7B%5B%5D%20%3Chttp%3A//purl.org/dc/elements/1.1/title%3E%20%3Fcomp%3B%20%3Chttp%3A//purl.org/marl/polarityValue%3E%20%3Fpolarity%3B%20FILTER%20regex%28%3Fcomp%2C%20%22".$filtro."%22%29%7D";
}
//Cambiamos los < , > para la URL por sus equivalentes
$query = str_replace("<", "%3C", $query);
$query = str_replace(">", "%3E", $query);

//Tipo de salida (xml,json)
$output = "json";

//Extraemos el json del webservice LMF
$result = file_get_contents($endpoint."?query=".$query."&output=".$output);

$origin = json_decode($result, true);

//Primer formateo de los datos a un array con los 3 niveles
$salida = array();

foreach($origin['results']['bindings'] as $tweet){	
	if ($tweet['polarity']['value'] != "0")		
		$salida[] = $tweet['polarity']['value'];
		
}



print json_encode($salida);

?> 