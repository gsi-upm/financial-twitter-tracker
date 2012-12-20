<HTML><HEAD><script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script><script type="text/javascript" src="https://www.google.com/jsapi"></script><script type="text/javascript" id="sgvzlr_script" src="http://sgvizler.googlecode.com/svn/release/0.5/sgvizler.js"></script><script type="text/javascript">$(document).ready(sgvizler.go());</script></HEAD><BODY>

<div id="widget">
<?
global $_GET;
$endpoint = $_GET['endpoint'];
$query = $_GET['query'];


if($endpoint){

$graph = '<div id="sgv" data-sgvizler-endpoint="'.$endpoint.'"data-sgvizler-query="SELECT ?value WHERE {?s <http://www.gsi.dit.upm.es/province> ?value} ORDER BY ?value" data-sgvizler-chart="gPieChart" data-sgvizler-loglevel="0" data-sgvizler-chart-options="is3D=true|title=Number of instances" style="width:300px; height:200px;"></div>';

echo $graph;
}
?>
</div>
</BODY></HTML>