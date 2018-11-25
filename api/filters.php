<?php
include_once('../sys/inc/start.php');
$api = new API();

$words = urldecode($_GET['search']);

$search_array = preg_split('#\s+#u', $words);

if(count($search_array) > 4) {
    $search_array = array_slice($search_array, 0, 4);
}

$words_search = [];
$replace = [];
$sorting = "`id` DESC";

for ($i = 0; $i < count($search_array); $i++) {
    $word = $search_array[$i];

    $word = preg_replace('#[^a-zа-я0-9]#ui', '', $word);

    if(Text::strlen($word) < 3) {
        continue;
    }

    $words_search[] = $word;
}

$where = [];

if(count($words_search)) {
    if(count($words_search) < 2) {
        $word = $words_search[0] . '*';
        $words_search = [];
        $words_search[0] = $word;
    }

    $where[] = "MATCH(title) AGAINST(? IN BOOLEAN MODE)";
    $replace[] = implode(" ", $words_search);
}

if(isset($_GET['category']) && !empty($_GET['category'])) {
    $category = (int)$_GET['category'];

    $where[] = "`category` = ?";
    $replace[] = $category;
}

if(isset($_GET['subcategory']) && !empty($_GET['subcategory'])) {
    $subcategory = (int)$_GET['subcategory'];

    $where[] = "`subcategory` = ?";
    $replace[] = $subcategory;
}

if(isset($_GET['country_id']) && !empty($_GET['country_id'])) {
    $country_id = (int)$_GET['country_id'];

    $where[] = "`country_id` = ?";
    $replace[] = $country_id;
}

if(isset($_GET['city_id']) && !empty($_GET['city_id']) && $_GET['city_id']) {
    $city_id = (int)$_GET['city_id'];

    $where[] = "`city_id` = ?";
    $replace[] = $city_id;
}

if(isset($_GET['state']) && !empty($_GET['state'])) {
    $state = (int)$_GET['state'];

    $where[] = "`state` = ?";
    $replace[] = $state;
}

if(isset($_GET['sorting']) && !empty($_GET['sorting'])) {
    $type_sorting = (int)$_GET['sorting'];

    if($type_sorting == 1) {
        $sorting = "`price` ASC";
    } elseif($type_sorting == 2) {
        $sorting = "`price` DESC";
    } elseif($type_sorting == 3) {
        $sorting = "`time` DESC";
        $sorting_two = "`tmp`.`price` ASC";
    } elseif($type_sorting == 4) {
        $sorting = "`time` DESC";
        $sorting_two = "`tmp`.`price` DESC";
    }
}

$page = $_GET['page'];
$offset = $page * 10;

if(isset($sorting_two)) {
    $res = Db::me()->prepare("
      SELECT * FROM (SELECT * FROM `gds` 
      WHERE ".implode("AND ", $where)." AND `archive` = 0 ORDER BY $sorting LIMIT 100
    ) AS tmp ORDER BY $sorting_two");
    $res->execute($replace);
    $search = $res->fetchAll();
} else {
    $res = Db::me()->prepare("SELECT * FROM `gds` 
    WHERE ".implode("AND ", $where)." AND `archive` = 0 ORDER BY $sorting LIMIT $offset, 10");
    $res->execute($replace);
    $search = $res->fetchAll();
}

$api->assign("gds", $search);