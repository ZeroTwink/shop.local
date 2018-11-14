<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['type']) || empty($_GET['type'])) {
    $error = [
        "type" => 2,
        "message" => "Не верные параметры"
    ];
    $api->assign("error", $error);
    exit;
}


$notifications = [
    "items" => [],
    "new" => 0
];

if($user->notifications) {
    $notifications = Json::decode($user->notifications);
}

if($_GET['type'] == 'reset_new') {
    $notifications['new'] = 0;
}

//if($_GET['type'] == 'add') {
//    if(!isset($_GET['text']) || empty($_GET['text'])) {
//        $error = [
//            "type" => 2,
//            "message" => "Не верные параметры"
//        ];
//        $api->assign("error", $error);
//        exit;
//    }
//
//    $n = [
//        "text" => Text::substr($_GET['text'], 60)
//    ];
//
//    if(isset($_GET['link']) && empty($_GET['link'])) {
//        $n['link'] = $_GET['link'];
//    }
//    if(isset($_GET['button']) && empty($_GET['button'])) {
//        $n['button'] = $_GET['button'];
//    }
//
//    if (count($notifications['items']) >= 20) {
//        array_pop($notifications['items']);
//    }
//
//    array_unshift($notifications['items'], $n);
//
//    $notifications['new'] += 1;
//}
//
//print_r($notifications);

$user->notifications = Json::encode($notifications);