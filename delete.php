<?php
$con = mysql_connect('localhost',"root","root");
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }

mysql_select_db("projecto_tig", $con);

mysql_query("DELETE FROM markers WHERE id='$_POST[id]'");

mysql_close($con);

header('location: http://localhost/TIG/index.html');
?>