<?php

require("login.php");
$con=mysql_connect ('localhost', $username, $password);
if (!$con)
{
die('Could not connect: ' . mysql_error());
}

mysql_select_db($database, $con);

$sql="select password from admin where username='$_POST[username]' and password='$_POST[password]'";

if (!mysql_query($sql,$con))
{
die('Error: ' . mysql_error());
}

echo mysql_fetch_array(mysql_query($sql))[0];


mysql_close($con);

//header('location: http://localhost/TIG_Projecto/index.html');

exit;

?>