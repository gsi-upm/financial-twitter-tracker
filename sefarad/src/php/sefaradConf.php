<html>
<head>
<title>Selector de Widgets</title>
</head>
<body>
 <?php

	// Function for compress recursiverly one folder
	function Zip($source, $destination)
	{
		if (!extension_loaded('zip') || !file_exists($source)) {
	        echo 'Zip not loaded';
	        return false;
	    }

	    $zip = new ZipArchive();
	    if (!$zip->open($destination, ZIPARCHIVE::CREATE)) {
	        return false;
	    }

	    $source = str_replace('\\', '/', realpath($source));

	    if (is_dir($source) === true)
	    {
	        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source), RecursiveIteratorIterator::SELF_FIRST);

	        foreach ($files as $file)
	        {

	            $file = str_replace('\\', '/', $file);

	            // Ignore "." and ".." folders
	            if( in_array(substr($file, strrpos($file, '/')+1), array('.', '..')) )
	                continue;

	            $file = realpath($file);	            	        	

	            if (is_dir($file) === true)
	            {
	                $zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
	            }
	            else if (is_file($file) === true)
	            {	
	            	$dirname = basename(dirname($file));
	            	$extension = pathinfo($file, PATHINFO_EXTENSION);
	            	$filename = basename($file, '.'.$extension);

	            	// widgets/d3 && img/widgets select only checked widgets
	            	if((((strcmp($dirname,'d3')==0) or (strcmp($dirname,'widgets')==0))and !(in_array($filename, $_POST['widget']))) 
	            		or (strcmp(basename($file),'sefarad.html')==0)
	            		or (strcmp(basename($file),'index.html')==0)){	            		
	            			continue;
	            	} 

	            	if(strcmp(basename($file),'index_copia.html')==0){
						$zip->addFromString('index.html', file_get_contents($file));
						unlink($file);
						continue;
	            	}

	     //        	if(strcmp(basename($file),'demo.html')==0){
						// continue;
	     //        	}
	            	
	            	$zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
	            	         
	            }
	        }
	    }
	    else if (is_file($source) === true)
	    {
	        $zip->addFromString(basename($source), file_get_contents($source));
	    }

	    return $zip->close();
	}

	function includeWidgets($widgetsFile, $sourceFile, $destinationFile)
	{

		// Update widgets to the html file.
		$string1 = "";
		$string2 = "\t\t<script type=\"text/javascript\">\n\t\t\tvar widgetX = [";
		$finalString = "";

		//$wf = fopen ($widgetsFile, 'r' );

		$data = file_get_contents($widgetsFile);

		$widgets = split(",",$data);

		foreach($widgets as $item){
			if(!strcmp(basename($item),'')==0){
				$string1 = $string1 . "\t\t<script type=\"text/javascript\" src=\"js/widgets/d3/" . $item . "\"></script>\n";
				$string2 = $string2 . $item . ', ';
			}			
		};	

		$string2 = substr($string2, 0, (strlen($string2) - 2));
		$string2 = $string2 . "];\n\t\t</script>\n\t";

		//fclose ( $wf );	

		$data = file_get_contents($sourceFile);

		$headPosition = (strrpos($data, ('<head>')) + strlen('<head>') + 1);

		$finalString = substr($data, 0, $headPosition);			
		$finalString = $finalString . $string1;
		$finalString = $finalString . $string2;
		$finalString = $finalString . substr($data, $headPosition + 1, strlen($data));

		$index = fopen ($destinationFile, 'w' );

		fwrite($index, $finalString);	

		fclose($index);
	}

	// Write widgets.txt file and update/delete necessary files
	$fp = fopen ('widgets.txt', 'w' );

	if(!empty($_POST['widget'])) {
		foreach($_POST['widget'] as $widget) {
			//echo ('<p>' . $widget . ' checked</p>');
			fwrite ( $fp, $widget . ".js," );
		}
	} else {
		echo '<p>Nothing Checked</p>';
	}
	
	fclose ( $fp );

	// $salida = shell_exec('grunt php');
	includeWidgets('widgets.txt','../sefarad.html','../index_copia.html');

	// Create the zip file and force download
	$zipFile = 'sefarad.zip';

	Zip('../',$zipFile);

	if (file_exists($zipFile)) {
	    header('Content-Description: File Transfer');
	    header('Content-Type: application/force-download');
	    header('Content-Disposition: attachment; filename='.basename($zipFile));
	    header('Expires: 0');
	    header('Cache-Control: must-revalidate');
	    header('Pragma: public');
	    header('Content-Length: ' . filesize($zipFile));
	    ob_clean();
	    flush();
	    readfile($zipFile);	    
	}

	if (file_exists($zipFile)) {
		unlink($zipFile);		
	}	

	// Redirigir
	//header('Location: ../index.html');

	exit;	
 ?>
 </body>
</html>	