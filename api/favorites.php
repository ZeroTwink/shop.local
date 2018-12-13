<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['id']) || !isset($_GET['type'])) {
    $api->assign("error", ['type' => 1, 'message' => 'Некорректные параметры']);
    exit;
}

if($_GET['type'] != 'add' && $_GET['type'] != 'remove') {
    $api->assign("error", ['type' => 1, 'message' => 'Некорректные параметры']);
    exit;
}

$id = (int)$_GET['id'];

$favorites = explode(",", $user->favorites);

$c_favorites = count($favorites);


$key = array_search($id, $favorites);
if($key !== false && $key !== null) {
    $_GET['type'] = "remove";
}


if(isset($_GET['type']) && $_GET['type'] == "add") {
    if($c_favorites >= 250) {
        $api->assign("error", ['type' => 2, 'message' => 'У вас слишком много в избранном']);
        exit;
    }

    if($user->favorites == "") {
        $user->favorites = $id;
    } else {
        $user->favorites = $user->favorites . "," . $id;
    }

    $res = Db::me()->query("UPDATE `gds` SET `favorites` = `favorites` + 1 WHERE `id` = $id");
}

if(isset($_GET['type']) && $_GET['type'] == "remove") {
    $key = array_search($id, $favorites);
    if($key === false || $key === null) {
        exit;
    }

    unset($favorites[$key]);

    $user->favorites = join(",", $favorites);

    $res = Db::me()->query("UPDATE `gds` SET `favorites` = `favorites` - 1 WHERE `id` = $id");
}
