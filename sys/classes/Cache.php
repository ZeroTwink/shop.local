<?php
/**
 * Абстрактный класс для кэширования произвольных данных.
 */
abstract class Cache
{
    static private
        $_data = array(),
        $_data_ttl = array(); // rollback, если модуль кэширования не установлен

    /**
     * Получение данных из кэша
     * @param string $key
     * @param mixed $default
     * @return mixed
     */

    static public function get($key, $default = null)
    {
        if (array_key_exists($key, self::$_data) && array_key_exists($key,
                self::$_data_ttl) && self::$_data_ttl[$key] > time()
        ) {
            return self::$_data[$key];
        }

        $data = array(
            'key' => $key,
            'content' => $default
        );
        return $data['content'];
    }

    /**
     * Запись данных в кэш
     * @param string $key
     * @param mixed $content
     * @param int $ttl
     * @return boolean
     */
    static public function set($key, $content, $ttl = 0)
    {
        $data = array(
            'key' => $key,
            'content' => $content,
            'ttl' => $ttl
        );
        
        self::$_data[$key] = $content;
        self::$_data_ttl[$key] = $ttl + time();
        
        return true;
    }

    /**
     * Очистка кэша
     * @param string $key
     * @return boolean
     */
    static public function clear($key)
    {
        $data = array(
            'key' => $key
        );
            unset(self::$_data[$key], self::$_data_ttl[$key]);
            
        return true;
    }
}