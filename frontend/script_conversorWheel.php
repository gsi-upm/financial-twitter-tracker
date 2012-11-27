<?php
header('Content-type: application/json');


global $_GET;
$filtro = $_GET['filter'];
if (!isset($filtro)) $filtro="";

//END POINT LMF
$endpoint = "http://shannon.gsi.dit.upm.es/episteme/lmf/sparql/select"; 

//QUERY PARA SELECCIONAR DATOS
if($filtro == ""){
	$query = "SELECT%20*%20WHERE%20%7B%5B%5D%20%3Chttp%3A//purl.org/dc/elements/1.1/title%3E%20%3Fcomp%3B%20%3Chttp%3A//purl.org/marl/hasPolarity%3E%20%3Fpolarity%3B%20%3Chttp%3A//purl.org/marl/opinionText%3E%20%3Ftext%3B%7D";
}else{
	$query = "SELECT%20*%20WHERE%20%7B%5B%5D%20%3Chttp%3A//purl.org/dc/elements/1.1/title%3E%20%3Fcomp%3B%20%3Chttp%3A//purl.org/marl/hasPolarity%3E%20%3Fpolarity%3B%20%3Chttp%3A//purl.org/marl/opinionText%3E%20%3Ftext%3B%20FILTER%20regex%28%3Fcomp%2C%20%22".$filtro."%22%29%7D";
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
		$tweet['polarity']['value'] = substr($tweet['polarity']['value'], 24);
		$salida[$tweet['comp']['value']][$tweet['polarity']['value']][] = $tweet['text']['value'];		
}


//Segundo formateo de los datos adaptados al gráfico d3.js seleccionado
$colores = array('#819FF7','#81DAF5','#81F7D8','#BEF781','#F3F781','#F7BE81','#F78181','#F781BE','BE81F7');
//$colores = array('#A9A9F5','#A9E2F3','#A9F5E1','#BCF5A9','#F2F5A9','#F5D0A9','#F5A9A9','#F5A9F2','D0A9F5');
$indice_colores = 0;

$datos = array();
foreach(array_keys($salida) as $company){
	$a_comp = array();
	foreach(array_keys($salida[$company]) as $polarity){
		$a_pol = array();
		foreach($salida[$company][$polarity] as $tw){
			$a_pol[]=array('name'=>$tw,'colour'=>$colores[$indice_colores]);
		}
		$a_comp[] = array('name'=>$polarity,'children'=>$a_pol);
	}
	$datos[] = array('name'=>$company,'children'=>$a_comp);
	$indice_colores++;
	if ($indice_colores >= sizeof($colores))$indice_colores=0; 
}
print json_encode($datos);

?> 