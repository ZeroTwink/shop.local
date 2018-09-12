import VKConnect from '@vkontakte/vkui-connect';
import * as types from './types/vkActionTypes';

// import VKConnect, { response as res } from '@vkontakte/vkui-connect-mock';
//
// res.VKWebAppGetAuthToken.data = {
//     "type": "VKWebAppAccessTokenReceived",
//     "data": {
//         "access_token": "cc9521551d93ddb290b32648a37a006d87438a67f953dd37e564eb6db1ec28f79d05c16e207f00a623ef0"
//     }
// };



const API_VERSION = '5.85';


function getNewRequestId() {
    return (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString();
}



export function initApp() {
    return async (dispatch) => {
        VKConnect.subscribe(e => {
            let vkEvent = e.detail;

            console.log(e);
            if (!vkEvent) {
                console.error('invalid event', e);
                return;
            }

            let type = vkEvent['type'];
            let data = vkEvent['data'];

            switch (type) {
                case 'VKWebAppAllowNotificationsResult':
                    dispatch({
                        type: types.VK_NOTIFICATION_STATUS_FETCHED,
                        notificationStatus: true,
                    });
                    break;

                case 'VKWebAppAccessTokenReceived':
                    dispatch({
                        type: types.VK_GET_ACCESS_TOKEN_FETCHED,
                        payload: data['access_token']
                    });
                    break;

                case 'VKWebAppAccessTokenFailed':
                    dispatch({
                        type: types.VK_GET_ACCESS_TOKEN_FAILED,
                        payload: data['error_type'] + " - " + JSON.stringify(data)
                    });
                    break;

                default:
                //nop;
            }
        });

        VKConnect.send('VKWebAppInit', {});
    }
}




function apiRequest(method, params = {}, accessToken = '', successCallback = undefined, errorCallback = undefined) {
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





export function denyNotifications() {
    return async () => {
        VKConnect.send('VKWebAppDenyNotifications', {});
    }
}

export function allowNotifications() {
    return async () => {
        VKConnect.send('VKWebAppAllowNotifications', {});
    }
}

/**
 * Получения токена
 * @param scope строка с правами доступа "notify,friends"
 * @returns {function()}
 */
export function fetchAccessToken(scope = "offline") {
    return async () => {
        VKConnect.send('VKWebAppGetAuthToken', {'app_id': 6689902, "scope": scope});
    }
}