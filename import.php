<?php

require("login.php");
$con=mysql_connect ('localhost', $username, $password);
if (!$con)
{
die('Could not connect: ' . mysql_error());
}

mysql_select_db($database, $con);

/*
    Verifica se este marcador já existe
    Se existir, termina o script
*/
$sqlId = "select id from markers where id='$_POST[id]'";
$idRes = mysql_query($sqlId, $con);

if (mysql_num_rows($idRes) != 0) {
    header('location: http://localhost/TIG/index.html');
    exit;
}

/*
    Verifica se a cidade existe na tabela 'cities'
    Se não existir, insere primeiro um tuplo em cities, com a nova cidade
    Caso contrário insere logo o marcador na tabela markers
*/
$sqlCity = "select city from cities where city='$_POST[city]'";
$cityRes = mysql_query($sqlCity, $con);

if (mysql_num_rows($cityRes)==0) {
   $sqlNewCity="INSERT INTO cities (city)
   VALUES
   ('$_POST[city]')";

   mysql_query($sqlNewCity,$con);
}

$sql="INSERT INTO markers (id, type, city, name, lat, lng, price, opening, closing, description)
VALUES
('$_POST[id]', '$_POST[type]','$_POST[city]','$_POST[name]','$_POST[lat]', '$_POST[lng]', '$_POST[price]', '$_POST[opening]', '$_POST[closing]', '$_POST[description]')";

if (!mysql_query($sql,$con))
{
echo $_POST[city];
die('Error: ' . mysql_error());
}

mysql_close($con);

header('location: http://localhost/TIG/index.html');

exit;

?>

