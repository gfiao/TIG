<?php
$con = mysql_connect('localhost',"root","root");
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }

mysql_select_db("tig", $con);

mysql_query("DELETE FROM markers WHERE name='$_POST[name]'");

mysql_close($con);

header('location: http://localhost/TIG_Projecto/index.html');
?>