import * as typesUser from './types/userActionTypes';

export function userLoad(name) {
    return {
        type: typesUser.USER_LOAD,
        payload: name
    }
}

export function userUpdate(name) {
    return {
        type: typesUser.USER_UPDATE,
        payload: name
    }
}