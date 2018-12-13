import * as types from '../actions/types/vkActionTypes';

export default function vkReducer(state = {}, action) {
    switch (action.type) {
        case types.VK_GET_ACCESS_TOKEN_FETCHED:
            return Object.assign({}, state, {accessToken: action.payload});
        case types.VK_GET_ACCESS_TOKEN_FAILED:
            return Object.assign({}, state, {accessToken: action.payload});
        case types.VK_USER_INFO_FETCHED:
            return Object.assign({}, state, {user: action.payload});
        case types.VK_GET_PHONE_NUMBER:
            return Object.assign({}, state, {
                phoneNumber: action.payload['phone_number'],
                signPhoneNumber: action.payload['sign']
            });
        case types.VK_GET_EMAIL:
            return Object.assign({}, state, {
                email: action.payload['email'],
                signEmail: action.payload['sign']
            });
        default:
            return state;
    }
}

export function getAccessToken(state) {
    return state.vk.accessToken;
}