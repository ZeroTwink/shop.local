<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['id'])) {
    exit;
}
$id = (int)$_GET['id'];

$page = $_GET['page'];
$offset = $page * 10;


$res = Db::me()->query("SELECT * FROM `gds` ORDER BY `time` DESC LIMIT $offset, 10");
$data = $res->fetchAll();

$api->assign("gds", $data);