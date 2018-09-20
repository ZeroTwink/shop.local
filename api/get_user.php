<?php
include_once('../sys/inc/start.php');
$api = new API();

$api->assign("user", $user->getUser());