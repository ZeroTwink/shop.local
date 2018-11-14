<?php

/**
 * Пользователь
 * @property int id Уникальный идентификатор пользователя
 */
class User
{
    protected $_update = array();
    protected $_data = array();
    protected $_id = 0;
    protected $_id_vk = 0;

    /**
     * @param boolean|int|array $id_or_arrayToCache Идентификатор пользователя или массив идентификаторов  для запроса из базы и помещения в кэш
     */
    function __construct($id_vk = false, $use_cache = true)
    {
        $this->_id = 0;
        $this->_id_vk = (int) $id_vk;

        if($id_vk === false) {
            $this->_initGuest();
            return;
        }
        
        if($this->_id_vk === 0) {
            $this->_initBot();
            return;
        }
        
        if (!$use_cache) {
            $this->_getUserDataFromBase();
        } else {
            try {
                $this->_getUserDataFromCache();
            } catch (Exception $e) {
                $this->_getUserDataFromBase();
            }
        }
    }
    
    private function _initBot()
    {
        $this->_data = array();
        $this->_data['id'] = 0;
        $this->_data['login'] = '[SystemBot]';
        $this->_data['sex'] = 1;
        $this->_data['group'] = 9;
        $this->_data['color_login'] = '';
    }

    private function _initGuest()
    {
        $this->_data = array();
        $this->_data['id'] = false;
        $this->_data['sex'] = 1;
        $this->_data['group'] = 0;
    }

    protected function _getUserDataFromBase()
    {
        $this->_initGuest();
        
        $res = Db::me()->prepare("SELECT * FROM `users` WHERE `id_vk` = :id_user LIMIT 1");
        $res->execute(array(':id_user' => $this->_id_vk));
        $data = $res->fetch();
        if (!$data) {
            $this->_data['login'] = '[[Удален]]';
            return;
        }
        $this->_data = $data;

        $this->_id = $data['id'];

        $this->_saveUserDataToCache();
    }
    
    protected function _getUserDataFromCache()
    {
        $data = Cache::get('User.'.$this->_id_vk, false);
        if (!$data) {
            throw new Exception('Не удалось получить данные пользователя ');
        }
        $this->_data = $data;
    }
    
    protected function _saveUserDataToCache()
    {
        Cache::set('User.'.$this->_id, $this->_data, 10);
    }

    public function getUser()
    {
        return $this->_data;
    }

    public function addNotification($type, $params = [], $vk_send = true)
    {
        if(!$this->_data['set_notifications'] || !$this->_data['set_notifi_' . $type]) {
            return [];
        }

        $notifications = [
            "items" => [],
            "new" => 0
        ];

        if($this->_data['notifications']) {
            $notifications = Json::decode($this->_data['notifications']);
        }

        if (count($notifications['items']) >= 20) {
            array_pop($notifications['items']);
        }

        $params['time'] = TIME;

        array_unshift($notifications['items'], $params);

        $notifications['new'] += 1;

        $this->_update['notifications'] = Json::encode($notifications);
        $this->_data['notifications'] = $this->_update['notifications'];

        // Не отпровлять в ВК
        if(!$vk_send) {
            return [];
        }

        $request_params = array(
            'user_ids' => $this->_id_vk,
            'message' => $params['text'],
            'fragment' => $params['hash']? $params['hash'] : "",
            'v' => V_API,
            'access_token' => SERVER_KEY
        );
        $get_params = http_build_query($request_params);
        $result = json_decode(file_get_contents('https://api.vk.com/method/notifications.sendMessage?'. $get_params));

        return $result;
    }


    /**
     * @param string $n ключ
     * @return mixed значение
     */
    function __get($n)
    {
        switch ($n) {
            case 'online' :
                return (bool)($this->_data ['last_visit'] > TIME - SESSION_LIFE_TIME);
            case 'login' :
                if($this->_data ['color_login']) {
                    return '<span style="color: '.$this->_data ['color_login'].'">' . $this->_data ['login'] . '</span>';
                }
                return $this->_data ['login'];
            case 'nick' :
                return $this->_data ['login'];
            default :
                return !isset($this->_data [$n]) ? false : $this->_data [$n];
        }
    }

    /**
     * @param string $n ключ
     * @param string $v значение
     */
    function __set($n, $v)
    {
        if (empty($this->_data['id']))
            return;
        switch ($n) {
            case 'theme' :
                $n .= "sdd";
                break;
        }

        if (isset($this->_data[$n])) {
            $this->_data[$n] = $v;
            $this->_update[$n] = $v;
        }
    }

    public function saveData()
    {
        if ($this->_update) {
            $sql = array();
            foreach ($this->_update as $key => $value) {
                $sql[] = "`" . $key . "` = " . Db::me()->quote($value);
            }
            Db::me()->query("UPDATE `users` SET " . implode(', ', $sql) . " WHERE `id` = '" . $this->_data['id'] . "' LIMIT 1");
            $this->_update = array();
        }
    }

    function __destruct()
    {
        $this->saveData();
    }

}