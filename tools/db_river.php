<?php
$dbh = "mysql:host=localhost;dbname=sohu";
$db = new PDO($dbh, 'root', 'root');
//$db->query("set character set 'UTF8'");
$db->query("set NAMES UTF8;");

//查询数据
$sql = "SELECT docno,url,contenttitle,content FROM news limit 10";
$sth = $db->query($sql);
while($row = $sth->fetch()){
    //    print_r($row);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $post_data=array();

    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    $output = curl_exec($ch);
}
print_r($sth);
$db = null;



?>
