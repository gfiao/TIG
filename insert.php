<?php

require("login.php");
$con=mysql_connect ('localhost', $username, $password);
if (!$con)
{
die('Could not connect: ' . mysql_error());
}

mysql_select_db($database, $con);

$sql="INSERT INTO markers (type, city, name, lat, lng, price, opening, closing, description)
VALUES
('$_POST[type]','$_POST[city]','$_POST[name]','$_POST[lat]', '$_POST[lng]', '$_POST[price]', '$_POST[opening]', '$_POST[closing]', '$_POST[description]')";

if (!mysql_query($sql,$con))
{
die('Error: ' . mysql_error());
}

mysql_close($con);

header('location: http://localhost/TIG_Projecto/index.html');

exit;

?>