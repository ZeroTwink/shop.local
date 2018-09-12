<?php

/*
  Класс для подключения к БД
  Можно использовать в любом месте движка
  $db = Db::me();
 */

class Db
{
    static protected $_pdo_instance;

    /**
     * @return \PDO
     * @throws \Exception
     */
    static public function me()
    {
        try {
            if (is_null(self::$_pdo_instance)) {
                if (!class_exists('pdo')) throw new \Exception("Отсутствует драйвер PDO");
                    self::$_pdo_instance = new \PDO('mysql:host=localhost;dbname=board','board','ZeroStart007911');

                self::$_pdo_instance->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
                self::$_pdo_instance->query("SET NAMES utf8;");
            }
        } catch (Exception $exc) {
            echo $exc->getMessage();
        }


        return self::$_pdo_instance;
    }

    static public function isConnected()
    {
        return !is_null(self::$_pdo_instance);
    }

    protected function __construct()
    {

    }
}