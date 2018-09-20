<?php
include_once('../sys/inc/start.php');
$api = new API();


$res = Db::me()->query("SELECT * FROM `gds` ORDER BY `time` DESC LIMIT 8");
$new_gds = $res->fetchAll();

$api->assign("gds_new", $new_gds);


if(isset($_GET['city_id']) && !empty($_GET['city_id'])) {
    $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `city_id` = ? ORDER BY `time` DESC LIMIT 10");
    $res->execute([$_GET['city_id']]);
    $gds_city = $res->fetchAll();

    if(count($gds_city) < 6 && isset($_GET['country_id']) && !empty($_GET['country_id'])) {
        $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `country_id` = ? ORDER BY `time` ASC LIMIT 10");
        $res->execute([$_GET['country_id']]);
        $gds_city = $res->fetchAll();
    }

    $api->assign("gds_city", $gds_city);
}