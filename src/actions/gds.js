import * as types from './types/gdsActionTypes';

export function gdsLoad(name) {
    return {
        type: types.GDS_LOAD,
        payload: name
    }
}

export function gdsUpdate(name) {
    return {
        type: types.GDS_UPDATE,
        payload: name
    }
}