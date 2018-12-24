import VKConnectMock, { response as res } from '@vkontakte/vkui-connect-mock';
import VKConnectReal from '@vkontakte/vkui-connect';

import mockMethod from './vkconnectMethods';

let VKConnect = null;

if(process.env.NODE_ENV === 'production') {
    VKConnect = VKConnectReal;
} else {
    VKConnect = VKConnectMock;

    let subscribers = [];

    let VKConnectClon = Object.assign({}, VKConnect);

    VKConnect.send = function (name, param = {}) {
        if("VKWebAppCallAPIMethod" === name && param.method) {
            res.VKWebAppCallAPIMethod.data = {
                type: 'VKWebAppCallAPIMethodResult',
                "data": {
                    "request_id": "111",
                    "response": mockMethod(param.method, param['params'])
                }
            };
        }

        if("VKWebAppAllowNotifications" === name) {
            subscribers.forEach((fn) => {
                fn({
                    detail: {
                        "type": "VKWebAppAllowNotificationsResult",
                        "data": {
                            "enabled": true
                        }
                    }
                });
            });

            return;
        }
        if("VKWebAppDenyNotifications" === name) {
            subscribers.forEach((fn) => {
                fn({
                    detail: {
                        "type": "VKWebAppDenyNotificationsResult",
                        "data": {
                            "disabled": true
                        }
                    }
                });
            });

            return;
        }
        if("VKWebAppScroll" === name) {
            let id = setTimeout(() => {
                window.scrollTo(0, param.top);

                clearTimeout(id);
            }, 500);

            return;
        }

        if("VKWebAppSetViewSettings" === name) {
            return;
        }


        VKConnectClon.send(name, param);
    };

    VKConnect.subscribe = function (fn) {
        subscribers.push(fn);

        VKConnectClon.subscribe(fn);
    };

    res.VKWebAppGetAuthToken.data = {
        "type": "VKWebAppAccessTokenReceived",
        "data": {
            "access_token": "cc9521551d93ddb290b32648a37a006d87438a67f953dd37e564eb6db1ec28f79d05c16e207f00a623ef0"
        }
    };

    res.VKWebAppGetUserInfo.data = {
        type: 'VKWebAppGetUserInfoResult',
        "data": {
            "signed_user_id": "8XrKmfy5IswgzGx8aCpX8xGc2h72TOAwofr2CsQeyEg",
            "id": 30333918,
            "first_name": "Сергей",
            "last_name": "Качалка",
            "sex": 2,
            "city": {
                "id": 2256,
                "title": "Горловка"
            },
            "country": {
                "id": 2,
                "title": "Украина"
            },
            "photo_100": "https://sun1-5.userapi.com/c834304/v834304001/101214/WVtscxWYlCI.jpg?ava=1",
            "photo_200": "https://sun1-11.userapi.com/c834304/v834304001/101213/g7TwDpG11dM.jpg?ava=1",
            "timezone": 3
        }
    };

    res.VKWebAppGetPhoneNumber.data = {
        "type": "VKWebAppGetPhoneNumberResult",
        "data": {
            "sign": "OBV9VrMcpifI6SfqW-9rWmXVVypSi6ZDXzjoxZToLeA",
            "phone_number": "79111234567"
        }
    };

    res.VKWebAppGetEmail.data = {
        "type": "VKWebAppGetEmailResult",
        "data": {
            "sign": "CAyEfFssgSpsO7wMh6c-hKLOfbpbu9Ie44e_mE6g59E",
            "email": "test@gmail.com"
        }
    };

    res.VKWebAppGetClientVersion.data = {
        "type": "VKWebAppGetClientVersionResult",
        "data": {
            "platform": "android",
            "version": "5.23"
        }
    };

}

export default VKConnect;