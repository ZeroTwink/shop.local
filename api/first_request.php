<?php
include_once('../sys/inc/start.php');
$api = new API();


$categories_sex = [
    [4, 5],
    [0, 4, 8],
    [2, 3, 6]
];


$res = Db::me()->query("SELECT * FROM `gds` WHERE `archive` = 0 ORDER BY `time` DESC LIMIT 10");
$new_gds = $res->fetchAll();

$api->assign("gds_new", $new_gds);

$gds_city = [];
if(isset($_GET['city_id']) && !empty($_GET['city_id'])) {
    $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `city_id` = ? AND `category` = ? AND `id_user` != ? AND `archive` = 0 ORDER BY `id` DESC LIMIT 10");
    $res->execute([$_GET['city_id'], $categories_sex[$_GET['sex']][0], $user->id]);
    $gds_city = $res->fetchAll();

}
if(!$gds_city && isset($_GET['country_id']) && !empty($_GET['country_id'])) {
    $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `country_id` = ? AND `category` = ? AND `id_user` != ? AND `archive` = 0 ORDER BY `id` ASC LIMIT 10");
    $res->execute([$_GET['country_id'], $categories_sex[$_GET['sex']][0], $user->id]);
    $gds_city = $res->fetchAll();
}

if(!$gds_city && !empty($_GET['country_id'])) {
    $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `country_id` = ? AND `id_user` != ? AND `archive` = 0 ORDER BY `id`, `views` DESC LIMIT 10");
    $res->execute([$_GET['country_id'], $user->id]);
    $gds_city = $res->fetchAll();
}

if(!$gds_city) {
    $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id_user` != ? AND `archive` = 0 ORDER BY `views` DESC LIMIT 10");
    $res->execute([$user->id]);
    $gds_city = $res->fetchAll();
}

$api->assign("gds_city", $gds_city);

$categories = [];
//if(isset($_GET['sex'])) {
//    for($i = 0; $i < count($categories_sex[$_GET['sex']]); $i++) {
//        if(!isset($categories_sex[$_GET['sex']])) {
//            continue;
//        }
//
//        $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `category` = ? AND `archive` = 0 ORDER BY `id` DESC LIMIT 10");
//        $res->execute([$categories_sex[$_GET['sex']][$i]]);
//        $categories[$categories_sex[$_GET['sex']][$i]] = $res->fetchAll();
//    }
//}

for($i = 0; $i < 10; $i++) {
    $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `category` = ? AND `archive` = 0 ORDER BY `id` DESC LIMIT 10");
    $res->execute([$i]);
    $categories[$i] = $res->fetchAll();
}


if($user->ban && $user->ban < TIME) {
    $user->ban = 0;
}

$api->assign("categories", $categories);

$api->assign("user", $user->getUser());