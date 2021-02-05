<?php
$myPost = file_get_contents('php://input');
$myFile = fopen('imageData.json', 'w');
fwrite($myFile,$myPost);
fclose($myFile);
// JSON decodieren
//$json = json_decode($myPost);
// in JSON umwandeln
//echo json_encode($json);
echo $myPost;
?>
