<?php
abstract class Valid {
    /**
     * Проверка на соответствие логину skype
     * @param string $skype
     * @return boolean
     */
    static function skype($skype) {
        if (preg_match("#^[a-z][a-z0-9_\-\.]{5,31}$#ui", $skype))
            return true;
    }
    
    static function telnumber($login) {
        if (preg_match('#^\+?([0-9]+)$#', $login, $m)) {
            return '+' . $m[1];
        }
        return $login;
    }
    
    /**
     * Проверяет на возможность использования строки в качестве ника
     * @param string $nick
     * @return boolean
     */
    static function nick($nick) {
        // проверка на длину логина и возможные символы
        if (!preg_match("#^[a-zа-яё][a-zа-яё0-9\-\_\ ]{2,31}$#ui", $nick)) {
            return false;
        }
        // запрещаем одновременное использование русского и английского алфавилов
        if (preg_match("#[a-z]+#ui", $nick) && preg_match("#[а-яё]+#ui", $nick)) {
            return false;
        }
        // пробелы вначале или конце ника недопустимы
        if (preg_match("#(^\ )|(\ $)#ui", $nick)) {
            return false;
        }
        return true;
    }
    
    /**
     * Проверка на соответствие email
     * @param string $mail
     * @return boolean
     */
    static function mail($mail) {
        if (preg_match('#^[a-z0-9\-\._]+\@([a-z0-9-_]+\.)+([a-z0-9]{2,4})\.?$#ui', $mail))
            return true;
    }

    /**
     * Проверяет на соответствие паролю
     * @param string $pass
     * @return boolean
     */
    static function password($pass) {
        if (preg_match("#^[a-zа-яё0-9\-\_\ ]{6,32}$#ui", $pass)) {
            return true;
        }
    }

    /**
     * Проверка ника на подозрительность
     * @param string $str
     * @return boolean
     */
    static function suspicion($str) {
        // три и более согласных подряд
        if (preg_match('#[БВГДЖЗКЛМНПРСТФХЦЧШЩBCDFGHJKLMNPQRSTVXZ]{4,}#ui', $str, $m)) {
            return $m[0];
        }

        // повторение одного символа или выражения более 3-х раз подряд
        if (preg_match('#([[:alpha:]]+)\1{2,}#ui', $str)) {
            return $m[0];
        }

        return false;
    }
}

