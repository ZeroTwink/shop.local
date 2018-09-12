<?php

/**
 * Шифрование и хэширование данных
 */
abstract class Crypt {
    /**
     * делаем хэш пароля с наложением соли (покажем большой куй всем сервисам с md5 базами)
     * @param string $pass Исходный пароль
     * @param string $salt Соль
     * @return string Хэш пароля
     */
    static function hash($pass, $salt = '28N7QM55MZRcQ4a2Jv1J5Pg22LuzXsU3')
    {
        return md5($salt . md5((string) $pass) . md5($salt) . $salt);
    }

    /**
     * Шифрование данных указанным ключем
     * @param string $str Исходная строка
     * @param string $key Ключ
     * @return string Шифрованные данные
     */
    static function encrypt($str)
    {
        return base64_encode(base64_encode($str));
    }

    /**
     * Расшифровка данных указанным ключем
     * @param string $str Шифрованная строка
     * @param string $key Ключ
     * @return string Исходные данные
     */
    static function decrypt($str)
    {
        return base64_decode(base64_decode($str));
    }

}