<?php
// Проверяем версию PHP
version_compare(PHP_VERSION, '7.1', '>=') or die('Требуется PHP >= 7.1');

require_once dirname(__FILE__) . '/initialization.php';
require_once dirname(__FILE__) . '/config.php';

header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Access-Control-Allow-Headers");

if(!isset($_GET['access_token']) || empty($_GET['access_token'])) {
    header('Content-Type: application/json; charset=utf-8', true);
    $response = [];
    $response['error'] = [
        "type" => 1,
        "message" => 'Ошибка авторизации'
    ];

    echo Json::encode($response);
    exit;
}

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


$query_params = [];
parse_str($_SERVER['QUERY_STRING'], $query_params); // Получаем query-параметры из URL

$sign_params = [];
foreach ($query_params as $name => $value) {
    if (strpos($name, 'vk_') !== 0) { // Получаем только vk параметры из query
        continue;
    }

    $sign_params[$name] = $value;
}

ksort($sign_params); // Сортируем массив по ключам
$sign_params_query = http_build_query($sign_params); // Формируем строку вида "param_name1=value&param_name2=value"
$sign = rtrim(strtr(base64_encode(hash_hmac('sha256', $sign_params_query, API_SECRET, true)), '+/', '-_'), '='); // Получаем хеш-код от строки, используя защищеный ключ приложения. Генерация на основе метода HMAC.


$vk_sign = isset($_GET['vk_sign'])? $_GET['vk_sign'] : $_GET['sign'];

if ($vk_sign != $sign) {
    header('Content-Type: application/json; charset=utf-8', true);
    $response = [];
    $response['error'] = [
        "type" => 1,
        "message" => 'Ошибка авторизации'
    ];

    echo Json::encode($response);
    exit;
}


$user = new User($_GET['vk_user_id']);

if($user->id == false) {
    $res = Db::me()->prepare("INSERT INTO `users` (`id_vk`) VALUES (?)");
    $res->execute([$_GET['vk_user_id']]);
    $id_user = Db::me()->lastInsertId();

    $user = new User($_GET['vk_user_id']);
}


//ini_set('error_reporting', E_ALL);
//ini_set('display_errors', true);
