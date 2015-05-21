<?php

require("login.php");
$con=mysql_connect ('localhost', $username, $password);
if (!$con)
{
die('Could not connect: ' . mysql_error());
}

mysql_select_db($database, $con);

$sql="UPDATE markers SET Type='$_POST[type]', Name='$_POST[name]', Price='$_POST[price]',
      Opening='$_POST[opening]', Closing='$_POST[closing]', Description='$_POST[description]' WHERE Name='$_POST[name]'";

if (!mysql_query($sql,$con))
{
die('Error: ' . mysql_error());
}

mysql_close($con);

header('location: http://localhost/TIG/index.html');

exit;

?>