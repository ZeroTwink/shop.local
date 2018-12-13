<?php

/**
 * Класс для формирования HTML документа.
 */
class API
{
    protected $_assigned = array(); // переменные, которые будут переданы в шаблон

    function __construct($group = 0)
    {

    }

    /**
     * Установка переменной в шаблон
     * @param string $name Ключ переменной
     * @param mixed $value Значение
     */
    public function assign($name, $value = null)
    {
        if (is_array($name)) {
            foreach ($name as $key => $value) {
                $this->assign($key, $value);
            }
            return;
        }

        if (is_scalar($name)) {
            $this->_assigned[$name] = $value;
        }
    }

    /**
     * Формирование HTML документа и отправка данных браузеру
     */
    private function output()
    {
        header('Cache-Control: no-store, no-cache, must-revalidate', true);
        header('Expires: ' . date('r'), true);
        header('Content-Type: application/json; charset=utf-8', true);
//        header("Access-Control-Allow-Origin: *");

        $response = [
            "response" => []
        ];

        if(isset($this->_assigned['error'])) {
            $response = [];
            $response['error'] = [
                "type" => isset($this->_assigned['error']['type']) ? $this->_assigned['error']['type'] : 1,
                "message" => isset($this->_assigned['error']['message']) ? $this->_assigned['error']['message'] : 'Возникла ошибка',
                "importance" => isset($this->_assigned['error']['importance'])? $this->_assigned['error']['importance'] : 0
            ];

            echo Json::encode($response);

            return;
        }

        foreach ($this->_assigned as $key => $value) {
            $this->assign($key, $value);
            $response['response'][$key] = $value;
        }

        echo Json::encode($response);
    }

    /**
     * То что срабатывает при exit
     */
    function __destruct()
    {
        $this->output();
    }
}