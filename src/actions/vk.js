import VKConnect from '../utils/VKConnect';

import * as types from './types/vkActionTypes';
import * as userActions from "./user";

import axios from '../utils/axios';




const API_VERSION = '5.85';

function getNewRequestId() {
    if(process.env.NODE_ENV === 'production') {
        return (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString();
    } else {
        return "111"
    }
}

export function initApp() {
    return async (dispatch) => {
        VKConnect.subscribe(e => {
            let vkEvent = e.detail;

            if (!vkEvent) {
                console.error('invalid event', e);
                return;
            }

            let type = vkEvent['type'];
            let data = vkEvent['data'];

            switch (type) {
                case 'VKWebAppGetPhoneNumberResult':
                    dispatch({
                        type: types.VK_GET_PHONE_NUMBER,
                        payload: data
                    });
                    break;
                case 'VKWebAppGetPhoneNumberFailed':
                    dispatch({
                        type: types.VK_GET_PHONE_NUMBER,
                        payload: {
                            "phone_number": "",
                            "sign": ""
                        }
                    });
                    break;

                case 'VKWebAppGetEmailResult':
                    dispatch({
                        type: types.VK_GET_EMAIL,
                        payload: data
                    });
                    break;
                case 'VKWebAppGetEmailFailed':
                    dispatch({
                        type: types.VK_GET_EMAIL,
                        payload: {
                            "email": "",
                            "sign": ""
                        }
                    });
                    break;

                case 'VKWebAppAllowNotificationsResult':
                    dispatch(userActions.userUpdate({
                        set_notifications: 1
                    }));

                    axios.get("/api/set_notifications.php", {
                        params: {
                            type: "all",
                            set: 1
                        }
                    }).then(res => {
                        console.log(res);
                    }).catch(error => {
                        console.log(error);
                    });
                    break;

                case 'VKWebAppDenyNotificationsResult':
                    dispatch(userActions.userUpdate({
                        set_notifications: 0
                    }));

                    axios.get("/api/set_notifications.php", {
                        params: {
                            type: "all",
                            set: 0
                        }
                    }).then(res => {
                        console.log(res);
                    }).catch(error => {
                        console.log(error);
                    });
                    break;

                default:
                //nop;
            }
        });

        VKConnect.send('VKWebAppInit', {});
    }
}




export function apiRequest(method, params = {}, accessToken = '', successCallback = undefined, errorCallback = undefined) {
    let requestId = getNewRequestId();
    if (successCallback !== undefined || errorCallback !== undefined) {
        let clb = function callback(e) {
            let vkEvent = e.detail;
            if (!vkEvent) {
                console.error('invalid event', e);
                return;
            }

            let type = vkEvent['type'];
            let data = vkEvent['data'];

            let found = false;
            if ('VKWebAppCallAPIMethodResult' === type && data['request_id'] === requestId) {
                if (successCallback !== undefined) {
                    successCallback(data['response']);
                }

                found = true;
            } else if ('VKWebAppCallAPIMethodFailed' === type && data['request_id'] === requestId) {
                if (errorCallback !== undefined) {
                    errorCallback(data);
                }

                found = true;
            }

            if (found) {
                VKConnect.unsubscribe(clb);
            }

        };

        VKConnect.subscribe(clb);
    }

    params['access_token'] = accessToken;

    if (params['v'] === undefined) {
        params['v'] = API_VERSION;
    }


    VKConnect.send('VKWebAppCallAPIMethod', {
        'method': method,
        'params': params,
        'request_id': requestId
    });
}


export function fetchPhoneNumber() {
    VKConnect.send('VKWebAppGetPhoneNumber', {});
}

export function fetchEmail() {
    VKConnect.send('VKWebAppGetEmail', {});
}


export function denyNotifications() {
    VKConnect.send('VKWebAppDenyNotifications', {});
}

export function allowNotifications() {
    VKConnect.send('VKWebAppAllowNotifications', {});
}