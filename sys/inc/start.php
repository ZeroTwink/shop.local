<?php
// Проверяем версию PHP
version_compare(PHP_VERSION, '7.1', '>=') or die('Требуется PHP >= 7.1');

require_once dirname(__FILE__) . '/initialization.php';
require_once dirname(__FILE__) . '/config.php';

header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Access-Control-Allow-Headers");

/*
 * Подгруска файла настрок
 */
//$sys = SysConfig::getInstance();

//print_r($_SERVER);

//$params = [];
//parse_str($_SERVER['QUERY_STRING'], $params);
//
//$sign_string = API_SECRET;
//foreach ($params as $name => $value) {
//    if (strpos($name, 'vk_') !== 0 || $name == "vk_sign") {
//        continue;
//    }
//    $sign_string .= $value;
//}
//
//$sign = rtrim(strtr(base64_encode(hash('sha256', $sign_string, true)), '+/', '-_'), '=');
//
//echo $sign;


if(!isset($_GET['viewer_id'])
    || !isset($_GET['access_token'])
    || !isset($_GET['signed_user_id'])
    || empty($_GET['viewer_id'])
    || empty($_GET['access_token'])) {
    header('Content-Type: application/json; charset=utf-8', true);
    $response = [];
    $response['error'] = [
        "type" => 1,
        "message" => 'Ошибка авторизации'
    ];

    echo Json::encode($response);
    exit;
}

$signed_user_id = rtrim(
    strtr(
        base64_encode(
            hash('sha256', API_ID . API_SECRET . $_GET['viewer_id'], true)
        ), '+/', '-_'
    ), '='
);

if ($_GET['signed_user_id'] != $signed_user_id) {
    header('Content-Type: application/json; charset=utf-8', true);
    $response = [];
    $response['error'] = [
        "type" => 1,
        "message" => 'Ошибка авторизации'
    ];

    echo Json::encode($response);
    exit;
}


$user = new User($_GET['viewer_id']);

if($user->id == false) {
    $res = Db::me()->prepare("INSERT INTO `users` (`id_vk`) VALUES (?)");
    $res->execute([$_GET['viewer_id']]);
    $id_user = Db::me()->lastInsertId();

    $user = new User($_GET['viewer_id']);
}


//ini_set('error_reporting', E_ALL);
//ini_set('display_errors', true);
