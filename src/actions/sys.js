import * as types from './types/sysActionTypes';

export function setActive(name) {
    return async (dispatch) => {
        dispatch({
            type: types.SYS_SET_ACTIVE,
            payload: name,
        });
    }
}

export function setPopout(name) {
    return async (dispatch) => {
        dispatch({
            type: types.SYS_SET_POPOUT,
            payload: name,
        });
    }
}

export function setRefresh(name) {
    return {
        type: types.SYS_SET_REFRESH,
        payload: name,
    }
}