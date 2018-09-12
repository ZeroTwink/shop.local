<?php
include_once('../sys/inc/start.php');
$api = new API();


$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ?");
$res->execute([$_GET['id']]);
$data = $res->fetchAll();

$api->assign("product", $data);