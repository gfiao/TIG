<?php

require("login.php");

// Start XML file, create parent node

$dom = new DOMDocument("1.0");
$node = $dom->createElement("types");
$parnode = $dom->appendChild($node);

// Opens a connection to a MySQL server

$connection=mysql_connect ('localhost', $username, $password);
$result = mysql_query('SET NAMES utf8');
$result = mysql_query('SET CHARACTER SET utf8');
if (!$connection) {  die('Not connected : ' . mysql_error());}

// Set the active MySQL database

$db_selected = mysql_select_db($database, $connection);
if (!$db_selected) {
  die ('Can\'t use db : ' . mysql_error());
}

// Select all the rows in the types table

$query = "SELECT * FROM types WHERE 1";
$result = mysql_query($query);
if (!$result) {
  die('Invalid query: ' . mysql_error());
}

header("Content-type: text/xml");

// Iterate through the rows, adding XML nodes for each

while ($row = @mysql_fetch_assoc($result)){
  // ADD TO XML DOCUMENT NODE
  $node = $dom->createElement("type");
  $newnode = $parnode->appendChild($node);
  $newnode->setAttribute("type",$row['type']);
}

echo $dom->saveXML();

?>