import * as types from '../actions/types/vkActionTypes';

export default function vkReducer(state = {}, action) {
    switch (action.type) {
        case types.VK_GET_ACCESS_TOKEN_FETCHED:
            return Object.assign({}, state, {accessToken: action.payload});
        case types.VK_GET_ACCESS_TOKEN_FAILED:
            return Object.assign({}, state, {accessToken: action.payload});
        default:
            return state;
    }
}