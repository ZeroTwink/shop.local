<?php
include_once('../sys/inc/start.php');
$api = new API();


$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id_user` = ?");
$res->execute([1]);
$data = $res->fetchAll();

$api->assign("gds", $data);