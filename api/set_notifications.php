<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['type']) || empty($_GET['type']) || !isset($_GET['set'])) {
    $error = [
        "type" => 2,
        "message" => "Не верные параметры"
    ];
    $api->assign("error", $error);
    exit;
}

switch($_GET['type']) {
    case "all" :
        $user->set_notifications = $_GET['set'] > 0? 1 : 0;
        break;
    case "delete" :
        $user->set_notifi_delete = $_GET['set'] > 0? 1 : 0;
        break;
    case "edit" :
        $user->set_notifi_edit = $_GET['set'] > 0? 1 : 0;
        break;
    case "archive" :
        $user->set_notifi_archive = $_GET['set'] > 0? 1 : 0;
        break;
    case "system" :
        $user->set_notifi_system = $_GET['set'] > 0? 1 : 0;
        break;
}