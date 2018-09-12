<?php
/*
 * Базовый класс системы. Объект хранится в глобальной переменной $sys
 * integer drawing_open - Конкурс открыт или закрыт
 * integer drawing_start_vote - Конкурс рисунков открыть голосование
 */
class SysConfig {
    static protected $_instance = null;
    protected $_data = array();
    
    protected function __construct()
    {
        // загрузка настроек
        $this->_loadSettings();
    }
    
    /**
     * @return SysConfig
     */
    public static function getInstance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }
    
    protected function _loadSettings()
    {
        $this->_data = Json::decode(file_get_contents(H . "/sys/settings/settings.json"));
    }
    
    public function __get($name)
    {
        return empty($this->_data[$name]) ? false : $this->_data[$name];
    }
    
    public function __set($name, $value)
    {
        $this->_data[$name] = $value;
    }
    
    public function saveSettings()
    {
        file_put_contents(H . "/sys/settings/settings.json", Json::encode($this->_data));
    }
}