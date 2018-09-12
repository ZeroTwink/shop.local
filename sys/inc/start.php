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

//if(!isset($_GET['viewer_id']) || !isset($_GET['access_token']) || !isset($_GET['auth_key'])) {
//    exit;
//}
//
//$auth_key = md5(API_ID . '_' . $_GET['viewer_id'] . '_' . API_SECRET);
//
//if($_GET['auth_key'] != $auth_key) {
//    exit;
//}
//
//$user = new User($_GET['viewer_id']);
//
//if($user->id == false) {
//    $res = Db::me()->prepare("INSERT INTO `users` (`id_vk`) VALUES (?)");
//    $res->execute([$_GET['viewer_id']]);
//    $id_user = Db::me()->lastInsertId();
//
//    $user = new User($_GET['viewer_id']);
//}


ini_set('error_reporting', E_ALL);
ini_set('display_errors', true);
