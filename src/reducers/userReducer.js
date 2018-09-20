import * as typesUser from '../actions/types/userActionTypes';

export default function userReducer(state = {}, action) {
    switch (action.type) {
        case typesUser.USER_LOAD:
            return action.payload;
        case typesUser.USER_UPDATE:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}