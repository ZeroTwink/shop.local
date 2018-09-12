<?php

/**
 * @const TIME_START Время запуска скрипта в миллисекундах
 */
define('TIME_START', microtime(true)); // время запуска скрипта

/**
 * @const DCMS Метка о DCMS
 */
define('DCMS', true);

/**
 * @const AJAX скрипт вызван AJAX запросом
 */
define('AJAX', strtolower(@$_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');

/**
 * @const IS_WINDOWS Запущено ли на винде
 */
if (!defined('IS_WINDOWS')) {
    define('IS_WINDOWS', strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');
}

// устанавливаем Московскую временную зону по умолчанию
if (function_exists('ini_set')) {
    ini_set('date.timezone', 'Europe/Moscow');
}

/**
 * @const H путь к корневой директории сайта
 */
if (file_exists($_SERVER ['DOCUMENT_ROOT'] . '/sys/classes/API.php')) {
    define('H', $_SERVER ['DOCUMENT_ROOT']); // корневая директория сайта
} else {
    /* Если $_SERVER ['DOCUMENT_ROOT'] не является корневой директорией сайта, то будем искать ее вручную */

    $rel_path = '';
    $searched_file = '/sys/classes/API.php';
    for ($i = 0; $i < 10; $i++) {
        if (file_exists($rel_path . $searched_file)) {
            $abs_path = realpath($rel_path . $searched_file);
            break;
        }
        $rel_path .= '../';
    }
    define('H', str_replace($searched_file, '', str_replace('\\', '/', $abs_path))); // корневая директория сайта
    unset($rel_path, $searched_file, $abs_path);
}


/**
 * @const TIME UNIXTIMESTAMP 
 */
define('TIME', time() - 3600);
/**
 * @const DAY_TIME UNIXTIMESTAMP на начало текущих суток
 */
define('DAY_TIME', mktime(0, 0, 0));
/**
 * @const IS_MAIN true, если мы на главной странице
 */
define('IS_MAIN', $_SERVER['SCRIPT_NAME'] == '/index.php');
/**
 * @const SESSION_LIFE_TIME время жизни сессии, а также время последней активности пользователей, считающихся онлайн
 */
define('SESSION_LIFE_TIME', 600);
/**
 * @const SESSION_NAME имя сессии
 */
define('SESSION_NAME', 'ANIME_SESSION');
/**
 * @const SESSION_ID_USER ключ сессий, в котором хранится идентификатор пользователя
 */
define('SESSION_ID_USER', 'SESSION_ID_USER');
/**
 * @const SESSION_PASSWORD_USER ключ сессий, в котором хранится пароль пользователя
 */
define('SESSION_PASSWORD_USER', 'SESSION_PASSWORD_USER');
/**
 * @const COOKIE_ID_USER идентификатор пользователя в COOKIE
 */
define('COOKIE_ID_USER', 'COOKIE_ID_USER');
/**
 * @const COOKIE_USER_PASSWORD пароль пользователя в COOKIE
 */
define('COOKIE_USER_PASSWORD', 'COOKIE_USER_PASSWORD');


if (@function_exists('ini_set')) {
    // время жизни сессии
    ini_set('session.cache_expire', SESSION_LIFE_TIME);

    // игнорировать повторяющиеся ошибки
    ini_set('ignore_repeated_errors', true);

    // показываем только фатальные ошибки
    ini_set('error_reporting', E_ERROR);

    // непосредственно, включаем показ ошибок
    ini_set('display_errors', true);
}

if (version_compare(PHP_VERSION, '5.4', '<=')){
    // Исправлет ошибку php с удалением объектов, содержащих перекрестные ссылки. (Fatal error :  Exception thrown without a stack frame Unknown on line 0)
    function shutdown()
    {
        if (@function_exists('ini_set')) {
            // Выключаем отображение ошибок перед завершением работы скрипта.
            ini_set('display_errors', false);
        }
    }
    register_shutdown_function('shutdown');
}

/**
 * @const URL текущая страница.
 */
define('URL', urlencode($_SERVER ['REQUEST_URI']));

if (function_exists('mb_internal_encoding')) {
    // Выставляем кодировку для mb_string  
    mb_internal_encoding('UTF-8');
}

if (function_exists('iconv')) {
    // Выставляем кодировку для Iconv
    iconv_set_encoding('internal_encoding', 'UTF-8');
}

/**
 * автоматическая загрузка классов
 * @param string $class_name имя класса
 */
function animeAutoload($class_name) {
    $path = H . '/sys/classes/' . $class_name . '.php';
    if (file_exists($path)) {
        include_once ($path);
    }
}

spl_autoload_register('animeAutoload');

/**
 * Генератор пароля
 * @param int $len Длина пароля
 * @return string
 */
function passgen($len = 32) {
    $password = '';
    $small = 'abcdefghijklmnopqrstuvwxyz';
    $large = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $numbers = '1234567890';
    for ($i = 0; $i < $len; $i++) {
        switch (mt_rand(1, 3)) {
            case 3 :
                $password .= $large [mt_rand(0, 25)];
                break;
            case 2 :
                $password .= $small [mt_rand(0, 25)];
                break;
            case 1 :
                $password .= $numbers [mt_rand(0, 9)];
                break;
        }
    }
    return $password;
}

@session_name(SESSION_NAME) or die('Невозможно инициализировать сессии');
@session_start() or die('Невозможно инициализировать сессии');
/**
 * @const SESS Идентификатор сессии
 */
define('SESS', preg_replace('#[^a-z0-9]#i', '', session_id()));