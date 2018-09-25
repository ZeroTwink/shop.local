<?php
include_once('../sys/inc/start.php');
$api = new API();

$page = $_GET['page'];
$offset = $page * 10;

$id = (int)$_GET['id'];

$res = Db::me()->query("SELECT * FROM `gds` WHERE `id_vk` = $id ORDER BY `time` DESC LIMIT $offset, 10");
$new_gds = $res->fetchAll();

$api->assign("gds", $new_gds);