<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['page'])) {
    $error = [
        "type" => 1,
        "message" => "Ошибка выбора навигации"
    ];
    $api->assign("error", $error);
    exit;
}

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

$remove_arr = [];

for($i = 0; $i < count($arr); $i++) {
    $del = true;
    for($j = 0; $j < count($new_gds); $j++) {
        if($arr[$i] == $new_gds[$j]['id']) {
            $del = false;
            break;
        }
    }
    if($del) {
        $remove_arr[] = $arr[$i];
    }
}

for($i = 0; $i < count($remove_arr); $i++) {
    $key = array_search($remove_arr[$i], $favorites);
    if($key === false || $key === null) {
        continue;
    }

    unset($favorites[$key]);
}

$user->favorites = join(",", $favorites);

if($remove_arr) {
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
}


$api->assign("gds", $new_gds);
$api->assign("remove_arr", $remove_arr);