<?php
include_once('../sys/inc/start.php');
$api = new API();

$page = $_GET['page'];
$offset = $page * 10;

$favorites = explode(",", $user->favorites);

$arr = [];

for($i = $offset; $i < $offset + 10; $i++) {
    if(!isset($favorites[$i])) {
        break;
    }
    $arr[] = $favorites[$i];
}

$place_holders = implode(',', array_fill(0, count($arr), '?'));

$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` IN($place_holders) ORDER BY `id` DESC");
$res->execute($arr);
$new_gds = $res->fetchAll();

$api->assign("gds", $new_gds);