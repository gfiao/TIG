<?php

require("login.php");
$con=mysql_connect ('localhost', $username, $password);
if (!$con)
{
die('Could not connect: ' . mysql_error());
}

mysql_select_db($database, $con);

$sql="INSERT INTO markers (name, lat, lng, type)
VALUES
('$_POST[name]','$_POST[lat]','$_POST[lng]','$_POST[type]')";

if (!mysql_query($sql,$con))
{
die('Error: ' . mysql_error());
}

mysql_close($con);

header('location: http://localhost/lab5.html');

exit;

?>