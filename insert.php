<?php

require("login.php");
$con=mysql_connect ('localhost', $username, $password);
if (!$con)
{
die('Could not connect: ' . mysql_error());
}

mysql_select_db($database, $con);


$sqlCity = "select city from cities where city='$_POST[city]'";
$cityRes = mysql_query($sqlCity, $con);

if (mysql_num_rows($cityRes)==0) {
   $sqlNewCity="INSERT INTO cities (city)
   VALUES
   ('$_POST[city]')";

   mysql_query($sqlNewCity,$con);
}

$sql="INSERT INTO markers (type, city, name, lat, lng, price, opening, closing, description)
VALUES
('$_POST[type]','$_POST[city]','$_POST[name]','$_POST[lat]', '$_POST[lng]', '$_POST[price]', '$_POST[opening]', '$_POST[closing]', '$_POST[description]')";

if (!mysql_query($sql,$con))
{
echo $_POST[city];
die('Error: ' . mysql_error());
}

mysql_close($con);

header('location: http://localhost/TIG/index.html');

exit;

?>

